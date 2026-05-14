import { afterEach, describe, expect, it, vi } from "vitest";

describe("heritage festival signup notifications", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns false when the notification webhook is not configured", async () => {
    vi.stubEnv("HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_URL", "");
    vi.stubEnv("HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_SECRET", "");
    vi.resetModules();

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { sendHeritageFestivalSignupNotification } = await import(
      "@/lib/heritage-festival-signup-notifications"
    );

    await expect(
      sendHeritageFestivalSignupNotification({
        signupDate: "2026-05-29",
        name: "Dakota Basham",
      }),
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the signup payload and HMAC signature when configured", async () => {
    vi.stubEnv(
      "HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_URL",
      "https://example.com/webhooks/heritage-signups",
    );
    vi.stubEnv("HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_SECRET", "topsecret");
    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal("fetch", fetchMock);

    const { sendHeritageFestivalSignupNotification } = await import(
      "@/lib/heritage-festival-signup-notifications"
    );

    await expect(
      sendHeritageFestivalSignupNotification({
        signupDate: "2026-05-29",
        name: "Dakota Basham",
      }),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & { body?: string; headers?: Record<string, string> },
    ];

    expect(url).toBe("https://example.com/webhooks/heritage-signups");
    expect(init.method).toBe("POST");
    expect(init.headers?.["Content-Type"]).toBe("application/json");
    expect(init.headers?.["X-Webhook-Signature"]).toMatch(/^[a-f0-9]{64}$/);

    const body = JSON.parse(init.body ?? "{}");
    expect(body).toMatchObject({
      event_type: "heritage_festival_signup.created",
      source: "lionsclub-web",
      signup: {
        date: "2026-05-29",
        label: "Friday, May 29, 2026",
        name: "Dakota Basham",
      },
    });
  });
});
