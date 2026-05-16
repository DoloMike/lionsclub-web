import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { type HeritageFestivalSignupSheetDay } from "@/lib/heritage-festival-signups";

export type { HeritageFestivalSignupSheetDay };

function MobileSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3 md:hidden">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/85">
        {children}
      </span>
      <span className="h-px min-w-[1.5rem] flex-1 bg-gradient-to-r from-border/55 to-transparent" aria-hidden />
    </div>
  );
}

export function HeritageFestivalSignupTable({
  days,
  addSignup,
  signupsEnabled = true,
}: {
  days: HeritageFestivalSignupSheetDay[];
  addSignup: (formData: FormData) => void | Promise<void>;
  signupsEnabled?: boolean;
}) {
  return (
    <div className="md:overflow-x-auto">
      <table
        aria-label="Heritage Festival 2026 signup sheet"
        className="block w-full text-left md:table md:table-auto md:min-w-full md:rounded-2xl md:border md:border-border md:bg-card md:align-top md:shadow-sm"
      >
        <caption className="sr-only">Heritage Festival 2026 signup sheet</caption>
        <thead className="hidden bg-muted/50 md:table-header-group">
          <tr className="md:table-row">
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5 md:table-cell">
              Date
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5 md:table-cell">
              Signed up
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5 md:table-cell">
              Add your name
            </th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {days.map((day) => (
            <tr
              key={day.date}
              id={day.date}
              className="relative mb-5 block scroll-mt-[5.75rem] overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.08)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-[3px] before:bg-gradient-to-r before:from-primary/60 before:via-primary/30 before:to-transparent last:mb-0 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_28px_-6px_rgba(0,0,0,0.45)] md:mb-0 md:table-row md:rounded-none md:border-0 md:border-t md:border-border md:bg-transparent md:shadow-none md:before:hidden dark:md:shadow-none"
            >
              <th
                scope="row"
                className="block px-5 pb-0 pt-5 text-sm font-semibold text-foreground md:table-cell md:px-5 md:py-4 md:align-top"
              >
                <MobileSectionLabel>Day</MobileSectionLabel>
                <div className="space-y-2 md:space-y-1.5">
                  {day.title ? (
                    <p className="text-[1.125rem] font-bold leading-tight tracking-tight text-foreground sm:text-xl md:text-base md:font-bold">
                      {day.title}
                    </p>
                  ) : null}
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[0.9375rem] leading-snug sm:text-base">
                    <span className="font-semibold tracking-tight text-foreground">{day.label}</span>
                    <span
                      className="select-none text-muted-foreground/40 md:hidden"
                      aria-hidden
                    >
                      ·
                    </span>
                    <span className="text-sm font-medium tabular-nums tracking-normal text-muted-foreground md:text-xs md:font-medium md:uppercase md:tracking-wide">
                      {day.timeLabel}
                    </span>
                  </p>
                </div>
              </th>
              <td className="block border-t border-border/40 px-5 py-5 text-base text-muted-foreground md:table-cell md:border-0 md:py-4 md:text-sm md:align-top">
                <MobileSectionLabel>Signed up</MobileSectionLabel>
                {day.signups.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {day.signups.map((signup) => (
                      <li
                        key={signup.id}
                        className="break-words rounded-xl border border-border/35 bg-muted/25 px-3.5 py-2.5 text-sm font-medium leading-snug text-foreground md:border-0 md:bg-muted/40"
                      >
                        {signup.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-border/45 bg-muted/15 px-4 py-3.5 text-center text-sm leading-relaxed text-muted-foreground md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-left">
                    <span className="italic">No one yet.</span> Be the first below.
                  </p>
                )}
              </td>
              <td className="block border-t border-border/40 bg-muted/[0.07] px-5 pb-6 pt-5 md:table-cell md:border-0 md:bg-transparent md:px-4 md:py-4 md:pb-4 md:pt-4 lg:px-5">
                <MobileSectionLabel>Add name</MobileSectionLabel>
                {signupsEnabled ? (
                  <form
                    action={addSignup}
                    className="flex w-full min-w-0 flex-col gap-3.5 md:max-w-none md:min-w-[14rem] md:gap-3"
                  >
                    <input type="hidden" name="signup_date" value={day.date} />
                    <label className="block text-base font-medium text-foreground sm:text-sm md:text-sm">
                      <span className="sr-only">Your name for {day.label}</span>
                      <input
                        name="name"
                        type="text"
                        required
                        maxLength={80}
                        placeholder="Your name"
                        autoComplete="name"
                        className="w-full min-h-12 rounded-2xl border border-input/90 bg-background px-4 py-3 text-base text-foreground shadow-sm outline-none ring-offset-background transition placeholder:text-muted-foreground/55 focus-visible:border-ring/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-10 sm:py-2.5 sm:text-sm"
                      />
                    </label>
                    <Button
                      type="submit"
                      className="w-full touch-manipulation py-3.5 text-[0.9375rem] sm:py-2.5 md:w-auto md:py-2.5 md:text-sm"
                    >
                      Add your name
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-dashed border-border/55 bg-background/60 px-4 py-4 text-base text-muted-foreground sm:text-sm md:bg-muted/20">
                    <p>Signup is temporarily unavailable.</p>
                    <Button
                      type="button"
                      disabled
                      className="w-full touch-manipulation py-3.5 sm:py-2.5 md:w-auto md:py-2.5"
                    >
                      Signup unavailable
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
