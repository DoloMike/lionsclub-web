<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Stack notes

- Shared UI lives under `src/components/` (not under `src/app/`).
- Supabase: `@/lib/supabase/browser` (anon, client-safe) vs `@/lib/supabase/admin` (service role, `server-only`), `server-client` (cookie session), `public-server` (anon reads without a user).
- Env access goes through `src/lib/env.ts` so keys stay consistent.
- Off-site `http(s)` links: use `@/components/ExternalLink` so `target="_blank"` and `rel="noopener noreferrer"` stay consistent (see `src/lib/leaves-site.ts`).
- Staging / preview: set `NEXT_PUBLIC_NOINDEX=true` (headers + meta + `robots.txt`).
