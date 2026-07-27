import { Container } from "@/components/Container";
import { InviteSessionLanding } from "@/components/auth/InviteSessionLanding";

type InvitePageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { next } = await searchParams;
  const nextPath =
    next?.startsWith("/") && !next.startsWith("//")
      ? next
      : "/admin/admins";

  return (
    <div className="min-h-[60vh] border-b border-border bg-muted/20 py-16">
      <Container>
        <InviteSessionLanding nextPath={nextPath} />
      </Container>
    </div>
  );
}
