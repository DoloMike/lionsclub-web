import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { LoginPanel } from "./LoginPanel";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google — chapter member and admin roles are assigned separately.",
};

type Props = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <>
      <PageHeader
        title="Sign in"
        description="Anyone can create an account with Google. Chapter membership and admin access are set by the club after you sign in."
      />
      <LoginPanel error={sp.error} message={sp.message} />
    </>
  );
}
