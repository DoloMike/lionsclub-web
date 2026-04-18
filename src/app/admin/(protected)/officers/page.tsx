import { addOfficer, deleteOfficer } from "../actions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminOfficersPage() {
  const { data: officers } = await getSupabaseAdmin()
    .from("officers")
    .select("id, name, title, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Officers
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Listed on the public About page. Update when roles change.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {(officers ?? []).length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            No officers yet — add one below.
          </li>
        ) : (
          (officers ?? []).map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{o.name}</p>
                <p className="text-sm text-muted-foreground">{o.title}</p>
              </div>
              <form action={deleteOfficer}>
                <input type="hidden" name="id" value={o.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-destructive hover:underline"
                >
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={addOfficer} className="mt-10 max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Add officer</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title / role
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. President, Secretary"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Add
        </button>
      </form>
    </div>
  );
}
