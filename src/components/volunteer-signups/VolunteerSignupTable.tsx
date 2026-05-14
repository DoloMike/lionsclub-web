import { Button } from "@/components/ui/Button";
import { SignInToSignUpButton } from "@/components/volunteer-signups/SignInToSignUpButton";
import {
  formatShiftDateLabel,
  type VolunteerShiftWithSignups,
} from "@/lib/volunteer-signups";

export type VolunteerSignupTableViewer = {
  id: string;
  displayName: string;
};

/**
 * Public signup sheet rendered as a stack of shift cards.
 *
 * Cards (rather than a `<table>`) so the layout works on phones without forcing
 * horizontal scroll. On wider screens the body splits into a 2-column "signed
 * up" / "sign up" grid so it still reads like a sheet.
 */
export function VolunteerSignupTable({
  eventSlug,
  shifts,
  viewer,
  addSignup,
  removeMySignup,
  signupsEnabled,
}: {
  eventSlug: string;
  shifts: VolunteerShiftWithSignups[];
  /** `null` when no one is signed in — table renders sign-in CTAs instead. */
  viewer: VolunteerSignupTableViewer | null;
  addSignup: (formData: FormData) => void | Promise<void>;
  removeMySignup: (formData: FormData) => void | Promise<void>;
  signupsEnabled: boolean;
}) {
  if (shifts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        No shifts have been added for this event yet.
      </p>
    );
  }
  return (
    <section aria-label="Volunteer signup sheet">
      <ul className="space-y-4">
        {shifts.map((shift) => {
          const mySignup =
            viewer != null
              ? (shift.signups.find((s) => s.userId === viewer.id) ?? null)
              : null;
          const full =
            shift.maxSignups != null &&
            shift.signupCount >= shift.maxSignups;
          const dateLabel = formatShiftDateLabel(shift.shiftDate);

          return (
            <li
              key={shift.id}
              id={`shift-${shift.id}`}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <header className="border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
                {shift.shiftLabel ? (
                  <p className="text-base font-bold text-foreground">
                    {shift.shiftLabel}
                  </p>
                ) : null}
                <p
                  className={
                    shift.shiftLabel
                      ? "text-sm font-medium text-foreground"
                      : "text-base font-bold text-foreground"
                  }
                >
                  {dateLabel}
                  {shift.timeLabel ? (
                    <span className="font-normal text-muted-foreground">
                      {" · "}
                      {shift.timeLabel}
                    </span>
                  ) : null}
                </p>
                {shift.notes ? (
                  <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
                    {shift.notes}
                  </p>
                ) : null}
                {shift.maxSignups != null ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {shift.signupCount} of {shift.maxSignups} spots filled
                  </p>
                ) : null}
              </header>

              <div className="grid gap-5 px-4 py-4 sm:grid-cols-2 sm:px-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Signed up
                  </p>
                  {shift.signups.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {shift.signups.map((signup) => {
                        const isMe =
                          viewer != null && signup.userId === viewer.id;
                        return (
                          <li
                            key={signup.id}
                            className={
                              isMe
                                ? "rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground"
                                : "rounded-lg bg-muted/40 px-3 py-1.5 text-sm text-foreground"
                            }
                          >
                            {signup.name}
                            {isMe ? (
                              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-primary">
                                You
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No names yet.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sign up
                  </p>
                  <div className="mt-2">
                    <ShiftSignupAction
                      eventSlug={eventSlug}
                      shiftId={shift.id}
                      dateLabel={dateLabel}
                      viewer={viewer}
                      mySignupId={mySignup?.id ?? null}
                      full={full}
                      signupsEnabled={signupsEnabled}
                      addSignup={addSignup}
                      removeMySignup={removeMySignup}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ShiftSignupAction({
  eventSlug,
  shiftId,
  dateLabel,
  viewer,
  mySignupId,
  full,
  signupsEnabled,
  addSignup,
  removeMySignup,
}: {
  eventSlug: string;
  shiftId: string;
  dateLabel: string;
  viewer: VolunteerSignupTableViewer | null;
  mySignupId: string | null;
  full: boolean;
  signupsEnabled: boolean;
  addSignup: (formData: FormData) => void | Promise<void>;
  removeMySignup: (formData: FormData) => void | Promise<void>;
}) {
  if (viewer == null) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Sign in with Google to add yourself to this shift.
        </p>
        <SignInToSignUpButton
          nextPath={`/volunteer/${eventSlug}#shift-${shiftId}`}
        />
      </div>
    );
  }

  if (mySignupId) {
    return (
      <form
        action={removeMySignup}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="signup_id" value={mySignupId} />
        <input type="hidden" name="slug" value={eventSlug} />
        <p className="text-sm font-medium text-success">
          ✓ You&apos;re signed up
        </p>
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          Remove me
        </Button>
      </form>
    );
  }

  if (!signupsEnabled) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
        <p>Signup is not currently open.</p>
        <Button type="button" disabled className="mt-2 w-full sm:w-auto">
          Signup unavailable
        </Button>
      </div>
    );
  }

  if (full) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
        <p>This shift is full.</p>
        <Button type="button" disabled className="mt-2 w-full sm:w-auto">
          Shift full
        </Button>
      </div>
    );
  }

  return (
    <form action={addSignup} className="flex flex-col gap-2">
      <input type="hidden" name="shift_id" value={shiftId} />
      <input type="hidden" name="slug" value={eventSlug} />
      <p className="text-xs text-muted-foreground">
        Signing up as{" "}
        <span className="font-semibold text-foreground">
          {viewer.displayName}
        </span>
      </p>
      <Button type="submit" className="w-full sm:w-auto">
        <span className="sr-only">{`Add me to ${dateLabel}`}</span>
        <span aria-hidden>Add me</span>
      </Button>
    </form>
  );
}
