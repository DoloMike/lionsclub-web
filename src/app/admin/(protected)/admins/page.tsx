import { AdminAddCard } from "@/components/admin/AdminAddCard";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { getSessionAdmin } from "@/lib/auth/get-session";
import { getAdminUsers } from "@/lib/data/admin-users";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export default async function AdminsPage() {
  const [admins, currentAdmin] = await Promise.all([
    getAdminUsers(),
    getSessionAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Admins
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        View everyone with site-admin access and invite another trusted person.
        Admins can manage site content, orders, sign-ups, photos, and other
        administrators.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Current admins</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending means the invitation has been sent but the person has not
            signed in yet.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {admins.length === 0 ? (
            <li className="px-5 py-6 text-sm text-muted-foreground">
              No admin accounts were found.
            </li>
          ) : (
            admins.map((admin) => {
              const pending = Boolean(admin.invitedAt && !admin.lastSignInAt);
              return (
                <li
                  key={admin.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {admin.displayName}
                      {admin.id === currentAdmin?.id ? (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          (you)
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {admin.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pending && admin.invitedAt
                        ? `Invited ${formatDate(admin.invitedAt)}`
                        : `Admin since ${formatDate(admin.createdAt)}`}
                    </p>
                  </div>
                  <span
                    className={
                      pending
                        ? "inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-foreground"
                        : "inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    }
                  >
                    {pending ? "Pending invite" : "Active"}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <AdminAddCard
        title="Invite admin"
        description="New users receive an email invitation. If the email already belongs to an account, that account is promoted immediately."
      >
        <InviteAdminForm />
      </AdminAddCard>
    </div>
  );
}
