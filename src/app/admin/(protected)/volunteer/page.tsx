import Link from "next/link";
import {
  addVolunteerEvent,
  addVolunteerShift,
  deleteVolunteerEvent,
  deleteVolunteerShift,
  deleteVolunteerSignup,
  toggleVolunteerEventPublished,
  toggleVolunteerEventSignupsOpen,
  updateVolunteerEvent,
  updateVolunteerShift,
} from "../actions";
import { AdminAddCard } from "@/components/admin/AdminAddCard";
import {
  adminDestructiveLinkClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllVolunteerEventsForAdmin } from "@/lib/data/volunteer-signups";
import {
  formatShiftDateLabel,
  type VolunteerEventWithShifts,
  type VolunteerShiftWithSignups,
} from "@/lib/volunteer-signups";

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 5l6 5-6 5" />
    </svg>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"
          : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function ShiftCard({
  shift,
  eventSlug,
}: {
  shift: VolunteerShiftWithSignups;
  eventSlug: string;
}) {
  const subtitle = [
    shift.shiftLabel,
    formatShiftDateLabel(shift.shiftDate),
    shift.timeLabel,
  ]
    .filter(Boolean)
    .join(" · ");
  const capacityLabel =
    shift.maxSignups != null
      ? `${shift.signupCount} / ${shift.maxSignups}`
      : `${shift.signupCount}`;

  return (
    <details className="group rounded-lg border border-border bg-background">
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
        aria-label={`Toggle shift on ${formatShiftDateLabel(shift.shiftDate)}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {subtitle || formatShiftDateLabel(shift.shiftDate)}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {capacityLabel} signed up
            {shift.notes ? " · has notes" : ""}
          </span>
        </span>
        <Chevron />
      </summary>

      <div className="space-y-4 border-t border-border px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Signups
          </p>
          {shift.signups.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No names yet.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {shift.signups.map((signup) => (
                <li
                  key={signup.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-1.5 text-sm"
                >
                  <span className="truncate text-foreground">{signup.name}</span>
                  <form action={deleteVolunteerSignup}>
                    <input type="hidden" name="id" value={signup.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-destructive hover:underline"
                      aria-label={`Remove ${signup.name}`}
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form action={updateVolunteerShift} className="space-y-3">
          <input type="hidden" name="id" value={shift.id} />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edit shift
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Date
              </label>
              <input
                name="shift_date"
                type="date"
                required
                defaultValue={shift.shiftDate}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Time label
              </label>
              <input
                name="time_label"
                defaultValue={shift.timeLabel ?? ""}
                placeholder="e.g. 5:00 PM - close"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Shift label (optional)
              </label>
              <input
                name="shift_label"
                defaultValue={shift.shiftLabel ?? ""}
                placeholder="e.g. Booth Setup"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Sort order
                </label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={shift.sortOrder}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Max sign-ups
                </label>
                <input
                  name="max_signups"
                  type="number"
                  min={1}
                  defaultValue={shift.maxSignups ?? ""}
                  placeholder="blank = no cap"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Notes (optional, shown publicly)
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={shift.notes ?? ""}
              maxLength={500}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Save shift
            </button>
            <Link
              href={`/volunteer/${eventSlug}#shift-${shift.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View on public page ↗
            </Link>
          </div>
        </form>

        <form
          action={deleteVolunteerShift}
          className="border-t border-border pt-4"
        >
          <input type="hidden" name="id" value={shift.id} />
          <p className="text-xs text-muted-foreground">
            Deleting a shift also removes every name signed up for it. This
            cannot be undone.
          </p>
          <button type="submit" className={`mt-2 ${adminDestructiveLinkClass}`}>
            Delete this shift
          </button>
        </form>
      </div>
    </details>
  );
}

function EventCard({ event }: { event: VolunteerEventWithShifts }) {
  const detailsOpenDefault = event.published || event.shifts.length === 0;

  return (
    <li
      className={`rounded-lg border bg-card p-5 shadow-sm ${
        event.published ? "border-border" : "border-dashed border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-foreground">{event.title}</p>
          <p className="font-mono text-xs text-muted-foreground">
            /volunteer/{event.slug}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge
              active={event.published}
              activeLabel="Published"
              inactiveLabel="Draft"
            />
            <StatusBadge
              active={event.signupsOpen}
              activeLabel="Signups open"
              inactiveLabel="Signups closed"
            />
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {event.shifts.length}{" "}
              {event.shifts.length === 1 ? "shift" : "shifts"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {event.published ? (
            <Link
              href={`/volunteer/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
            >
              View public page ↗
            </Link>
          ) : null}
          <form action={toggleVolunteerEventPublished}>
            <input type="hidden" name="id" value={event.id} />
            <input
              type="hidden"
              name="published"
              value={event.published ? "false" : "true"}
            />
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {event.published ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={toggleVolunteerEventSignupsOpen}>
            <input type="hidden" name="id" value={event.id} />
            <input
              type="hidden"
              name="signups_open"
              value={event.signupsOpen ? "false" : "true"}
            />
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {event.signupsOpen ? "Close signups" : "Open signups"}
            </button>
          </form>
        </div>
      </div>

      <details open={detailsOpenDefault} className="group mt-5">
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
          aria-label={`Toggle event details for ${event.title}`}
        >
          <span>Edit details</span>
          <Chevron />
        </summary>

        <form action={updateVolunteerEvent} className="mt-3 space-y-4">
          <input type="hidden" name="id" value={event.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Title
              </label>
              <input
                name="title"
                required
                maxLength={120}
                defaultValue={event.title}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Slug (URL key)
              </label>
              <input
                name="slug"
                defaultValue={event.slug}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
              />
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lowercase letters, numbers, and dashes only.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Description (shown above the signup table)
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={event.description ?? ""}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="published"
                defaultChecked={event.published}
                className="rounded border-border"
              />
              Published (visible on the public site)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="signups_open"
                defaultChecked={event.signupsOpen}
                className="rounded border-border"
              />
              Signups open (accepts new names)
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Save changes
          </button>
        </form>
      </details>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Shifts
        </p>
        {event.shifts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No shifts yet — add the first one below.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {event.shifts.map((shift) => (
              <li key={shift.id}>
                <ShiftCard shift={shift} eventSlug={event.slug} />
              </li>
            ))}
          </ul>
        )}

        <details
          open={event.shifts.length === 0}
          className="group mt-4 rounded-lg border border-dashed border-border bg-muted/10"
        >
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
            aria-label="Toggle add-shift form"
          >
            <span>Add a shift</span>
            <Chevron />
          </summary>
          <form
            action={addVolunteerShift}
            className="space-y-3 border-t border-border px-4 py-4"
          >
            <input type="hidden" name="event_id" value={event.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Date
                </label>
                <input
                  name="shift_date"
                  type="date"
                  required
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Time label
                </label>
                <input
                  name="time_label"
                  placeholder="e.g. 5:00 PM - close"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Shift label (optional)
                </label>
                <input
                  name="shift_label"
                  placeholder="e.g. Booth Setup"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Sort order
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={0}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Max sign-ups
                  </label>
                  <input
                    name="max_signups"
                    type="number"
                    min={1}
                    placeholder="blank = no cap"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                maxLength={500}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Add shift
            </button>
          </form>
        </details>
      </div>

      <form
        action={deleteVolunteerEvent}
        className="mt-6 border-t border-border pt-5"
      >
        <input type="hidden" name="id" value={event.id} />
        <p className="text-xs text-muted-foreground">
          Deleting an event removes all shifts and every name signed up. This
          cannot be undone.
        </p>
        <button type="submit" className={`mt-2 ${adminDestructiveLinkClass}`}>
          Delete this event
        </button>
      </form>
    </li>
  );
}

export default async function AdminVolunteerPage() {
  const events = await getAllVolunteerEventsForAdmin();
  const hasAny = events.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Volunteer Sign-ups
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Create signup sheets for volunteer events with one row per shift.
        Publish to make a page live at <span className="font-mono">/volunteer/&lt;slug&gt;</span>{" "}
        and toggle whether new names can be added.
      </p>

      {hasAny ? (
        <ul className="mt-8 space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No volunteer events yet"
            description="Create your first event below — for example a parade prep, screening, or festival booth signup."
          />
        </div>
      )}

      <AdminAddCard title="Add volunteer event" defaultOpen={!hasAny}>
        <form action={addVolunteerEvent} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="new_volunteer_title" className={adminLabelClass}>
                Title
              </label>
              <input
                id="new_volunteer_title"
                name="title"
                required
                maxLength={120}
                placeholder="e.g. Heritage Festival 2027"
                className={adminInputClass}
              />
            </div>
            <div>
              <label htmlFor="new_volunteer_slug" className={adminLabelClass}>
                Slug (optional)
              </label>
              <input
                id="new_volunteer_slug"
                name="slug"
                placeholder="auto-generated from title"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
              />
              <p className="mt-0.5 text-xs text-muted-foreground">
                Used in the URL. Lowercase letters, numbers, and dashes only.
              </p>
            </div>
          </div>
          <div>
            <label
              htmlFor="new_volunteer_description"
              className={adminLabelClass}
            >
              Description (optional)
            </label>
            <textarea
              id="new_volunteer_description"
              name="description"
              rows={3}
              className={adminInputClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="published"
                className="rounded border-border"
              />
              Publish immediately
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="signups_open"
                className="rounded border-border"
              />
              Open for signups immediately
            </label>
          </div>
          <button type="submit" className={adminPrimaryButtonClass}>
            Add event
          </button>
          <p className="text-xs text-muted-foreground">
            After creating the event, add shifts (dates) and toggle{" "}
            <span className="font-medium">Published</span> when you&apos;re
            ready for the public page to go live.
          </p>
        </form>
      </AdminAddCard>
    </div>
  );
}
