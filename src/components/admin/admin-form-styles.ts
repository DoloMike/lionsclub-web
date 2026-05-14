/**
 * Shared admin-form styling tokens.
 *
 * Admin forms share enough of a look (rounded-md inputs, primary save button,
 * subtle destructive link for deletes) that a small set of class-name
 * constants keeps every page lined up without rebuilding `<input>` and
 * `<button>` wrappers from scratch. Update here, every admin form follows.
 */

/** Primary submit button — use for "Save", "Add ___", "Upload", etc. */
export const adminPrimaryButtonClass =
  "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 active:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Compact variant (per-row "Save" inside list items). */
export const adminPrimaryButtonCompactClass =
  "inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 active:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Destructive text link — use for "Remove" / "Delete" affordances. */
export const adminDestructiveLinkClass =
  "text-sm font-medium text-destructive hover:underline";

/** Text input / textarea / select. */
export const adminInputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

/** Field label. */
export const adminLabelClass =
  "block text-sm font-medium text-foreground";
