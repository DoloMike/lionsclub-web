export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  isStaging:
    process.env.NEXT_PUBLIC_APP_URL?.includes("staging") ?? false,
  isProduction: process.env.NODE_ENV === "production",

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
} as const;
