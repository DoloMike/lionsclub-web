# Lewisport Lions Club UX / UI Review

**Document status (April 2026):** This file captures a **code-informed review** from a point in time. Many recommendations below have since been **implemented or partially addressed** in the repo—for example active navigation, fundraiser trust copy, expanded privacy/terms, admin save feedback, warmer section styling, footer trust block, return-page pickup summary, fundraiser admin grouping, and related polish. Treat sections 8–11 as a **backlog and prioritization lens**, not a checklist of current gaps. For **what’s done vs next** (including deploy), use **`docs/status-and-next.md`**; for stack and env, **`README.md`**.

## 1. Executive Summary

### Overall impression

The current app has a strong structural foundation: the information architecture is sensible, the codebase already has reusable layout primitives, the public site speaks in a local/community voice, and the fundraiser/admin flows are more mature than a typical early-stage nonprofit site. It already feels more intentional than a default starter.

What it does not yet feel like is a fully polished, emotionally convincing product. The experience is clean and competent, but still reads as "well-built placeholder" rather than "finished civic brand." The biggest gaps are visual hierarchy, page-to-page distinctiveness, richer trust signals, and a more designed dark mode.

### Top strengths

- Clear top-level navigation and route structure.
- Good baseline accessibility habits: skip link, semantic regions, labels, focus styles, and basic keyboard handling.
- A coherent light-theme direction built around Lions navy/gold rather than random defaults.
- Practical, plainspoken content that sounds local instead of corporate.
- Fundraiser and admin flows are logically organized and already usable.

### Top weaknesses

- Too many pages rely on the same plain `PageHeader + Prose` pattern, so the site feels flat and repetitive.
- The visual language is orderly but generic; it needs stronger composition, typography, imagery, and section contrast to feel memorable.
- Dark mode is functional, but not yet art-directed enough to feel intentionally designed.
- Public trust cues are still light: limited real-world contact detail, no photography, no officer richness, no testimonials, and placeholder legal/privacy language.
- Admin UX is highly utilitarian and efficient for developers, but not yet reassuring or elegant for real chapter volunteers.

### Biggest quick opportunities

- Introduce a more expressive page rhythm: hero depth, section backgrounds, stronger card hierarchy, better spacing cadence, and clearer CTA emphasis.
- Add real-world trust cues across the public site: photos, named contacts/officers, event recency, physical location prominence, and stronger fundraiser reassurance.
- Tighten theme tokens so surfaces, borders, muted text, shadows, and semantic states feel consistently designed in both themes, with a touch more gold warmth in the light theme so it feels less white-and-blue.
- Improve empty, loading, and success states so the app feels guided rather than merely functional.

## 2. Review Method

### Reviewed areas

- Public routes: `/`, `/about`, `/service`, `/events`, `/fundraising`, `/fundraising/order`, `/fundraising/order/return`, `/membership`, `/contact`, `/privacy`, `/terms`, `/login`
- Admin routes: `/admin/login`, `/admin`, `/admin/settings`, `/admin/social`, `/admin/officers`, `/admin/events`, `/admin/fundraiser`
- Shared app shell: root layout, header, mobile nav, footer, page header, prose container, theme provider/toggle, fundraiser banner, error and not-found pages
- Auth-related surfaces: header sign-in controls, login panel, admin login form, OAuth callback behavior, role labeling
- Theme-related code: `globals.css`, theme provider, theme toggle, brand/logo usage, semantic token choices

### Criteria used

- Visual design
- Usability
- Responsiveness
- Accessibility
- Consistency
- Theming
- Conversion / CTA clarity
- Trust and community feel

### Review note

This review is code-informed rather than screenshot-based. Recommendations are grounded in the current component structure, route composition, and styling patterns, with desktop/mobile implications inferred from the implementation.

## 3. Global UX / UI Findings

### What is working well

- The app has a clear shell: sticky header, top-level navigation, fundraiser banner, content body, footer, and back-to-top utility.
- The `Container`, `PageHeader`, and `Prose` primitives create a reliable baseline and prevent layout chaos.
- Navigation labels are understandable and community-appropriate.
- The site generally avoids jargon and over-marketing.
- Public and admin experiences are clearly separated.

### Layout consistency

- Consistent width and spacing rules are a strength.
- The downside is sameness: many secondary pages feel like near-identical text documents with a title strip.
- Recommendation: keep the shared structure, but create 2-3 page templates beyond `PageHeader + Prose`, such as:
  - narrative/info page
  - data/list page
  - conversion page

### Navigation clarity

- Main nav is well chosen.
- Mobile nav is usable; interaction is improved (backdrop, scroll lock, focus trap, Escape), but the panel is still visually plain compared to a fully designed drawer.
- The header currently lacks strong active-state feedback, so orientation is weaker than it should be.
- Recommendation: add active/current-page styling, stronger mobile panel framing, and a more explicit primary CTA in the header during key fundraising periods.

### Spacing system

- Spacing is mostly tidy and restrained.
- Section padding is often uniform to the point of monotony; there is not enough intentional compression/expansion to create momentum.
- Recommendation: introduce a spacing rhythm with more contrast between hero, content blocks, pull quotes/stats, and closing CTAs.

### Typography hierarchy

- Body readability is solid.
- Headings are competent but not distinctive. Geist works, but everything sits in the same tonal lane.
- Mono text is sometimes used effectively for labels, but the site still lacks a memorable display voice.
- Recommendation: either introduce a more characterful display treatment for headlines or build more hierarchy through size, weight, tracking, and contrast in section composition.

### Button and link consistency

- Primary buttons are mostly consistent: rounded-full, solid fill, medium emphasis.
- Secondary and tertiary links vary between ghost buttons, underlined text, and plain text links without a clear system.
- Recommendation: standardize to 3 interaction tiers:
  - primary solid CTA
  - secondary outlined CTA
  - text link / inline action

### Form patterns

- Forms are labeled and generally clear.
- They still look raw: thin borders, minimal helper text, limited grouping, no strong inline success patterns, and little visual guidance for high-stakes inputs.
- Recommendation: strengthen field grouping, helper text placement, section dividers, and submit-state feedback.

### Card and list patterns

- Cards exist on the home page and fundraiser/admin pages, but they do not yet form a cohesive visual system.
- Some lists are just bordered rows, others are soft cards, others are plain prose bullets.
- Recommendation: define a standard family of cards/lists:
  - story/marketing card
  - data row
  - admin editor card
  - status banner/callout

### Empty states

- Empty states are present in several places, which is good.
- They are text-only and emotionally flat.
- Recommendation: rewrite them as useful guidance states with next actions, example content, or "what this area is for" framing.

### Loading states

- Loading is mostly handled by disabled buttons or pending text.
- There are no skeletons, progress affordances, or page-level loading treatments.
- Recommendation: add at least subtle loading/saving states in admin and fundraiser flows.

### Error states

- Root error and 404 are acceptable, but generic.
- Form and auth errors appear as text banners with limited recovery guidance.
- Recommendation: make errors feel more reassuring and actionable:
  - what happened
  - what the user can do next
  - when to contact the club

### Responsiveness

- The layout choices are mostly mobile-safe: single-column forms, wrapped nav groups, constrained widths.
- The site does not appear broken on small screens, but it does not feel especially mobile-crafted either.
- Recommendation: improve mobile delight via tighter section sequencing, more selective text length, more deliberate sticky/CTA behavior, and softer panel transitions.

### Accessibility

- Strong baseline choices are already in place.
- Biggest likely gaps:
  - low-emphasis muted text may be too quiet in some contexts
  - interactive state differentiation depends heavily on hover
  - account/theme menus likely need stronger focus styling and state persistence
- Recommendation: run a dedicated contrast and keyboard pass before launch, especially in dark mode and amber banner contexts.

### Perceived trust and quality

- The site feels credible enough for an in-progress build.
- It does not yet feel richly anchored in a real local institution. There is not enough evidence of humans, place, continuity, or social proof.
- Recommendation: add local specificity visually and structurally, not just in copy.

### Civic / community alignment

- The tone is appropriately humble and useful.
- The design still leans "clean SaaS marketing shell" more than "warm, reliable community organization."
- Recommendation: bring in more tactile community cues:
  - local photography
  - event recency
  - named leadership
  - facility/location framing
  - subtle historical continuity

## 4. Theme and Color System Review

### Current assessment

The light theme is directionally good. The navy/gold palette is a strong fit for Lions branding and already gives the app more identity than generic blue-gray Tailwind work.

The current issue is balance: the light theme reads more white-and-blue than navy-and-gold. It is clean, but slightly cooler and flatter than it should be for a civic/community brand with Lions heritage.

The dark theme is serviceable, but it feels more like a token inversion than a fully composed night-mode experience. The palette works technically, but the relationship between primary, accent, muted surfaces, and semantic states still needs refinement.

### What is working

- Brand-relevant primary and accent choices.
- Semantic tokens exist and are used consistently enough to scale.
- Background, card, border, and text tokens are separated instead of hardcoded everywhere.
- The logo treatment on dark surfaces has been handled thoughtfully.

### Theme issues

- The light theme does not use enough gold or warm-neutral accenting in surfaces, dividers, highlights, and section transitions, so the experience can feel a little too white and utility-driven.
- Dark mode switches the primary CTA to gold, which is understandable, but this changes brand emphasis dramatically from light mode and can make the product feel like two different brands.
- The amber fundraiser banner competes with both the gold brand accent and other semantic warning tones.
- Shadows and depth are still generic; surfaces rely heavily on border plus flat fill rather than a richer material hierarchy.
- Muted text risks feeling too quiet in longer content-heavy pages, especially in dark mode.

### Color recommendations

- Introduce a restrained increase in gold across the light theme, not mainly as button fill, but as supporting warmth:
  - soft gold-tinted section backgrounds
  - gold hairlines or card accents
  - small highlight moments in stats, labels, or featured calls-to-action
- Keep navy as the stable brand anchor across both themes, and use gold more selectively as a premium/highlight accent rather than the dominant dark-mode interactive color.
- Reserve amber for fundraiser urgency only if warning/destructive tones stay clearly distinct.
- Add one warmer neutral or paper-like surface tone in light mode so the experience feels less cold and app-like.
- Refine semantic color usage so success, warning, destructive, and fundraising accents are visually distinct. (Partially addressed: semantic status tokens exist in `globals.css` and are used in admin and order error text; fundraiser amber remains a distinct lane.)

### Theme token/system recommendations

- Add a second-level surface token for layered sections and panels.
- Add a subtle elevated-surface shadow system instead of relying primarily on borders.
- Define stronger visited/hover/active states for text links and nav items.
- Consider route-specific accent usage rules so not every key action defaults to the same primary treatment.

### Surface/background treatment

- Many pages use `bg-muted/20`, `bg-muted/30`, or plain background with borders; this creates order but not atmosphere.
- Recommendation: introduce more intentional section transitions:
  - soft gradients
  - pale gold or warm-cream surface shifts in selected sections
  - warm paper or civic-hall style neutrals
  - restrained tinted bands for featured content

### Typography direction

- Geist is clean and modern, but by itself it does not create a memorable civic identity.
- Recommendation:
  - keep Geist for body/UI
  - add a distinct heading treatment through either a complementary display font or stronger headline styling rules

### Iconography / illustration direction

- Current icon usage is minimal and functional.
- Recommendation: use icons sparingly for service categories, trust details, and admin status, but avoid default startup iconography. Community-specific image blocks will add more value than more UI icons.

## 5. Page-by-Page UX Review

### Shared app shell: root layout, header, mobile nav, footer, fundraiser banner

- Purpose: global orientation, identity, navigation, trust, and cross-site consistency.
- What is working well:
  - Sticky header is useful.
  - Footer contains meaningful operational information.
  - Fundraiser banner is a smart business/community feature.
  - Theme control lives in the header on all breakpoints (single placement).
- UX issues:
  - Header lacks active states and stronger emphasis on the most important current action.
  - Mobile nav is functional but visually abrupt and generic.
  - Footer is informative, but not yet emotionally warm or visually memorable.
  - Banner is persistent and valuable, but not especially nuanced in hierarchy when multiple important messages compete.
- Visual design issues:
  - Shell components are clean but conservative.
  - Footer feels like four utility columns rather than a branded closing section.
- Theme/color issues:
  - Banner amber can visually overpower the more restrained site palette.
  - Dark mode shell feels flatter than light mode.
- Mobile/responsive concerns:
  - Mobile nav panel needs more polish and sense of structure.
  - Header controls can feel tight on narrow widths (theme + auth + menu); worth watching as more CTAs are added.
- Accessibility concerns:
  - Menus need careful focus-state review.
  - Active nav indication should not rely only on context memory.
- Recommended improvements:
  - Add active nav styling and current-route awareness.
  - Make the mobile menu feel like a designed panel, not just a dropped list.
  - Redesign the footer as a stronger brand/trust block.
  - Treat fundraiser banner as a campaign module with clearer urgency tiers.
- Priority level: High

### Home / landing page: `/`

- Purpose: explain the chapter quickly, establish trust, and route visitors into joining, contacting, donating, or ordering.
- What is working well:
  - CTA set is sensible.
  - Copy is grounded in actual local programs.
  - Section flow covers mission, impact, fundraising, events, membership, donations, and contact.
- UX issues:
  - The page is comprehensive, but not sharply prioritized.
  - Too many sections end in "link to another page" without enough visual or emotional payoff.
  - It lacks immediate proof that this is a real, active chapter.
- Visual design issues:
  - Hero is text-only and underpowered.
  - Repeated banded sections create predictability rather than momentum.
  - Program cards are tidy but generic.
- Theme/color issues:
  - Uses the palette correctly, but not memorably.
  - Gold is underused as a meaningful accent and the page leans too hard on white backgrounds plus blue-primary CTA patterns.
- Mobile/responsive concerns:
  - Content stack will likely be readable, but long.
  - The page would benefit from more compression and stronger visual anchors on mobile.
- Accessibility concerns:
  - Good semantic sectioning.
  - Need to ensure long-scrolling CTA repetition does not dilute clarity for screen-reader or keyboard users.
- Recommended improvements:
  - Rebuild the hero around a stronger composition: photo or collage, local place cue, trust microcopy, and a single dominant CTA with two supporting actions.
  - Add a "why people trust this chapter" block near the top.
  - Introduce one section with stronger visual storytelling rather than all text/cards.
  - Make the fundraiser module feel current and alive, not evergreen placeholder copy.
- Priority level: High

### About page: `/about`

- Purpose: explain who the chapter is, who leads it, and how it relates to Lions globally.
- What is working well:
  - Content tone is appropriate.
  - Officer data is already wired to real admin content.
- UX issues:
  - Leadership is structurally present but too thin to build confidence.
  - The page does not yet communicate chapter continuity, history, or community legitimacy strongly enough.
- Visual design issues:
  - Reads like a text memo.
  - Officer list needs richer presentation.
- Theme/color issues:
  - No special issue, but no visual payoff either.
- Mobile/responsive concerns:
  - Safe, but flat.
- Accessibility concerns:
  - Fine structurally.
- Recommended improvements:
  - Turn leadership into cards with role, optional photo, and service focus.
  - Add a short chapter story or timeline.
  - Add a clearer "local first, global network second" visual structure.
- Priority level: Medium

### Service page: `/service`

- Purpose: explain what the chapter actually does.
- What is working well:
  - Good program specificity.
  - Clear organization by service area.
- UX issues:
  - It is informative, but not skimmable enough for casual visitors.
  - There are no cues around who benefits, how often programs happen, or how to request help.
- Visual design issues:
  - Another strong example of the site overusing prose-only presentation.
- Theme/color issues:
  - Stable but unremarkable.
- Mobile/responsive concerns:
  - Long uninterrupted text will feel heavy on mobile.
- Accessibility concerns:
  - Fine semantically.
- Recommended improvements:
  - Break content into service cards/sections with icons, outcome framing, and action links.
  - Add "Need help?" and "Want to volunteer?" sidebars or callouts.
  - Distinguish recurring programs from occasional support.
- Priority level: Medium

### Events page: `/events`

- Purpose: show upcoming and recurring chapter activity.
- What is working well:
  - Events are admin-driven.
  - The recurring touchpoints section adds useful context when events are sparse.
- UX issues:
  - Empty state is honest but not compelling.
  - Event data is presented as a simple list, which lowers perceived importance.
  - No concept of featured event, date card, or event type.
- Visual design issues:
  - Plain bullet/list presentation feels unfinished.
- Theme/color issues:
  - No special issue.
- Mobile/responsive concerns:
  - Mobile will be readable but visually undifferentiated.
- Accessibility concerns:
  - Event dates should eventually be more semantically structured for assistive tech and scanning.
- Recommended improvements:
  - Use event cards or timeline rows with date emphasis.
  - Add badges for parade, screening, meeting, fundraiser, etc.
  - Improve the empty state with a stronger invitation to contact or follow updates.
- Priority level: Medium

### Fundraising page: `/fundraising`

- Purpose: market current and upcoming fundraising activity and route users into ordering.
- What is working well:
  - Business logic is thoughtful: accepts open orders, distinguishes closed-before-pickup events, and handles dates well.
  - Copy is practical and trust-oriented.
- UX issues:
  - The page communicates status, but not excitement.
  - It lacks stronger reassurance around how ordering works, what buyers should expect, and why funds matter.
- Visual design issues:
  - Current sections are text-led and list-like.
  - "Taking orders now" should feel more campaign-driven.
- Theme/color issues:
  - This page is a good candidate for richer gold/harvest accents, but it currently looks like the rest of the site.
- Mobile/responsive concerns:
  - Functional, though long lists of details could be better chunked.
- Accessibility concerns:
  - Links are clear; maps links are helpful.
- Recommended improvements:
  - Elevate current open events into more visual campaign cards with date, pickup, quantity/value cues, and urgency.
  - Add a trust block: secure checkout, when orders are recorded, who to contact if needed.
  - Clarify whether buying supports specific chapter programs.
- Priority level: High

### Chicken order page: `/fundraising/order`

- Purpose: collect order details and hand off to Stripe.
- What is working well:
  - Clear validation logic.
  - Good field labeling.
  - Helpful pricing and max-quantity feedback.
  - Selected fundraiser context is shown before checkout.
- UX issues:
  - The page is usable, but it still feels like a form inside a card, not a polished checkout experience.
  - There is little trust-building around payment, refunds, pickup expectations, or what happens after purchase.
  - No progress framing beyond "continue to payment."
- Visual design issues:
  - Needs stronger checkout hierarchy: order summary, form details, reassurance, support contact.
  - The card is well contained but visually generic.
- Theme/color issues:
  - Fine in light mode; dark mode likely needs extra contrast tuning in form fields and muted explanatory text.
- Mobile/responsive concerns:
  - Max width is appropriate.
  - Would benefit from a stickier or more persistent order summary on mobile.
- Accessibility concerns:
  - Validation messaging is present with inline email/quantity feedback, `aria-invalid` / `aria-busy`, and disabled fields while checkout is in flight; still worth a full keyboard + screen-reader pass in-browser.
  - Need to verify keyboard flow and error announcement behavior thoroughly in-browser.
- Recommended improvements:
  - Recast as a true checkout page with sections:
    - fundraiser details
    - your order
    - your contact info
    - what happens next
  - Add reassurance copy about receipt, pickup, and support.
  - Strengthen success/error/canceled continuity with the return page.
- Priority level: High

### Chicken order return page: `/fundraising/order/return`

- Purpose: confirm payment outcome and next steps.
- What is working well:
  - Covers success, not-paid, and verification-failed outcomes.
  - Copy is brief and understandable.
- UX issues:
  - Success state is too minimal for a paid transaction.
  - No summary, order details, pickup reminder, or next-step checklist.
- Visual design issues:
  - Transaction confirmation should feel more ceremonial and reassuring.
- Theme/color issues:
  - No major issue, but this page should use success styling more intentionally.
- Mobile/responsive concerns:
  - Layout is safe but sparse.
- Accessibility concerns:
  - Fine structurally.
- Recommended improvements:
  - Add richer confirmation treatment with clear next steps.
  - Include pickup expectations and support contact.
  - Use stronger success/warning/verification visual patterns.
- Priority level: High

### Membership page: `/membership`

- Purpose: persuade prospective members and explain sign-in/member status.
- What is working well:
  - Welcoming tone.
  - Clear explanation of guest/member/admin role progression.
- UX issues:
  - The page combines two audiences awkwardly: prospective volunteers and already-signed-in members.
  - It does not yet provide enough emotional payoff for joining.
- Visual design issues:
  - Reads as administrative explanation more than a recruitment page.
- Theme/color issues:
  - No special issue.
- Mobile/responsive concerns:
  - Fine, but text-heavy.
- Accessibility concerns:
  - Fine structurally.
- Recommended improvements:
  - Split the page into:
    - why join
    - what meetings feel like
    - how to get involved
    - returning member sign-in
  - Add member-life cues such as service, fellowship, flexibility, and time commitment.
- Priority level: High

### Contact page: `/contact`

- Purpose: let people reach the club for help, volunteering, or space use.
- What is working well:
  - Simple and clear.
  - Explicitly mentions nonprofit meeting-space support.
- UX issues:
  - Email-only contact feels temporary and slightly fragile.
  - There is no response expectation or alternate path for urgent/important requests.
- Visual design issues:
  - Minimal to the point of feeling unfinished.
- Theme/color issues:
  - No special issue.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Fine.
- Recommended improvements:
  - Add a lightweight contact form when ready.
  - Surface expected response time.
  - Reframe contact options by intent: request help, volunteer, partnership, facility use.
- Priority level: Medium

### Sign-in page: `/login`

- Purpose: general account sign-in.
- What is working well:
  - Extremely simple.
  - Consistent with header sign-in.
- UX issues:
  - It does not yet explain clearly why a non-admin user should sign in today.
  - The value proposition for having an account is underdeveloped.
- Visual design issues:
  - Feels like a utility stop, not a purposeful auth screen.
- Theme/color issues:
  - No major issue.
- Mobile/responsive concerns:
  - Safe.
- Accessibility concerns:
  - Simple and likely usable.
- Recommended improvements:
  - Clarify what signed-in users can do now versus later.
  - Add reassurance around privacy and how membership/admin access is assigned.
  - Give the auth panel more visual structure and brand context.
- Priority level: Medium

### Admin sign-in page: `/admin/login`

- Purpose: authenticate chapter admins.
- What is working well:
  - Separate admin entry point is clear.
  - Google and email/password options are both available.
  - Forbidden-state messaging is useful.
- UX issues:
  - Form does not feel especially secure or trustworthy despite being an admin surface.
  - There is little contextual framing about what admins can do once inside.
- Visual design issues:
  - Decent card, but still generic.
  - Missing stronger admin-brand differentiation and security cues.
- Theme/color issues:
  - Alert colors seem functional, but overall surface is plain.
- Mobile/responsive concerns:
  - Fine at current width.
- Accessibility concerns:
  - Labels are present; worth checking error focus and message persistence.
- Recommended improvements:
  - Add a short capability summary and security reassurance.
  - Make the page feel intentionally administrative, not simply "same app with a form card."
- Priority level: Medium

### Admin dashboard: `/admin`

- Purpose: orient admins to available site-management tasks.
- What is working well:
  - Simple and understandable.
- UX issues:
  - Very bare. It is more of a link list than a dashboard.
  - No recent activity, counts, next actions, or system status.
- Visual design issues:
  - Utility text only; no information hierarchy beyond heading and links.
- Theme/color issues:
  - No special issue.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Fine.
- Recommended improvements:
  - Convert into a real dashboard with cards for key tasks and current site state.
  - Add "what changed recently" or "what needs attention."
- Priority level: Medium

### Admin meeting schedule: `/admin/settings`

- Purpose: edit meeting text used in public surfaces.
- What is working well:
  - Purpose is clear.
  - Simple form matches the scope of the task.
- UX issues:
  - No preview, no formatting guidance, no save confirmation, no explanation of line breaks/where text appears visually.
- Visual design issues:
  - Sparse and unassisted.
- Theme/color issues:
  - Fine.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Form labels are present.
- Recommended improvements:
  - Add preview or "appears in footer and membership page like this" helper.
  - Add save feedback.
- Priority level: Medium

### Admin social links: `/admin/social`

- Purpose: manage footer social links.
- What is working well:
  - Sensible CRUD pattern.
  - Icon selection is straightforward.
- UX issues:
  - Existing rows and add form are serviceable, but not especially efficient.
  - No drag/reorder, preview, or URL validation feedback beyond server-side rejection.
- Visual design issues:
  - Editor rows feel form-heavy and cramped.
- Theme/color issues:
  - Fine.
- Mobile/responsive concerns:
  - Could get long and repetitive on mobile.
- Accessibility concerns:
  - Labels exist; worth checking form grouping and error surfacing.
- Recommended improvements:
  - Add preview and clearer row grouping.
  - Consider inline icon preview and stronger remove affordance hierarchy.
- Priority level: Low

### Admin officers: `/admin/officers`

- Purpose: manage officer listings on the About page.
- What is working well:
  - Simple CRUD works.
- UX issues:
  - Missing reordering controls, richer role metadata, and optional photo/contact fields.
  - Public outcome is underpowered, so admin value is limited.
- Visual design issues:
  - Rows are minimal and not very scannable.
- Theme/color issues:
  - Fine.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Acceptable.
- Recommended improvements:
  - Improve both the admin editor and the public officer presentation together.
- Priority level: Low

### Admin events: `/admin/events`

- Purpose: manage public event listings.
- What is working well:
  - Clear enough for simple event entry.
- UX issues:
  - No event type, time, location, or publish state.
  - No preview of how events will appear publicly.
- Visual design issues:
  - Functional but plain.
- Theme/color issues:
  - Fine.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Acceptable.
- Recommended improvements:
  - Add richer event metadata only if the public events page is also upgraded.
  - Use stronger row/card structure and success feedback.
- Priority level: Medium

### Admin fundraiser: `/admin/fundraiser`

- Purpose: manage chicken/fundraiser events, ordering windows, and commerce details.
- What is working well:
  - Strongest admin surface in the app.
  - Good operational data coverage.
  - Existing/edit states are logically organized.
- UX issues:
  - High-density form with little grouping, prioritization, or visual relief.
  - Important toggles and commerce fields are present, but the page asks admins to process a lot at once.
  - No preview of the public ordering experience.
- Visual design issues:
  - Dense edit cards feel more like raw database editors than polished operations tools.
- Theme/color issues:
  - Status colors help, but page still feels text-heavy.
- Mobile/responsive concerns:
  - Mobile will work, but the form density will be tiring.
- Accessibility concerns:
  - Labels are present, but long forms need clearer sectioning.
- Recommended improvements:
  - Group into sections: event basics, ordering window, pickup details, pricing/inventory, status.
  - Add a public-preview link and success confirmation.
  - Make "ordering open/closed" much more visually prominent.
- Priority level: High

### Privacy page: `/privacy`

- Purpose: explain data practices.
- What is working well:
  - Honest about current incompleteness.
- UX issues:
  - The current page weakens trust because payments and auth exist, but the policy is still notably provisional.
- Visual design issues:
  - Fine for a legal page, but content maturity is the real issue.
- Theme/color issues:
  - No issue.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Fine.
- Recommended improvements:
  - Expand this before production fundraising usage.
  - Add clear sections for auth, payments, order data, contact data, and retention.
- Priority level: High

### Terms page: `/terms`

- Purpose: establish site and transaction terms.
- What is working well:
  - Acknowledges fundraiser terms may be added.
- UX issues:
  - Like privacy, it feels too thin for a site with payment flow.
- Visual design issues:
  - Fine.
- Theme/color issues:
  - No issue.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Fine.
- Recommended improvements:
  - Add chicken-order terms, cancellation/refund guidance, and event/pickup caveats before launch.
- Priority level: High

### Error and not-found pages

- Purpose: recover from failures gracefully.
- What is working well:
  - Clear copy and obvious recovery actions.
- UX issues:
  - They feel generic rather than chapter-specific.
- Visual design issues:
  - Minimal and somewhat placeholder-like.
- Theme/color issues:
  - No major issue.
- Mobile/responsive concerns:
  - Fine.
- Accessibility concerns:
  - Good baseline structure.
- Recommended improvements:
  - Add warmer, more branded fallback language and subtle visual personality.
- Priority level: Low

### Member-related/dashboard/profile pages

- Current state:
  - No dedicated member dashboard, profile page, or member settings surface currently exists.
- Recommended intended UX direction:
  - If member auth remains part of the roadmap, build a small but purposeful member area rather than a generic portal.
  - Start with:
    - profile basics
    - order history
    - chapter updates/resources
  - Keep it low-complexity and community-oriented, not enterprise-member-portal styled.
- Priority level: Strategic

## 6. Flow Review

### First-time visitor exploring the site

- What works:
  - The main IA is understandable.
  - The home page communicates service areas and available next steps.
- Friction:
  - The site does not immediately prove activity or human presence.
  - Too much of the journey depends on reading instead of seeing.
- Opportunity:
  - Lead with stronger proof: photos, date-driven content, officer names, facility/location, and a clearer "how we help" scan path.

### Someone trying to sign in

- What works:
  - Google sign-in is easy.
  - General and admin auth surfaces are separated.
- Friction:
  - The non-admin sign-in value proposition is currently weak.
  - The distinction between guest/member/admin is explained, but not deeply contextualized.
- Opportunity:
  - Clarify why signing in matters today and what happens after sign-in.

### A member navigating the site

- What works:
  - Header account menu is lightweight and understandable.
- Friction:
  - There is not much member-specific destination value yet.
  - Membership page is more informational than task-driven for returning users.
- Opportunity:
  - If member functionality is delayed, de-emphasize "member UX" promises. If it is imminent, design a simple landing area that justifies account creation.

### An admin managing content or users

- What works:
  - Admin IA is straightforward.
  - CRUD surfaces are already practical.
- Friction:
  - The experience is form-dense and lacks confidence-building cues like previews, save states, or recent changes.
  - There is no "dashboard intelligence."
- Opportunity:
  - Make admin feel safe, predictable, and volunteer-friendly rather than developer-friendly only.

### Someone placing a chicken order

- What works:
  - Flow logic is solid.
  - Validation and state handling are thoughtful.
- Friction:
  - Checkout lacks trust copy and ceremonial confirmation.
  - Public marketing page and checkout page feel adjacent, but not fully part of one polished campaign flow.
- Opportunity:
  - Treat fundraiser ordering as the most important conversion journey in the app and polish it accordingly.

### Someone switching themes

- What works:
  - Theme toggle supports light, dark, and system.
  - Header placement keeps the control easy to find; the menu aligns to the trigger (`inline-flex` + alignment props) so the dropdown does not detach visually on small screens.
- Friction:
  - Theme change is mostly mechanical; the app does not yet feel intentionally authored in both appearances.
- Opportunity:
  - Make dark mode feel chosen, not merely available.

## 7. Visual Polish Opportunities

- Build a stronger homepage hero with photography, local context, and a more deliberate CTA stack.
- Create more distinctive section transitions so pages do not feel like repeated horizontal bands.
- Increase spacing contrast between headline areas, content blocks, and closing CTAs.
- Introduce a clearer interaction hierarchy across buttons, links, tabs, and menu items.
- Redesign empty states to teach and reassure rather than simply announce absence.
- Make loading, saving, and success states more visible in admin and checkout flows.
- Give the footer a stronger sense of place and continuity.
- Add a more distinctive community imagery strategy: chapter events, building/facility, service moments, volunteers.
- Turn plain prose pages into more visual editorial layouts where appropriate.
- Refine mobile nav and mobile section sequencing so the app feels designed for phones, not just adapted to them.

## 8. Quick Wins

- Add active nav states in desktop and mobile navigation.
- Strengthen the home-page hero without changing IA.
- Introduce a small increase in gold warmth across the light theme via section accents, highlighted cards, and decorative dividers.
- Upgrade fundraiser marketing and checkout trust copy.
- Improve footer design and trust content.
- Add more intentional empty states on events/admin pages.
- Add save/success feedback to admin forms.
- Refine dark-mode surface contrast and muted text readability.
- Expand privacy and terms so live auth/payment flows feel legitimate.

## 9. Strategic Improvements

- Develop 2-3 richer page templates so the site is not dominated by `PageHeader + Prose`.
- Introduce a more distinctive visual art direction with real photography and stronger typography.
- Design a full fundraiser campaign system spanning banner, marketing page, order form, and confirmation.
- Rework admin into a volunteer-friendly operations UI with previews, grouped sections, and dashboard context.
- Build a small but purposeful member area only if there is immediate user value.
- Establish a more nuanced theme system that keeps brand consistency across light/dark without feeling like inversion.

## 10. Prioritized Action Plan

### Phase 1: immediate polish fixes

- Improve homepage hero and section hierarchy.
- Add active navigation states.
- Improve fundraiser trust messaging on marketing, checkout, and confirmation pages.
- Expand privacy and terms for live auth/payment reality.
- Add better empty/success states in admin and events surfaces.

### Phase 2: consistency and theming improvements

- Refine theme tokens for surfaces, shadows, semantic colors, and dark-mode contrast.
- Standardize buttons, cards, list rows, and form layouts.
- Redesign footer and mobile nav to feel more branded and complete.

### Phase 3: page-specific UX refinements

- Rework About, Service, Events, Membership, and Contact into more expressive editorial/conversion pages.
- Upgrade admin dashboard and fundraiser editor with grouping, previews, and clearer status communication.
- Improve auth pages so they feel purposeful rather than merely functional.

### Phase 4: advanced delight and brand differentiation

- Add local photography and stronger community storytelling throughout the site.
- Introduce richer campaign and event presentation patterns.
- Add subtle motion and more art-directed transitions.
- Build a lightweight member area only if it supports real tasks and does not dilute the public mission.

## 11. Cursor Handoff

### Recommended Next UX Pass

The single best next area to improve first is the public conversion layer centered on the homepage and chicken fundraiser journey.

Why this should go first:

- It affects first impressions, trust, and the highest-value conversion path.
- It will set the visual standard for the rest of the site.
- It solves both branding and usability problems at once.

Most likely files/components to edit next:

- `src/components/home/Landing.tsx`
- `src/app/fundraising/page.tsx`
- `src/app/fundraising/order/ChickenOrderClient.tsx`
- `src/app/fundraising/order/return/page.tsx`
- `src/components/fundraising/FundraiserOrderBanner.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/app/globals.css`
