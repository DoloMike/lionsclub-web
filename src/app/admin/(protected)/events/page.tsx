import { addChapterEvent, deleteChapterEvent } from "../actions";
import { AdminAddCard } from "@/components/admin/AdminAddCard";
import {
  adminDestructiveLinkClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminChapterEventsPage() {
  const { data: events } = await getSupabaseAdmin()
    .from("chapter_events")
    .select("id, title, event_date, description")
    .order("event_date", { ascending: true });

  const rows = events ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Public events
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Shown on the Events page. Add parades, screenings, fundraisers, and
        chapter meetings you want visitors to see.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No events yet"
            description="Use the form below to add the chapter's next parade, screening, meeting, or fundraiser."
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {rows.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="font-medium text-foreground">{ev.title}</p>
                <p className="text-sm text-muted-foreground">{ev.event_date}</p>
                {ev.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ev.description}
                  </p>
                ) : null}
              </div>
              <form action={deleteChapterEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <button type="submit" className={adminDestructiveLinkClass}>
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <AdminAddCard title="Add event" defaultOpen={rows.length === 0}>
        <form action={addChapterEvent} className="max-w-md space-y-4">
          <div>
            <label htmlFor="title" className={adminLabelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="event_date" className={adminLabelClass}>
              Date
            </label>
            <input
              id="event_date"
              name="event_date"
              type="date"
              required
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="description" className={adminLabelClass}>
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={adminInputClass}
            />
          </div>
          <button type="submit" className={adminPrimaryButtonClass}>
            Add event
          </button>
        </form>
      </AdminAddCard>
    </div>
  );
}
