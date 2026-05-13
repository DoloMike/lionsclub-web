import { Button } from "@/components/ui/Button";
import type { HeritageFestivalSignupSheetDay } from "@/lib/heritage-festival-signups";

export type { HeritageFestivalSignupSheetDay };

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
    <div className="overflow-x-auto">
      <table
        aria-label="Heritage Festival 2026 signup sheet"
        className="min-w-full overflow-hidden rounded-2xl border border-border bg-card text-left align-top shadow-sm"
      >
        <caption className="sr-only">Heritage Festival 2026 signup sheet</caption>
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
              Date
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
              Signed up
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
              Add your name
            </th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date} id={day.date} className="border-t border-border align-top">
              <th
                scope="row"
                className="px-4 py-4 text-sm font-semibold text-foreground sm:px-5"
              >
                {day.label}
              </th>
              <td className="px-4 py-4 text-sm text-muted-foreground sm:px-5">
                {day.signups.length > 0 ? (
                  <ul className="space-y-2">
                    {day.signups.map((signup) => (
                      <li key={signup.id} className="rounded-lg bg-muted/40 px-3 py-2 text-foreground">
                        {signup.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No names yet.</p>
                )}
              </td>
              <td className="px-4 py-4 sm:px-5">
                {signupsEnabled ? (
                  <form action={addSignup} className="flex min-w-[16rem] flex-col gap-3">
                    <input type="hidden" name="signup_date" value={day.date} />
                    <label className="space-y-2 text-sm font-medium text-foreground">
                      <span className="sr-only">Your name for {day.label}</span>
                      <input
                        name="name"
                        type="text"
                        required
                        maxLength={80}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </label>
                    <Button type="submit">Add your name</Button>
                  </form>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    <p>Signup is temporarily unavailable.</p>
                    <Button type="button" disabled>
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
