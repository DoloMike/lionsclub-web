import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { defaultSocialLinks, site } from "@/lib/site";

export type OfficerRow = {
  id: string;
  name: string;
  title: string;
  sort_order: number;
};

export type ChapterEventRow = {
  id: string;
  title: string;
  event_date: string;
  description: string | null;
  sort_order: number;
};

export type SocialLinkRow = {
  id: string;
  label: string;
  url: string;
  icon_key: string;
  sort_order: number;
};

const getCachedMeetingSchedule = unstable_cache(
  async (): Promise<string> => {
    const supabase = createPublicServerClient();
    if (!supabase) return site.meeting.schedule;

    const { data, error } = await supabase
      .from("site_settings")
      .select("meeting_schedule")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.meeting_schedule?.trim()) {
      return site.meeting.schedule;
    }
    return data.meeting_schedule;
  },
  ["meeting-schedule"],
  { revalidate: 300 }
);

export async function getMeetingSchedule(): Promise<string> {
  return getCachedMeetingSchedule();
}

export async function getOfficers(): Promise<OfficerRow[]> {
  const supabase = createPublicServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("officers")
    .select("id, name, title, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getChapterEvents(): Promise<ChapterEventRow[]> {
  const supabase = createPublicServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("chapter_events")
    .select("id, title, event_date, description, sort_order")
    .order("event_date", { ascending: true });

  if (error || !data) return [];
  return data;
}

const getCachedSocialLinks = unstable_cache(
  async (): Promise<SocialLinkRow[]> => {
    const supabase = createPublicServerClient();
    if (!supabase) {
      return defaultSocialLinks.map((s, i) => ({
        id: `fallback-${i}`,
        label: s.label,
        url: s.url,
        icon_key: s.icon_key,
        sort_order: i + 1,
      }));
    }

    const { data, error } = await supabase
      .from("social_links")
      .select("id, label, url, icon_key, sort_order")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return defaultSocialLinks.map((s, i) => ({
        id: `fallback-${i}`,
        label: s.label,
        url: s.url,
        icon_key: s.icon_key,
        sort_order: i + 1,
      }));
    }

    return data;
  },
  ["social-links"],
  { revalidate: 300 }
);

export async function getSocialLinks(): Promise<SocialLinkRow[]> {
  return getCachedSocialLinks();
}
