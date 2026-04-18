import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/get-session";
import {
  buildChickenOrdersCsv,
  getChickenOrdersForEventAdmin,
  getFundraiserEventForAdmin,
} from "@/lib/data/fundraiser-admin-stats";

function safeFilenamePart(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "fundraiser";
}

type RouteParams = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSessionAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const event = await getFundraiserEventForAdmin(eventId);
  if (!event) {
    return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  }

  const orders = await getChickenOrdersForEventAdmin(eventId);
  const csv = "\uFEFF" + buildChickenOrdersCsv(orders);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `chicken-orders-${safeFilenamePart(event.slug)}-${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
