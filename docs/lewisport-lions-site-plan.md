# Lewisport Lions Club — Site Planning & Specification

This document guides implementation of a modern, responsive public website and future member/admin/fundraising flows for the **Lewisport Lions Club** (Kentucky, District 43-K). It is grounded in the current **`lionsclub-web`** codebase and summarized public sources ([Lewisport chapter projects](https://e-clubhouse.org/sites/lewisport/projects.php), [LCI Member Resource Center / LCIF hub](https://www.lionsclubs.org/en/member-resource-center/lcif)). For a **short status and deploy checklist**, see **[status-and-next.md](status-and-next.md)** first.

---

## Status snapshot (April 2026)

**Canonical “what’s shipped / what’s next” (including production deploy)** lives in **[docs/status-and-next.md](status-and-next.md)**. Use that file with **`README.md`** for day-to-day alignment; the sections below are the long-form product spec and roadmap.

---

## 1. Project Summary

### What this site is

A civic, community-centered web presence for the Lewisport Lions Club chapter: storytelling about local impact, pathways to **join**, **donate**, and **participate** in fundraisers (notably recurring **chicken cook** orders), plus a phased path to **authenticated member experiences** and **admin operations**.

### Who it serves

- **Residents and neighbors** in Lewisport / Hancock County seeking help, events, or ways to give back.
- **Prospective members** evaluating fit and meeting logistics.
- **Existing members** (member portal still planned) for updates, resources, and order history.
- **Club leadership** — **admin UI** exists for chapter content and fundraisers; richer **orders / verification** tooling still planned.

### Primary goals

- **Trust & warmth**: feel like a local institution, not a generic template.
- **Clarity of mission**: vision health, youth, hunger/service, and chapter-specific programs.
- **Conversion paths**: contact, join, donate, chicken cook orders (when live).
- **Technical foundation**: responsive UI, **light-first pages** with **system-driven dark** (see Section 9), optional explicit **light / dark / system** user toggle later, SEO-ready metadata, accessibility, performance.
- **Identity & governance**: **Admin** Google auth + `profiles` roles are live; **visitor / member / verified member** flows beyond admin are still to be productized (see [status-and-next.md](status-and-next.md)).

### Non-goals (first phase)

- Full **CMS** parity with the legacy e-Clubhouse site (start with curated static/MDX or simple DB-backed content—decide in Phase 1).
- **Payment capture** in-app on day one (plan for it; may start with “pay at pickup” + manual reconciliation).
- **Deep integration** with MyLion / LCI systems (out of scope unless stakeholders require it later).
- Cloning **visual design** of [e-clubhouse.org](https://e-clubhouse.org/sites/lewisport/projects.php) or LCI marketing pages—only **facts and tone** inform this site.

---

## 2. Source-Informed Context

### Lewisport chapter activities (summarized from the reference page)

The chapter’s public project list emphasizes **vision and hearing health**, **scholarships**, **local holiday traditions**, and **county-wide support**:

- **Eyecare pipeline**: collect used eyeglasses; clean, sort, repair, and distribute; help with eye exams and glasses for qualifying people; connections to **Kentucky Lions Eye Foundation** (including surgery where eligible).
- **Screenings**: **Vision Van** (adults), **KidSight** (roughly 5 months–5 years).
- **Education**: scholarships for **Hancock County High School** seniors.
- **Community events**: free **pancake breakfast** on Christmas parade morning; **Santa float** for Lewisport and Hawesville parades.
- **Facility support**: offer a **meeting space** free of charge for qualifying nonprofits for a limited number of days per year.
- **Local giving**: support for **Build a Bed**, **Hancock County Fairgrounds** improvements, **Care and Share**, and similar programs.
- **Broader Lions programs**: **Leader Dogs for the Blind**; **Lions Camp Crescendo** (multiple one-week camps serving different qualifying populations).
- **Flexibility**: additional service as needs arise.

Use these themes on the landing page as **short, plain-language blurbs** with optional “learn more” links—avoid long copy blocks.

### Lions / LCIF themes influencing messaging

From LCI’s public positioning around **LCIF** and the **Member Resource Center** (see [LCIF / member resources](https://www.lionsclubs.org/en/member-resource-center/lcif) and related LCI pages):

- **Service at scale**: local clubs as part of a global network; **foundation grants** and programs (e.g., disaster relief, hunger-related initiatives) complement local chapter work.
- **Leadership & stewardship**: officers and members steward projects, funds, and community trust.
- **Humanitarian focus**: health, hunger, vision, youth, and disaster response recur as organizational pillars—map them to **what Lewisport actually does locally** so the site stays authentic.

**Messaging principle**: “We’re your neighbors” first; “We’re part of Lions Clubs International” second—link out for visitors who want the global context.

### Content, imagery, and branding constraints

- **Official marks**: Lions wordmarks, lion icons, and LCIF marks are **trademarked**. Source **official brand assets and usage rules** from Lions Clubs International channels (e.g., member / leader resource areas on [lionsclubs.org](https://www.lionsclubs.org/)) and follow published **guidelines** (minimum clear space, color treatments, no unauthorized alterations).
- **Photography**: prefer **original photos** from chapter events (parades, screenings, fundraisers) with **written releases** where faces are identifiable.
- **Third-party logos** (sponsors, schools, county programs): obtain **permission** before displaying; prefer names + links if logos are unavailable.
- **Accessibility**: do not rely on color alone for state; provide text alternatives for meaningful images.
- **Legal**: include standard **non-affiliation** nuance where needed (site is the chapter’s; not a substitute for LCI legal statements unless required).

---

## 3. Recommended Site Vision

### Aesthetic direction

- **Modern civic**: clean layout, generous whitespace, confident typography, subtle depth (soft borders, restrained shadows), **no** cluttered “nonprofit 2014” tropes.
- **Dual personality**: **day mode** feels like morning light on Main Street (warm paper neutrals, deep blue–green accents); **night mode** feels like an evening meeting hall (deep navy/graphite, warm gold or amber accents—not harsh neon).
- **Default vs system appearance**: author pages with an **explicit light palette** (backgrounds, text, borders, cards—hard-coded light utilities or light token values as the baseline). When the visitor’s OS uses **dark mode** (`prefers-color-scheme: dark`), apply **dark overrides** so the same layout reads correctly at night—do **not** assume a globally dark `<body>` as the default.

### Tone and brand personality

- **Warm, direct, humble, competent**—inviting without hype.
- Prefer **specifics** (“KidSight screenings for young children”) over vague superlatives (“world-class”).
- **Action-forward** CTAs: “Request help,” “Join us,” “Order chickens,” “Contact the club.”

### Visual motifs

- **Ribbon / path** motif suggesting **service journeys** (eyeglasses → cleaning → someone helped)—use sparingly as section dividers or subtle background shapes.
- **Map pin / river / small-town cues** (abstracted)—avoid cliché stock “hands holding globe.”
- **Event photography** as hero and section anchors; pair with short captions naming **what** and **who benefits**.

### Color, typography, illustration

- **Color**: anchor neutrals (warm off-white / charcoal) + **one primary** (deep teal or navy) + **one accent** (amber/gold or Lions-adjacent blue **only if** within LCI brand rules once assets are chosen). Validate **contrast** (WCAG AA minimum for body text).
- **Typography**: the repo already uses **Geist** / **Geist Mono** via `next/font` in `src/app/layout.tsx`—acceptable for a modern civic look. Consider a **second display style** later (still Google-licensed) if headings need more character—optional.
- **Illustration**: if used, favor **flat geometric** local landmarks or icons; avoid generic “volunteer” clipart packs.

### Distinct from generic nonprofit templates

- Lead with **Lewisport-specific programs** (parade breakfast, Santa float, Hancock scholarships) in the **first screen** and **first scroll**, not generic mission filler.
- Use **real names of programs** the chapter supports (spelled correctly, linked where appropriate).
- Surface **meeting time/place** and **contact** early in navigation patterns (mobile-first).

---

## 4. Information Architecture

### Proposed top-level routes (public)

| Route | Purpose |
|--------|---------|
| `/` | Landing: mission, highlights, fundraisers, join/contact. |
| `/about` | Chapter story, leadership (optional), district affiliation (43-K), LCI relationship (brief). |
| `/service` | Programs aligned to source list (vision, youth, hunger/community support). |
| `/events` | Upcoming + recurring (parades, screenings); can start as static/MDX. |
| `/fundraising` | Chicken cook and other campaigns (overview + rules + how to pay). |
| `/fundraising/order` | Guest chicken checkout (Stripe) when an event is open. |
| `/fundraising/order/return` | Post–Stripe Checkout return surface. |
| `/membership` | Why join, expectations, meeting info, link to auth/sign-up. |
| `/contact` | Form + email/phone + social (as available). |
| `/privacy` | Data handling once auth/orders exist. |
| `/terms` | Optional; useful if payments/terms of sale are added. |

### Landing page essentials

- **Hero** with chapter name, location, primary CTA trio: **Join / Volunteer**, **Fundraiser**, **Contact**.
- **Impact strip**: 3–4 measurable/service statements (not statistics unless verified).
- **Programs** grid referencing real initiatives.
- **Fundraiser** module for chicken cook (status + CTA).
- **News/Events** teaser.
- **Footer**: meeting info, nonprofit facility offer (short), social, LCI “learn more” link, privacy.

### Future member area (authenticated)

| Route | Purpose |
|--------|---------|
| `/app` or `/member` (pick one namespace) | Dashboard shell. |
| `/member/profile` | Name, contact preferences. |
| `/member/orders` | Chicken orders history (Phase 4). |
| `/member/resources` | Internal links (bylaws, schedules)—content TBD by club. |

### Future admin area

| Route | Purpose |
|--------|---------|
| `/admin` | Guarded layout; overview metrics. |
| `/admin/orders` | Chicken order queue. |
| `/admin/members` | Verification queue, role assignment (admins only). |
| `/admin/content` | Optional CMS-lite for announcements. |

### Navigation / footer

- **Header**: logo/wordmark, **About**, **Service**, **Events**, **Fundraising**, **Membership**, **Contact**, **Sign in** (when auth ships).
- **Mobile**: hamburger with the same order; keep **Contact** and **Fundraising** high.
- **Footer**: address/meeting; email; Facebook/Twitter if still used ([e-clubhouse](https://e-clubhouse.org/sites/lewisport/projects.php) mentions Twitter); link to LCI for global context; privacy.

---

## 5. Landing Page Content Plan

Each section: **purpose**, **key message**, **CTA**.

### Hero

- **Purpose**: Immediate clarity of who you are and what a visitor should do next.
- **Key message**: “Lewisport Lions Club serves Hancock County through vision programs, youth support, and community events.”
- **CTA**: Primary: **Join us** → `/membership`. Secondary: **Contact** → `/contact`. (Fundraising is linked from the dedicated fundraiser section lower on the page and site-wide banner when live—not a third hero button in the current implementation.)

### Mission / impact

- **Purpose**: Emotional + rational trust in 20–40 seconds of reading.
- **Key message**: Local neighbors improving health and opportunity, tied to a few concrete program examples (eyeglasses, scholarships, screenings).
- **CTA**: **See what we do** → `/service`.

### Community service highlights

- **Purpose**: Showcase breadth without walls of text—mirror the chapter list as cards.
- **Key message**: Vision pipeline + youth + holiday traditions + county partners.
- **CTA**: **Volunteer** → `/membership` or mailto/contact form.

### Chicken cook / fundraiser callout

- **Purpose**: Drive orders and set expectations (dates, pickup, pricing policy).
- **Key message**: Recurring community fundraiser; simple ordering when live.
- **CTA**: **Place an order** (Phase 4) or **Get notified** (Phase 1 mailing list CTA if desired).

### Membership / sign-in CTA

- **Purpose**: Separate “interested newcomer” from “returning member.”
- **Key message**: Meetings are welcoming; roles and time commitments explained at `/membership`.
- **CTA**: **Become a Lion** vs **Member sign-in** (post-auth).

### Events / news

- **Purpose**: Freshness signal; SEO for local queries.
- **Key message**: Parades, screenings, fundraisers—what’s next.
- **CTA**: **View calendar** → `/events`.

### Donations / foundation

- **Purpose**: Channel generosity without overpromising tax advice.
- **Key message**: Local projects first; optional link to **LCIF** for visitors who want the foundation angle ([LCIF hub](https://www.lionsclubs.org/en/member-resource-center/lcif)).
- **CTA**: **Donate** (mailto, external giving page, or in-app later).

### Contact

- **Purpose**: Lower friction for help requests and partnerships.
- **Key message**: We respond to community needs; facility offer summarized with “request availability” CTA.
- **CTA**: **Message the club** (form) + phone/email.

---

## 6. Auth and User Roles Plan

### Recommended approach (aligned to this repo)

The project standardizes on **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`, clients under `src/lib/supabase/*`, `env` in `src/lib/env.ts`). **Supabase Auth** is the identity provider:

- **Today:** **Google OAuth** for **chapter admins** (`/admin/login`, `/auth/callback`, cookie refresh in `proxy.ts`). Email/password is intentionally **not** offered — there is no signup flow and the single admin uses Google.
- **Planned / optional:** **Google One Tap** via `signInWithIdToken` when product requirements settle.

**Repository conventions to preserve**

- Browser-only anon client for user-scoped calls under **RLS**.
- **`getSupabaseAdmin()`** (service role) **only** on the server for privileged tasks — never import `@/lib/supabase/admin` in Client Components (enforced via `server-only`).

### Google One Tap coexistence

- **Account linking**: If email/password is ever re-introduced, prefer a single Supabase user — ensure **verified email** alignment or use Supabase’s linking flows to avoid duplicates.
- **UX**: Show One Tap on **sign-in** and **checkout** surfaces, not globally on every page (noise + consent).
- **Fallback**: Always expose **Continue with Google (button)** for browsers blocking One Tap.

### Role model

| Role | Meaning |
|------|---------|
| `visitor` | Not authenticated; public site only. |
| `member` | Authenticated user flagged as **verified chapter member** (see below). |
| `admin` | Authenticated user with operational privileges (orders, verification decisions, content). |

**Implementation sketch**

- `auth.users` managed by Supabase.
- `public.profiles` (or `public.user_roles`) table: `user_id`, `display_name`, `role` (`member` | `admin`), `member_verified_at`, `member_verified_by`, optional `notes`.
- **Default** for new sign-ups: authenticated but **not verified** → treat as **“account holder”** until `member_verified_at` is set. UI copy: “Member status pending verification.”

### Membership verification workflow

**Assumption (labelled)**: Officers will verify members manually at first—no automated tie to MyLion.

Suggested flow:

1. User creates account (Google or email).
2. User requests **member verification** (form: name, phone, preferred contact, optional member ID if the club uses one internally—**do not** collect sensitive IDs unnecessarily).
3. **Admin** reviews queue, checks roster (offline), sets `member_verified_at` and upgrades `role` to `member` (or keeps `role` as `member` with verification flag—pick one model and stay consistent).
4. RLS: member-only pages require `member_verified_at IS NOT NULL` **or** admin override read policies as needed.

### Admin status management

- **Bootstrap problem**: first admin created via **Supabase dashboard** SQL update or a guarded one-time script/env flag.
- **Ongoing**: only `admin` users may grant `admin` or verification (dual-control optional later).
- **Audit**: log role changes (`role_audit` table: actor, target, before, after, timestamp).

### Security considerations

- **RLS everywhere** on user-specific and order tables; **no** service role from the browser.
- **CSRF**: prefer Server Actions / Next Route Handlers with same-site cookies for mutations.
- **Rate limit** contact and order endpoints (edge proxy or upstream WAF).
- **Secrets**: keep `SUPABASE_SERVICE_ROLE_KEY` server-only (already documented in `README.md`).
- **Staging**: continue using `NEXT_PUBLIC_NOINDEX=true` pattern already wired in `next.config.ts`, `robots.ts`, and `layout.tsx`.

---

## 7. Admin and Operations Plan

### Likely admin pages

**Implemented today:** `/admin` (dashboard copy), `/admin/settings` (meeting schedule text), `/admin/social`, `/admin/officers`, `/admin/events`, `/admin/fundraiser` (chicken events + commerce fields), **`/admin/fundraiser/[eventId]/stats`** (totals + order table + link to CSV download).

**Still to build or deepen:** Cross-event **`/admin/orders`** hub (optional), **Members** / verification queue UI, metrics on the dashboard, optional **Announcements** CMS if not folded into events.

- **Dashboard**: counts (open orders, pending verifications), recent activity — *partially stubbed*.
- **Orders**: per-event stats + **CSV export** shipped; cross-event list/filter UI — *optional future*.
- **Members**: search users, view verification state, approve/revoke — *planned*.
- **Announcements** (optional): CRUD for landing “news” items.
- **Settings**: pickup location defaults, active fundraiser toggles, pricing tiers (guarded) — *split between `settings` + `fundraiser` today*.

### Admin capabilities

- Toggle **fundraiser window** (orders open/closed).
- Edit **pickup slots** or instructions per event.
- Issue **refunds/cancellations** (process-dependent; may be manual at first).
- **Email exports** for kitchen/pickup volunteers (PII—minimize fields).

### Content management

- **Phase 1–2**: MDX or static TS config committed to repo for speed and reviewability.
- **Phase 3+**: optional Supabase-backed `announcements` + simple admin editor if non-developers must publish weekly.

### Member management

- Verification queue as above.
- Optional: link members to **pickup name** aliases for privacy at pickup.

### Chicken order management

- Covered in Section 8; admin is the **source of truth** for status transitions and exceptions.

---

## 8. Chicken Cook Ordering Plan

### Implemented user flow (repo)

1. Visitor reads **`/fundraising`** and follows **Place an order** → **`/fundraising/order`**.
2. **No account required** — collects order fields needed for pickup + **Stripe Checkout** for payment.
3. Order row is persisted **after** successful payment (see `chicken_orders` + Stripe session id in migration `20260418150000_chicken_orders.sql` and app API routes).
4. **`/fundraising/order/return`** handles the browser return from Stripe.

Admins create/configure events under **`/admin/fundraiser`** (`order_open`, pricing, inventory, pickup copy).

### Earlier design alternative (not the default today)

**Original assumption:** require sign-in (Google One Tap / email) before checkout and expose **`/member/orders`**. That path remains a valid future enhancement if the chapter wants tighter identity or repeat-buyer UX.

### Fields (database-aligned)

- **Event:** `fundraiser_events` — title, slug, dates, pickup text, `price_cents_per_unit`, `max_units_per_order`, optional `inventory_units`, `order_open`, etc.
- **Order:** `chicken_orders` — `event_id`, `quantity`, `unit_price_cents`, `total_cents`, `customer_name` / `customer_email` / `customer_phone`, `notes`, optional `user_id`, `stripe_checkout_session_id`, `status`, timestamps (see migration for full constraints).

### Status lifecycle (implemented check constraint)

States include: `pending_payment`, `paid`, `confirmed`, `ready`, `completed`, `cancelled` — align admin tooling and public copy with these names.

**Guards:** enforce inventory / max-per-order at checkout in application or RPC layer; disallow destructive edits after fulfillment except via admin.

### Admin workflow

- Configure events and inventory; view or export orders by event; update statuses for kitchen/pickup; handle cancellations and edge cases (refunds may go through Stripe dashboard until in-app refund flows exist).

### Edge cases & safeguards

- **Oversell:** transactional decrement or server-side validation before creating Checkout sessions.
- **Waitlist:** optional if inventory hits zero.
- **Pickup no-shows:** policy copy on site; optional `no_show` flag later.
- **Abuse:** rate limits on checkout creation; CAPTCHA if needed later.

### Guest checkout

- **Shipped:** guest checkout is the **default** path today (with Stripe). Optional future: link orders to logged-in members when a member portal exists.

---

## 9. Technical Architecture Recommendations

### App structure within `lionsclub-web`

**Current layout (April 2026):**

```text
src/
  app/
    (public pages at top level: about, contact, events, fundraising, membership, …)
    admin/                 # /admin/login + (protected) settings, social, officers, events, fundraiser
    auth/callback/         # Supabase OAuth exchange
    api/                   # health, Stripe checkout, admin fundraiser CSV export
  components/              # Header, Footer, Landing, admin/*, LionsLogo, SocialIcon, ExternalLink, JsonLd, …
  lib/
    supabase/              # browser, server-client, admin, public-server
    auth/                  # getSessionAdmin, assert-admin, …
    data/                  # chapter content, fundraiser queries
  proxy.ts                 # Supabase cookie refresh (Next 16 file-convention proxy)
```

**Still optional / future:** route groups `(public)/`, `(member)/member/...`, dedicated `components/ui/` barrel, extra `styles/` split if CSS grows.

**Theme strategy (important repo note)**

- **Light-first, system overrides**: implement pages and shared chrome (`Header`, `Footer`, marketing routes, error boundaries) with **explicit light** colors as the default (e.g. light backgrounds, dark text, subtle borders). Add **dark appearance only inside** `@media (prefers-color-scheme: dark) { … }` (or equivalent Tailwind **`dark:`** variants configured to follow **media**, not a manual `.dark` class—verify Tailwind v4 project defaults when coding). That way the “normal” authored state is always readable as a **daytime civic** site; users who prefer dark OS chrome get automatic dark styling without flipping the whole app to dark-by-default.
- `src/app/globals.css` already sketches **CSS variables** toggled by `prefers-color-scheme`; align **all** page/component classes with that model and **remove** one-off **`bg-zinc-950` / light-on-dark-only** islands unless they sit inside the dark media branch.
- **Optional later**: a user-controlled **light / dark / system** toggle can still be added by toggling a `data-theme` / `class` on `<html>` for “force light” and “force dark,” with **system** meaning “no forced class—follow `prefers-color-scheme` only.” Until that ships, **system-only** behavior matches the product ask above.

### Data model (suggested tables)

- `profiles` — 1:1 with `auth.users`.
- `member_verification_requests` — optional if workflow needs audit separate from profiles.
- `role_audit` — admin accountability.
- `fundraiser_events` — chicken cook instances (date, location, inventory, pricing).
- `chicken_orders` — see Section 8.
- `announcements` — optional for news.

**RLS**: public read for published announcements/events; owner read for own orders; admin bypass via **service role** in trusted server routes only.

### Integrations / services

- **Supabase Auth** (Google OAuth only — no email/password flow is exposed in the UI).
- **Email**: Supabase Auth emails + Resend/SendGrid later for order receipts (decision).
- **Payments:** **Stripe Checkout** is integrated for chicken orders when `STRIPE_SECRET_KEY` is configured; extend webhooks and reconciliation as needed.
- **Analytics**: privacy-conscious Plausible or GA4—cookie banner if required.

### Accessibility, performance, SEO

- **Accessibility**: semantic landmarks (`header`, `main`, `nav`, `footer`), focus states, skip link, form labels, color contrast validated in both themes.
- **Performance**: `next/image` for photos; avoid huge carousels; subset fonts (already `display: "swap"`).
- **SEO**: expand `metadata` in `layout.tsx` for chapter-specific titles/descriptions; grow `sitemap.ts` as routes are added; structured data (`LocalBusiness` / `NGO`) **after** accurate NAP (name/address/phone) is confirmed.
- **Analytics events**: fundraiser CTA clicks, sign-in starts, order completions.

---

## 10. Phased Implementation Plan

Phases below are the **original roadmap**; see **[status-and-next.md](status-and-next.md)** for current shipped vs next, then the **Status** column in each phase for historical comparison.

### Phase 1 — Landing + foundation

- **Scope**: IA routes (static shells acceptable), redesigned landing per Section 5, **light-first + system-dark** theming (Section 9), accessible navigation, chapter-specific metadata, content stubs grounded in Section 2.
- **Dependencies**: approved copy, a handful of photos or placeholders, NAP confirmation.
- **Success criteria**: Lighthouse accessibility ≥ 90 on key pages (reasonable target), responsive review, stakeholders sign off on tone and structure.
- **Status (Apr 2026):** **Largely complete** — public IA, landing, theming, LCI branding, JSON-LD, and navigation are in place; keep iterating on copy, imagery, and Lighthouse numbers.

### Phase 2 — Auth + roles

- **Scope**: Supabase Auth provider (Google OAuth), profile table, role + verification flags, member layout shell, protected routes, One Tap evaluation behind feature flag.
- **Dependencies**: Supabase project configuration (OAuth client IDs), email templates, privacy policy.
- **Success criteria**: test accounts can sign in/out; RLS prevents cross-user data reads; verification flow works end-to-end.
- **Status (Apr 2026):** **Partial** — **Google admin** sign-in + `profiles` + RLS patterns exist; **club member** sign-in, verification UX, and One Tap are **not** finished as originally scoped.

### Phase 3 — Admin

- **Scope**: `/admin` area, verification queue, announcements CRUD (if chosen), audit log for role changes.
- **Dependencies**: at least two admin users bootstrapped; operational training doc for officers.
- **Success criteria**: non-technical admin can verify a member and post an announcement without developer help (if CMS path chosen).
- **Status (Apr 2026):** **Partial** — meeting text, social links, officers, events, and **fundraiser** (chicken events) admin screens exist; **member verification queue** and **announcements CMS** (if distinct from events) remain open.

### Phase 4 — Chicken ordering

- **Scope**: fundraiser events, inventory-safe ordering, emails, member order history, admin fulfillment tools, exports.
- **Dependencies**: pricing rules, pickup logistics, legal/tax questions resolved for receipts.
- **Success criteria**: dry-run event completes with ≥ N test orders, no oversell in concurrency test, admin can export final pickup list.
- **Status (Apr 2026):** **Partial** — DB schema, admin event config, **guest Stripe checkout**, return route, **per-event stats page**, and **CSV export** are implemented; **transactional email** (beyond Stripe’s optional receipt), **member order history**, and hard **inventory RPC** guarantees may still need work for production scale.

---

## 11. Open Questions / Assumptions

### Critical unknowns (need stakeholder decisions)

- **Meeting schedule & location** (accurate NAP for SEO and footer).
- **Official chapter branding assets** available under LCI rules (which logo variant, colors).
- **Chicken cook logistics**: dates per year, pricing, max per order, pickup location, payment handling (cash-only vs electronic).
- **Who may be an admin** and whether **two-person approval** is required for verification/role changes.
- **Privacy posture** for posting volunteer photos and stories.

### Lower-priority refinements

- Whether `/events` starts as static MDX vs Supabase table.
- Preferred transactional email vendor.
- Whether to expose a public “stories” blog.
- Optional **Spanish** or other translations (LCI emphasizes multilingual resources globally; local need TBD).

### Documented assumptions

- Manual **member verification** initially (when a member portal ships).
- **Guest Stripe checkout** for chicken orders is the **current** implementation; optional member-linked orders later.
- **Stripe** handles payment capture; chapter-specific refund / cash-exception flows may still use manual processes alongside dashboard tools.
- Public UI is **light by default** in authored styles; **dark styling** applies when the OS reports **dark** via `prefers-color-scheme` (see Section 9).

---

## 12. Cursor Handoff Notes

### Suggested next engineering priorities (post–Phase 1)

1. **Chicken ops:** transactional email on paid orders (if Stripe dashboard receipts are not enough); optional cross-event **admin orders** list; tighten inventory / concurrency (RPC or Stripe metadata checks) if not already strict enough for production traffic.
2. **Member / identity (Phase 2 remainder):** member sign-in surfaces (if desired), verification queue UI, and optional linking of `chicken_orders.user_id` when a member session exists.
3. **Polish & trust:** expand `privacy` / `terms` as real auth and payments land; keep `NEXT_PUBLIC_APP_URL` aligned with HTTP vs HTTPS dev (`README.md`).
4. **SEO:** extend `sitemap.ts` if new top-level routes appear; validate JSON-LD in Rich Results / Search Console once deployed.

### Files/folders commonly touched for the above

- `src/app/fundraising/order/*`, `src/app/admin/(protected)/fundraiser/*`, `src/app/api/**` (Stripe)
- `supabase/migrations/*` (RLS, functions)
- `src/lib/data/fundraiser.ts`, `src/components/admin/*`
- `src/proxy.ts` (session) — Next 16 file-convention proxy (renamed from `middleware.ts`)

---

## Recommended Next Build Step

**Harden and operate chicken fundraising:** optional unified **admin orders** view across events (stats + CSV exist per event today); add **paid-order email** from the app if chapter branding is required beyond Stripe receipts (Supabase Edge Function, Resend, or similar); **load-test / review inventory rules** so checkout cannot oversell under concurrency. Run a full **dry-run event** on staging with real Stripe test keys before promoting config to production.
