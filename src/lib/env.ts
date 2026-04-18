export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  isStaging:
    process.env.NEXT_PUBLIC_APP_URL?.includes("staging") ?? false,
  isProduction: process.env.NODE_ENV === "production",

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    /** Server-only: internal URL to bypass Cloudflare for SSR requests */
    internalUrl: process.env.SUPABASE_INTERNAL_URL ?? "",
  },
  /** Optional — chicken checkout is disabled until set */
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
  },
  /** Same Web client ID as Google OAuth / One Tap (public) */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  /** IANA timezone for fundraiser order deadlines vs "today" (Hancock County, KY) */
  siteTimezone:
    process.env.NEXT_PUBLIC_SITE_TIMEZONE ?? "America/Kentucky/Louisville",
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.supabase.url &&
      env.supabase.anonKey &&
      env.supabase.serviceRoleKey
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripe.secretKey);
}

export function isGoogleOneTapConfigured(): boolean {
  return Boolean(env.googleClientId);
}
