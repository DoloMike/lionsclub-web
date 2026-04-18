import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { MissingSupabaseConfig } from "@/components/admin/MissingSupabaseConfig";
import { Container } from "@/components/Container";
import { getSessionAdmin } from "@/lib/auth/get-session";
import { isSupabaseConfigured } from "@/lib/env";

type Props = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-[60vh] border-b border-border bg-muted/20 py-16">
        <Container>
          <MissingSupabaseConfig />
        </Container>
      </div>
    );
  }

  const admin = await getSessionAdmin();
  if (admin) {
    redirect("/admin");
  }

  const sp = await searchParams;

  return (
    <div className="min-h-[60vh] border-b border-border bg-muted/20 py-16">
      <Container>
        <p className="text-center">
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Back to site
          </Link>
        </p>
        <LoginForm error={sp.error} message={sp.message} />
      </Container>
    </div>
  );
}
