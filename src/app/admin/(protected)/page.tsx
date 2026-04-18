import Link from "next/link";

const cards = [
  {
    href: "/admin/settings",
    title: "Meeting schedule",
    body: "Text shown in the footer and on the membership page.",
  },
  {
    href: "/admin/social",
    title: "Social links",
    body: "Icons and URLs in the footer.",
  },
  {
    href: "/admin/officers",
    title: "Officers",
    body: "Leadership list on the About page.",
  },
  {
    href: "/admin/events",
    title: "Events",
    body: "Public events and calendar list.",
  },
  {
    href: "/admin/fundraiser",
    title: "Fundraisers",
    body: "Chicken cooks—dates, pricing, pickup, ordering window, per-event stats and CSV export.",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Edit public content. Changes appear on the live site after you save
        (you&apos;ll see a short confirmation at the top of the page).
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:bg-muted/30"
            >
              <span className="block font-semibold text-foreground">
                {c.title}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {c.body}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
