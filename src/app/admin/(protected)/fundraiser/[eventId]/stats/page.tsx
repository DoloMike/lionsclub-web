import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  computeFundraiserAggregates,
  getChickenOrdersForEventAdmin,
  getFundraiserEventForAdmin,
} from "@/lib/data/fundraiser-admin-stats";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getFundraiserEventForAdmin(eventId);
  return {
    title: event ? `${event.title} — stats` : "Fundraiser stats",
  };
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function FundraiserStatsPage({ params }: Props) {
  const { eventId } = await params;

  const event = await getFundraiserEventForAdmin(eventId);
  if (!event) notFound();

  const orders = await getChickenOrdersForEventAdmin(eventId);
  const stats = computeFundraiserAggregates(orders, event.inventory_units);

  return (
    <div>
      <Eyebrow>
        <Link
          href="/admin/fundraiser"
          className="text-primary underline-offset-4 hover:underline"
        >
          Fundraisers
        </Link>
        <span aria-hidden> · </span>
        Stats
      </Eyebrow>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cook day: {event.event_date ?? "—"} · slug:{" "}
            <span className="font-mono text-xs">{event.slug}</span>
          </p>
        </div>
        <a
          href={`/api/admin/fundraiser/${event.id}/orders-csv`}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground shadow-sm transition hover:bg-muted"
        >
          Download orders CSV
        </a>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
        Totals exclude cancelled orders. Money raised is the sum of line totals
        for paid (and other non-cancelled) orders.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Orders
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.orderCount}
          </p>
          {stats.cancelledOrderCount > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.cancelledOrderCount} cancelled (excluded above)
            </p>
          ) : null}
        </li>
        <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Chickens sold
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.chickensSold}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            units ({formatUsd(event.price_cents_per_unit)} / unit list price)
          </p>
        </li>
        <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Money raised
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {formatUsd(stats.totalCents)}
          </p>
          {stats.averageOrderCents != null ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Avg order {formatUsd(stats.averageOrderCents)}
            </p>
          ) : null}
        </li>
        <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inventory
          </p>
          {event.inventory_units != null ? (
            <>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {stats.inventoryRemaining ?? 0} left
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                of {event.inventory_units} cap · {stats.chickensSold} allocated
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No unit cap set for this event.
            </p>
          )}
        </li>
      </ul>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">All orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No orders recorded yet for this fundraiser.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 font-semibold text-foreground">
                    Customer
                  </th>
                  <th className="px-3 py-2 font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-3 py-2 font-semibold text-foreground">Qty</th>
                  <th className="px-3 py-2 font-semibold text-foreground">
                    Total
                  </th>
                  <th className="px-3 py-2 font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/80">
                    <td className="px-3 py-2 text-foreground">
                      {o.customer_name?.trim() || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {o.customer_email}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-foreground">
                      {o.quantity}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-foreground">
                      {formatUsd(o.total_cents)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {o.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
