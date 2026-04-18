import Link from "next/link";
import { site } from "@/lib/site";

type Variant = "marketing" | "checkout";

export function FundraisingTrustCallout({ variant }: { variant: Variant }) {
  const dense = variant === "checkout";
  return (
    <div
      className={
        dense
          ? "rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground"
          : "rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground"
      }
    >
      <p className="font-semibold text-foreground">
        {dense ? "Before you pay" : "How ordering works"}
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>
          Payment is processed securely by{" "}
          <strong className="text-foreground">Stripe</strong>—we don&apos;t
          store your card on this site.
        </li>
        <li>
          Your chicken order is{" "}
          <strong className="text-foreground">saved only after payment</strong>{" "}
          completes. You&apos;ll get a receipt by email.
        </li>
        <li>
          Pickup time and place are listed for each cook. Bring your confirmation
          or show the email on your phone.
        </li>
        <li>
          Questions?{" "}
          <Link
            href={`mailto:${site.contact.email}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Email the chapter
          </Link>{" "}
          or{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            use the contact page
          </Link>
          .
        </li>
      </ul>
    </div>
  );
}
