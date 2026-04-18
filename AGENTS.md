<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Stack notes

- Shared UI lives under `src/components/` (not under `src/app/`).
- Supabase: `@/lib/supabase/browser` (anon, client-safe) vs `@/lib/supabase/server` (service role, `server-only`).
- Env access goes through `src/lib/env.ts` so keys stay consistent.
- Staging / preview: set `NEXT_PUBLIC_NOINDEX=true` (headers + meta + `robots.txt`).
