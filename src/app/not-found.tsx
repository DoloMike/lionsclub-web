import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col justify-center border-b border-border bg-muted/20 py-16">
      <Container>
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          That page doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition hover:bg-muted"
        >
          Go home
        </Link>
      </Container>
    </div>
  );
}
