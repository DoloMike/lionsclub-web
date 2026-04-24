import {
  addSocialLink,
  deleteSocialLink,
  updateSocialLink,
} from "../actions";
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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Social links
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Shown in the site footer under Contact. Use full URLs (https://…).
      </p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {(links ?? []).length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            No links yet — add one below (or run the latest DB migration to
            seed defaults).
          </li>
        ) : (
          (links ?? []).map((row) => (
            <li key={row.id} className="px-4 py-4">
              <form action={updateSocialLink} className="space-y-3">
                <input type="hidden" name="id" value={row.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Label
                    </label>
                    <input
                      name="label"
                      required
                      defaultValue={row.label}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Icon
                    </label>
                    <select
                      name="icon_key"
                      defaultValue={row.icon_key}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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
                  <label className="text-xs font-medium text-muted-foreground">
                    URL
                  </label>
                  <input
                    name="url"
                    type="url"
                    required
                    defaultValue={row.url}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                  >
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteSocialLink} className="mt-2">
                <input type="hidden" name="id" value={row.id} />
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

      <form action={addSocialLink} className="mt-10 max-w-xl space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Add Link</h2>
        <div>
          <label htmlFor="new-label" className="block text-sm font-medium">
            Label
          </label>
          <input
            id="new-label"
            name="label"
            required
            placeholder="e.g. Chapter Facebook"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-icon" className="block text-sm font-medium">
            Icon
          </label>
          <select
            id="new-icon"
            name="icon_key"
            defaultValue="link"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="new-url" className="block text-sm font-medium">
            URL
          </label>
          <input
            id="new-url"
            name="url"
            type="url"
            required
            placeholder="https://"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Add link
        </button>
      </form>
    </div>
  );
}
