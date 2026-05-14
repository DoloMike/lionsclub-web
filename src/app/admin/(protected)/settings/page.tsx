import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { site } from "@/lib/site";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import { updateMeetingSchedule } from "../actions";

export default async function AdminSettingsPage() {
  const { data } = await getSupabaseAdmin()
    .from("site_settings")
    .select("meeting_schedule")
    .eq("id", 1)
    .maybeSingle();

  const value =
    data?.meeting_schedule?.trim() || site.meeting.schedule;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Meeting schedule
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        This text appears in the site footer and on the Membership page. Venue
        address is fixed in code (
        <span className="font-mono text-xs">{site.address.displayLine}</span>
        ).
      </p>
      <form
        action={updateMeetingSchedule}
        className="mt-8 max-w-xl space-y-4 rounded-lg border border-border bg-card p-5"
      >
        <div>
          <label htmlFor="meeting_schedule" className={adminLabelClass}>
            Schedule
          </label>
          <textarea
            id="meeting_schedule"
            name="meeting_schedule"
            required
            rows={6}
            defaultValue={value}
            className={adminInputClass}
          />
        </div>
        <button type="submit" className={adminPrimaryButtonClass}>
          Save
        </button>
      </form>
    </div>
  );
}
