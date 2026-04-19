import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, isSupabaseConfigured } from "../env";

/**
 * Supabase client bound to the current request cookies (user session).
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();
  const domain = (() => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return undefined;
    const hostname = new URL(appUrl).hostname;
    return hostname === "localhost" ? undefined : hostname;
  })();

  // Use the PUBLIC URL so session cookie key prefix matches the browser client
  // and callback exchange. Cookie names are URL-derived; using internal URL
  // would cause SSR reads to miss cookies set with public URL keys.
  const url = env.supabase.url;
  return createServerClient(url, env.supabase.anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: !env.isDevelopment,
      domain,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // v0.10 passes cache-control headers as the second arg (no response in RSC).
      setAll(cookiesToSet, headers) {
        void headers;
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware refreshes session.
        }
      },
    },
  });
}
