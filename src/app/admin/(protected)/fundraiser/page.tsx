import Link from "next/link";
import {
  addFundraiserEvent,
  toggleFundraiserOrderOpen,
  updateFundraiserEvent,
} from "../actions";
import { AdminAddCard } from "@/components/admin/AdminAddCard";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import {
  isBeforePickupDay,
  isOrderingDeadlinePassed,
} from "@/lib/fundraiser-dates";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type FundraiserStatus = "open" | "deadline_passed" | "closed";

function deriveFundraiserStatus(
  ev: { order_open: boolean; event_date: string | null; orders_close_date: string | null },
  tz: string,
): FundraiserStatus {
  const nowMs = Date.now();
  const deadlinePassed = Boolean(
    ev.orders_close_date &&
      isOrderingDeadlinePassed(
        { orders_close_at: null, orders_close_date: ev.orders_close_date },
        nowMs,
        tz,
      ),
  );
  const beforePickup = Boolean(
    ev.event_date && isBeforePickupDay(ev.event_date, tz),
  );
  if (ev.order_open && beforePickup && !deadlinePassed) return "open";
  if (ev.order_open && deadlinePassed) return "deadline_passed";
  return "closed";
}

export default async function AdminFundraiserPage() {
  const { data: events } = await getSupabaseAdmin()
    .from("fundraiser_events")
    .select(
      "id, title, slug, description, event_date, orders_close_date, pickup_location, pickup_notes, price_cents_per_unit, max_units_per_order, inventory_units, order_open, created_at"
    )
    .order("event_date", { ascending: true });

  const tz = env.siteTimezone;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Chicken / fundraisers
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Add cooks and set pickup date, order deadline (calendar day), price,
        location, and inventory. Toggle whether online ordering is open. Orders
        are saved only after Stripe payment. Exact times (e.g. Monday noon) live
        on optional timestamp columns—use Supabase or a migration if you need
        more precision than a single date.
      </p>

      <ul className="mt-8 space-y-10">
        {(events ?? []).length === 0 ? (
          <li className="rounded-lg border border-border px-4 py-6 text-sm text-muted-foreground">
            No fundraiser rows yet — add one below.
          </li>
        ) : (
          (events ?? []).map((ev) => {
            const status = deriveFundraiserStatus(ev, tz);
            return (
              <li
                key={ev.id}
                className={`rounded-lg border bg-card p-4 shadow-sm ${
                  status === "deadline_passed"
                    ? "border-destructive/60 ring-2 ring-destructive/30"
                    : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      slug: {ev.slug}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {status === "open" ? (
                        <span className="font-medium text-success">
                          Ordering open
                        </span>
                      ) : status === "deadline_passed" ? (
                        <span className="font-medium text-destructive">
                          Ordering open — deadline passed
                        </span>
                      ) : (
                        <span className="font-medium text-warning">
                          Ordering closed
                        </span>
                      )}
                      {" · "}
                      {formatUsd(ev.price_cents_per_unit)} each · max{" "}
                      {ev.max_units_per_order} / order
                      {ev.inventory_units != null
                        ? ` · cap ${ev.inventory_units} units`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/fundraiser/${ev.id}/stats`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
                    >
                      Orders &amp; stats ↗
                    </Link>
                    <form action={toggleFundraiserOrderOpen}>
                      <input type="hidden" name="id" value={ev.id} />
                      <input
                        type="hidden"
                        name="order_open"
                        value={ev.order_open ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        {ev.order_open ? "Close ordering" : "Open ordering"}
                      </button>
                    </form>
                  </div>
                </div>

                <details open={status !== "closed"} className="group mt-6">
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
                    aria-label={`Toggle edit form for ${ev.title}`}
                  >
                    <span>Edit fundraiser</span>
                    <svg
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 5l6 5-6 5"
                      />
                    </svg>
                  </summary>

                  <form
                    action={updateFundraiserEvent}
                    className="mt-4 space-y-6"
                  >
                    <input type="hidden" name="id" value={ev.id} />
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href="/fundraising"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Preview public fundraising page ↗
                      </Link>
                    </div>

                    <section className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Basics
                  </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Title
                    </label>
                    <input
                      name="title"
                      defaultValue={ev.title}
                      required
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Slug (URL key)
                    </label>
                    <input
                      name="slug"
                      defaultValue={ev.slug}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={ev.description ?? ""}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                </section>

                <section className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Schedule
                  </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Pickup / cook date
                    </label>
                    <input
                      name="event_date"
                      type="date"
                      required
                      defaultValue={ev.event_date ?? ""}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Order deadline (last day to order)
                    </label>
                    <input
                      name="orders_close_date"
                      type="date"
                      required
                      defaultValue={ev.orders_close_date ?? ""}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Must be on or before pickup date.
                    </p>
                  </div>
                </div>
                </section>

                <section className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pickup
                  </p>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Pickup location
                  </label>
                  <input
                    name="pickup_location"
                    defaultValue={ev.pickup_location ?? ""}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Pickup notes
                  </label>
                  <textarea
                    name="pickup_notes"
                    rows={2}
                    defaultValue={ev.pickup_notes ?? ""}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                </section>

                <section className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Commerce &amp; limits
                  </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Price (cents / unit)
                    </label>
                    <input
                      name="price_cents_per_unit"
                      type="number"
                      min={1}
                      required
                      defaultValue={ev.price_cents_per_unit}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      e.g. 1300 = $13.00
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Max units / order
                    </label>
                    <input
                      name="max_units_per_order"
                      type="number"
                      min={1}
                      required
                      defaultValue={ev.max_units_per_order}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Inventory cap (units)
                    </label>
                    <input
                      name="inventory_units"
                      type="number"
                      min={0}
                      placeholder="empty = unlimited"
                      defaultValue={ev.inventory_units ?? ""}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                </section>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 active:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Save changes
                </button>
              </form>
                </details>
              </li>
            );
          })
        )}
      </ul>

      <AdminAddCard
        title="Add fundraiser"
        defaultOpen={(events ?? []).length === 0}
      >
        <form action={addFundraiserEvent} className="max-w-2xl space-y-4">
          <div>
            <label htmlFor="new_title" className={adminLabelClass}>
              Title
            </label>
            <input
              id="new_title"
              name="title"
              required
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="new_description" className={adminLabelClass}>
              Description
            </label>
            <textarea
              id="new_description"
              name="description"
              rows={2}
              className={adminInputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new_event_date" className={adminLabelClass}>
                Pickup / cook date
              </label>
              <input
                id="new_event_date"
                name="event_date"
                type="date"
                required
                className={adminInputClass}
              />
            </div>
            <div>
              <label htmlFor="new_orders_close" className={adminLabelClass}>
                Order deadline (last day to order)
              </label>
              <input
                id="new_orders_close"
                name="orders_close_date"
                type="date"
                required
                className={adminInputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new_price" className={adminLabelClass}>
              Price (cents / unit)
            </label>
            <input
              id="new_price"
              name="price_cents_per_unit"
              type="number"
              min={1}
              required
              placeholder="1300"
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="new_pickup_location" className={adminLabelClass}>
              Pickup location
            </label>
            <input
              id="new_pickup_location"
              name="pickup_location"
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="new_pickup_notes" className={adminLabelClass}>
              Pickup notes
            </label>
            <textarea
              id="new_pickup_notes"
              name="pickup_notes"
              rows={2}
              className={adminInputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new_max" className={adminLabelClass}>
                Max units / order
              </label>
              <input
                id="new_max"
                name="max_units_per_order"
                type="number"
                min={1}
                defaultValue={20}
                className={adminInputClass}
              />
            </div>
            <div>
              <label htmlFor="new_inv" className={adminLabelClass}>
                Inventory cap (optional)
              </label>
              <input
                id="new_inv"
                name="inventory_units"
                type="number"
                min={0}
                placeholder="empty = unlimited"
                className={adminInputClass}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="order_open"
              className="rounded border-border"
            />
            Open for ordering immediately
          </label>
          <button type="submit" className={adminPrimaryButtonClass}>
            Add fundraiser
          </button>
        </form>
      </AdminAddCard>
    </div>
  );
}
