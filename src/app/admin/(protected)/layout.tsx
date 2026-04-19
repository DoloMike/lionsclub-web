import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { AdminSavedBanner } from "@/components/admin/AdminSavedBanner";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { MissingSupabaseConfig } from "@/components/admin/MissingSupabaseConfig";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getSessionAdmin } from "@/lib/auth/get-session";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <MissingSupabaseConfig />;
  }

  const admin = await getSessionAdmin();
  if (!admin) {
    redirect("/admin/login?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Eyebrow as="span">Site admin</Eyebrow>
          <nav className="flex flex-wrap gap-2">
            <AdminNavLinks />
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              View site
            </Link>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <AdminSavedBanner />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
