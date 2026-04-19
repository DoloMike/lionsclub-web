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
              className="group block h-full rounded-xl border border-border bg-card p-5 shadow-card transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center justify-between">
                <span className="block font-semibold text-foreground">
                  {c.title}
                </span>
                <svg
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 5l6 5-6 5" />
                </svg>
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
