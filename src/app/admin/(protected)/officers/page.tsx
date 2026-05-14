import { addOfficer, deleteOfficer } from "../actions";
import { AdminAddCard } from "@/components/admin/AdminAddCard";
import {
  adminDestructiveLinkClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminOfficersPage() {
  const { data: officers } = await getSupabaseAdmin()
    .from("officers")
    .select("id, name, title, sort_order")
    .order("sort_order", { ascending: true });

  const rows = officers ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Officers
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Listed on the public About page. Update when roles change.
      </p>

      <ul className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {rows.length === 0 ? (
          <li className="px-5 py-6 text-sm text-muted-foreground">
            No officers yet — add one below.
          </li>
        ) : (
          rows.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="font-medium text-foreground">{o.name}</p>
                <p className="text-sm text-muted-foreground">{o.title}</p>
              </div>
              <form action={deleteOfficer}>
                <input type="hidden" name="id" value={o.id} />
                <button type="submit" className={adminDestructiveLinkClass}>
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <AdminAddCard title="Add officer" defaultOpen={rows.length === 0}>
        <form action={addOfficer} className="max-w-md space-y-4">
          <div>
            <label htmlFor="name" className={adminLabelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="title" className={adminLabelClass}>
              Title / role
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. President, Secretary"
              className={adminInputClass}
            />
          </div>
          <button type="submit" className={adminPrimaryButtonClass}>
            Add officer
          </button>
        </form>
      </AdminAddCard>
    </div>
  );
}
