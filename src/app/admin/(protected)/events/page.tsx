import { addChapterEvent, deleteChapterEvent } from "../actions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminChapterEventsPage() {
  const { data: events } = await getSupabaseAdmin()
    .from("chapter_events")
    .select("id, title, event_date, description")
    .order("event_date", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Public events
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Shown on the Events page. Add parades, screenings, fundraisers, and
        chapter meetings you want visitors to see.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {(events ?? []).length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            No events yet — add one below.
          </li>
        ) : (
          (events ?? []).map((ev) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-start justify-between gap-4 px-4 py-4"
            >
              <div>
                <p className="font-medium text-foreground">{ev.title}</p>
                <p className="text-sm text-muted-foreground">
                  {ev.event_date}
                </p>
                {ev.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ev.description}
                  </p>
                ) : null}
              </div>
              <form action={deleteChapterEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Delete
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={addChapterEvent} className="mt-10 max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Add event</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium">
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Add event
        </button>
      </form>
    </div>
  );
}
