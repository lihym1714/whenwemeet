import { cookies } from "next/headers";

import type { AppLocale } from "@/i18n/routing";
import { hasSupabaseConfig } from "@/lib/env";
import { buildScheduleDays, buildSlotCounts, getBestWindows, mergeParticipantSummaries } from "@/lib/schedule";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AvailabilityRecord, EventRecord, ParticipantRecord } from "@/lib/types";
import { sha256 } from "@/lib/utils";

export type EventBundle = {
  event: EventRecord;
  participants: ParticipantRecord[];
  availability: AvailabilityRecord[];
  viewer: ParticipantRecord | null;
  viewerAvailability: string[];
  bestWindows: ReturnType<typeof getBestWindows>;
  slotCounts: Record<string, number>;
  participantSummaries: ReturnType<typeof mergeParticipantSummaries>;
};

export function getParticipantCookieName(slug: string) {
  return `wm_participant_${slug}`;
}

export async function getEventBundle(slug: string, locale: AppLocale): Promise<EventBundle | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRecord>();

  if (!event) {
    return null;
  }

  const [{ data: participants }, { data: availability }] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: true })
      .returns<ParticipantRecord[]>(),
    supabase
      .from("availability_entries")
      .select("*")
      .eq("event_id", event.id)
      .returns<AvailabilityRecord[]>(),
  ]);

  const safeParticipants = participants ?? [];
  const safeAvailability = availability ?? [];
  const cookieStore = await cookies();
  const rawViewerToken = cookieStore.get(getParticipantCookieName(slug))?.value;
  const hashedViewerToken = rawViewerToken ? await sha256(rawViewerToken) : null;
  const viewer = safeParticipants.find((participant) => participant.session_token_hash === hashedViewerToken) ?? null;
  const viewerAvailability =
    safeAvailability.find((entry) => entry.participant_id === viewer?.id)?.slot_ids ?? [];
  const days = buildScheduleDays(event, locale);
  const slotCounts = buildSlotCounts(safeAvailability);

  return {
    event,
    participants: safeParticipants,
    availability: safeAvailability,
    viewer,
    viewerAvailability,
    bestWindows: getBestWindows(days, slotCounts),
    slotCounts: Object.fromEntries(slotCounts.entries()),
    participantSummaries: mergeParticipantSummaries(safeParticipants, safeAvailability),
  };
}
