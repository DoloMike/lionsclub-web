<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Stack notes

- **Dependencies:** Use **Bun** only (`bun install`, `bun add`). This repo’s lockfile is **`bun.lock`** (`package-lock.json` is gitignored). Any change to **`package.json`** must include an updated **`bun.lock`**. **Husky** runs on commit: if you stage **`package.json`**, **`bun install`** runs and **`bun.lock` is re-staged** when it changes. **`pre-push`** runs **`bun run check:lockfile`** (same as Docker’s frozen install). After clone, run **`bun install`** once so `prepare` installs hooks. CI/Docker set **`HUSKY=0`** so installs don’t try to configure git in sandboxes.
- **Supabase migrations:** Do not commit SQL under **`supabase/migrations/`** until it has been **applied locally** (e.g. `supabase db reset` or `supabase migration up` against your dev DB) and you’ve confirmed it runs cleanly. Committed migrations should never be “paper only.”
- Shared UI lives under `src/components/` (not under `src/app/`).
- Supabase: `@/lib/supabase/browser` (anon, client-safe) vs `@/lib/supabase/admin` (service role, `server-only`), `server-client` (cookie session), `public-server` (anon reads without a user).
- Env access goes through `src/lib/env.ts` so keys stay consistent.
- Off-site `http(s)` links: use `@/components/ExternalLink` so `target="_blank"` and `rel="noopener noreferrer"` stay consistent (see `src/lib/leaves-site.ts`).
- Staging / preview: set `NEXT_PUBLIC_NOINDEX=true` (headers + meta + `robots.txt`).
