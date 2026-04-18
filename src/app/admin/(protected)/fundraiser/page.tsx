import Link from "next/link";
import {
  addFundraiserEvent,
  toggleFundraiserOrderOpen,
  updateFundraiserEvent,
} from "../actions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminFundraiserPage() {
  const { data: events } = await getSupabaseAdmin()
    .from("fundraiser_events")
    .select(
      "id, title, slug, description, event_date, orders_close_date, pickup_location, pickup_notes, price_cents_per_unit, max_units_per_order, inventory_units, order_open, created_at"
    )
    .order("event_date", { ascending: true });

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
          (events ?? []).map((ev) => (
            <li
              key={ev.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">
                    slug: {ev.slug}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {ev.order_open ? (
                      <span className="font-medium text-success">Ordering open</span>
                    ) : (
                      <span className="font-medium text-warning">Ordering closed</span>
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
                    className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Orders &amp; stats
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

              <form action={updateFundraiserEvent} className="mt-6 space-y-6">
                <input type="hidden" name="id" value={ev.id} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Edit fundraiser
                  </h3>
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
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Save changes
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={addFundraiserEvent} className="mt-12 max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Add fundraiser
        </h2>
        <div>
          <label htmlFor="new_title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="new_title"
            name="title"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new_description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="new_description"
            name="description"
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new_event_date" className="block text-sm font-medium">
              Pickup / cook date
            </label>
            <input
              id="new_event_date"
              name="event_date"
              type="date"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="new_orders_close"
              className="block text-sm font-medium"
            >
              Order deadline (last day to order)
            </label>
            <input
              id="new_orders_close"
              name="orders_close_date"
              type="date"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="new_price" className="block text-sm font-medium">
            Price (cents / unit)
          </label>
          <input
            id="new_price"
            name="price_cents_per_unit"
            type="number"
            min={1}
            required
            placeholder="1300"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new_pickup_location" className="block text-sm font-medium">
            Pickup location
          </label>
          <input
            id="new_pickup_location"
            name="pickup_location"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new_pickup_notes" className="block text-sm font-medium">
            Pickup notes
          </label>
          <textarea
            id="new_pickup_notes"
            name="pickup_notes"
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new_max" className="block text-sm font-medium">
              Max units / order
            </label>
            <input
              id="new_max"
              name="max_units_per_order"
              type="number"
              min={1}
              defaultValue={20}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new_inv" className="block text-sm font-medium">
              Inventory cap (optional)
            </label>
            <input
              id="new_inv"
              name="inventory_units"
              type="number"
              min={0}
              placeholder="empty = unlimited"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="order_open" className="rounded border-border" />
          Open for ordering immediately
        </label>
        <button
          type="submit"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Add fundraiser
        </button>
      </form>
    </div>
  );
}
