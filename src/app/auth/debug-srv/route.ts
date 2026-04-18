import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Debug endpoint to check session state from server-side cookies.
 * Accessible at /auth/debug-srv?secret=<8-char-prefix>
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "sb_secre") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  return NextResponse.json({
    hasUser: !!user,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    error: error?.message ?? null,
    cookies: request.cookies.getAll().map((c) => ({
      name: c.name,
      valuePrefix: c.value.slice(0, 8) + "...",
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      path: c.path,
      domain: c.domain,
      secure: c.secure,
      maxAge: c.maxAge,
    })),
  });
}