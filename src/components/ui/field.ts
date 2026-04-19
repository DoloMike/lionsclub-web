/**
 * Single source of truth for `<input>`, `<select>`, `<textarea>` styling.
 * Centralizes the focus glow (subtle ring + border bloom) so every field
 * behaves identically; previously each form rebuilt the same class string
 * inline with no `focus:` styles at all.
 *
 * Use `aria-invalid` on the element to flip to the destructive variant
 * (replaces hand-rolled `border-destructive ring-1 ring-destructive/40`
 * conditionals).
 */
const fieldBase =
  "block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground " +
  "shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)] " +
  "transition-[border-color,box-shadow] duration-150 ease-out " +
  "placeholder:text-muted-foreground/70 " +
  "focus:outline-none focus:border-ring focus:ring-4 focus:ring-ring/15 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-destructive/15 " +
  "aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-destructive/20";

export function fieldClassName(extra = ""): string {
  return `${fieldBase} border-border ${extra}`.trim();
}
