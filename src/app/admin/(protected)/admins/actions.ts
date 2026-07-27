"use server";

import { revalidatePath, updateTag } from "next/cache";
import { assertAdmin } from "@/lib/auth/assert-admin";
import { findAuthUserByEmail } from "@/lib/data/admin-users";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type InviteAdminState = {
  status: "idle" | "success" | "error";
  message: string;
};

function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export async function inviteAdmin(
  _previousState: InviteAdminState,
  formData: FormData,
): Promise<InviteAdminState> {
  await assertAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address.",
    };
  }

  const supabase = getSupabaseAdmin();
  let user = await findAuthUserByEmail(email, supabase);
  let invitationSent = false;

  if (!user) {
    // Admin invitations use Supabase's implicit-token flow, even though the
    // rest of the site uses PKCE for Google OAuth. Land on a Client Component
    // so the browser client can consume the URL fragment and persist cookies.
    const redirectTo = `${getPublicSiteUrl()}/auth/invite?next=/admin/admins`;
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { invited_as: "admin" },
    });

    if (error || !data.user) {
      return {
        status: "error",
        message: `Could not send the invitation: ${error?.message ?? "No user was created"}`,
      };
    }

    user = data.user;
    invitationSent = true;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, role: "admin" },
    { onConflict: "id" },
  );

  if (profileError) {
    if (invitationSent) {
      await supabase.auth.admin.deleteUser(user.id);
    }
    return {
      status: "error",
      message: `Could not grant admin access: ${profileError.message}`,
    };
  }

  updateTag(`profile-role:${user.id}`);
  revalidatePath("/admin/admins");

  return invitationSent
    ? {
        status: "success",
        message: `Invitation sent to ${email}. They now appear as a pending admin.`,
      }
    : {
        status: "success",
        message: `${email} already has an account and now has admin access.`,
      };
}
