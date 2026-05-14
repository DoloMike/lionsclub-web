import {
  addSocialLink,
  deleteSocialLink,
  updateSocialLink,
} from "../actions";
import { AdminAddCard } from "@/components/admin/AdminAddCard";
import {
  adminDestructiveLinkClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminPrimaryButtonCompactClass,
} from "@/components/admin/admin-form-styles";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ICON_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "blog", label: "Blog / news" },
  { value: "link", label: "Generic link" },
] as const;

export default async function AdminSocialPage() {
  const { data: links } = await getSupabaseAdmin()
    .from("social_links")
    .select("id, label, url, icon_key, sort_order")
    .order("sort_order", { ascending: true });

  const rows = links ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Social links
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Shown in the site footer under Contact. Use full URLs (https://…).
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          No links yet — add one below (or run the latest DB migration to seed
          defaults).
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <form action={updateSocialLink} className="space-y-3">
                <input type="hidden" name="id" value={row.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>Label</label>
                    <input
                      name="label"
                      required
                      defaultValue={row.label}
                      className={adminInputClass}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Icon</label>
                    <select
                      name="icon_key"
                      defaultValue={row.icon_key}
                      className={adminInputClass}
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={adminLabelClass}>URL</label>
                  <input
                    name="url"
                    type="url"
                    required
                    defaultValue={row.url}
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className={adminPrimaryButtonCompactClass}
                  >
                    Save
                  </button>
                </div>
              </form>
              <form
                action={deleteSocialLink}
                className="mt-4 border-t border-border pt-3"
              >
                <input type="hidden" name="id" value={row.id} />
                <button type="submit" className={adminDestructiveLinkClass}>
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <AdminAddCard title="Add social link" defaultOpen={rows.length === 0}>
        <form action={addSocialLink} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="new-label" className={adminLabelClass}>
              Label
            </label>
            <input
              id="new-label"
              name="label"
              required
              placeholder="e.g. Chapter Facebook"
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="new-icon" className={adminLabelClass}>
              Icon
            </label>
            <select
              id="new-icon"
              name="icon_key"
              defaultValue="link"
              className={adminInputClass}
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-url" className={adminLabelClass}>
              URL
            </label>
            <input
              id="new-url"
              name="url"
              type="url"
              required
              placeholder="https://"
              className={adminInputClass}
            />
          </div>
          <button type="submit" className={adminPrimaryButtonClass}>
            Add link
          </button>
        </form>
      </AdminAddCard>
    </div>
  );
}
