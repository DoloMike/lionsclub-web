import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/get-session";
import { getFundraiserBannerSegments } from "@/lib/data/fundraiser-banner";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionProfile();
  if (!session) {
    return NextResponse.json({ segments: [] }, { status: 401 });
  }

  const segments = await getFundraiserBannerSegments(session);
  return NextResponse.json({ segments });
}
