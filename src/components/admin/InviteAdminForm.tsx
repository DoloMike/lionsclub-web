"use client";

import { useActionState } from "react";
import { inviteAdmin } from "@/app/admin/(protected)/admins/actions";
import type { InviteAdminState } from "@/app/admin/(protected)/admins/actions";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";

const initialInviteAdminState: InviteAdminState = {
  status: "idle",
  message: "",
};

export function InviteAdminForm() {
  const [state, formAction, pending] = useActionState(
    inviteAdmin,
    initialInviteAdminState,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="admin-invite-email" className={adminLabelClass}>
          Email address
        </label>
        <input
          id="admin-invite-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="name@example.com"
          className={adminInputClass}
          aria-describedby="admin-invite-message"
        />
      </div>
      <button
        type="submit"
        className={adminPrimaryButtonClass}
        disabled={pending}
      >
        {pending ? "Sending invitation\u2026" : "Invite admin"}
      </button>
      <p
        id="admin-invite-message"
        className={
          state.status === "error"
            ? "text-sm text-destructive"
            : "text-sm text-muted-foreground"
        }
        role={state.status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {state.message}
      </p>
    </form>
  );
}
