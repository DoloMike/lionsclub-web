import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import {
  getHeritageFestivalSignupLabel,
  type HeritageFestivalSignupDate,
} from "@/lib/heritage-festival-signups";
import {
  env,
  isHeritageFestivalNotificationConfigured,
} from "@/lib/env";

type HeritageFestivalSignupNotificationInput = {
  signupDate: HeritageFestivalSignupDate;
  name: string;
};

export async function sendHeritageFestivalSignupNotification(
  input: HeritageFestivalSignupNotificationInput,
): Promise<boolean> {
  if (!isHeritageFestivalNotificationConfigured()) {
    return false;
  }

  const payload = JSON.stringify({
    event_type: "heritage_festival_signup.created",
    source: "lionsclub-web",
    occurred_at: new Date().toISOString(),
    signup: {
      date: input.signupDate,
      label: getHeritageFestivalSignupLabel(input.signupDate),
      name: input.name,
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": randomUUID(),
  };

  if (env.heritageFestival.notificationWebhookSecret) {
    headers["X-Webhook-Signature"] = createHmac(
      "sha256",
      env.heritageFestival.notificationWebhookSecret,
    )
      .update(payload)
      .digest("hex");
  }

  const response = await fetch(env.heritageFestival.notificationWebhookUrl, {
    method: "POST",
    headers,
    body: payload,
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(
      `Signup notification failed with status ${response.status}.`,
    );
  }

  return true;
}
