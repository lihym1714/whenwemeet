import { DateTime } from "luxon";

import type { AppLocale } from "@/i18n/routing";
import type { AvailabilityRecord, EventRecord, ParticipantRecord } from "@/lib/types";

export type ScheduleSlot = {
  slotId: string;
  isoDate: string;
  dayLabel: string;
  dayShortLabel: string;
  timeLabel: string;
  timeNumberLabel: string;
  startsAtIso: string;
};

export type ScheduleDay = {
  isoDate: string;
  label: string;
  shortLabel: string;
  slots: ScheduleSlot[];
};

export type BestWindow = {
  label: string;
  participantCount: number;
  slotIds: string[];
};

const localeMap: Record<AppLocale, string> = {
  en: "en",
  ko: "ko",
};

export function buildScheduleDays(event: EventRecord, locale: AppLocale) {
  const days: ScheduleDay[] = [];
  const localeCode = localeMap[locale];

  let cursor = DateTime.fromISO(event.start_date, { zone: event.timezone }).startOf("day");
  const end = DateTime.fromISO(event.end_date, { zone: event.timezone }).startOf("day");

  while (cursor <= end) {
    const slots: ScheduleSlot[] = [];

    for (
      let minute = event.day_start_minutes;
      minute < event.day_end_minutes;
      minute += event.slot_minutes
    ) {
      const slotStart = cursor.plus({ minutes: minute });

      slots.push({
        slotId: slotStart.toUTC().toISO() ?? `${cursor.toISODate()}-${minute}`,
        isoDate: cursor.toISODate()!,
        dayLabel: cursor.setLocale(localeCode).toFormat("ccc dd LLL"),
        dayShortLabel: cursor.setLocale(localeCode).toFormat("ccc dd"),
        timeLabel: slotStart.setLocale(localeCode).toFormat("HH:mm"),
        timeNumberLabel: slotStart.setLocale(localeCode).toFormat("HH:mm"),
        startsAtIso: slotStart.toISO() ?? "",
      });
    }

    days.push({
      isoDate: cursor.toISODate()!,
      label: cursor.setLocale(localeCode).toFormat("cccc, dd LLLL"),
      shortLabel: cursor.setLocale(localeCode).toFormat("ccc dd"),
      slots,
    });

    cursor = cursor.plus({ days: 1 });
  }

  return days;
}

export function buildSlotCounts(availability: AvailabilityRecord[]) {
  const counts = new Map<string, number>();

  for (const entry of availability) {
    for (const slotId of entry.slot_ids) {
      counts.set(slotId, (counts.get(slotId) ?? 0) + 1);
    }
  }

  return counts;
}

export function getBestWindows(days: ScheduleDay[], counts: Map<string, number>) {
  const windows: BestWindow[] = [];
  const topCount = Math.max(0, ...Array.from(counts.values()));

  if (topCount === 0) {
    return windows;
  }

  for (const day of days) {
    let current: ScheduleSlot[] = [];

    for (const slot of day.slots) {
      if ((counts.get(slot.slotId) ?? 0) === topCount) {
        current.push(slot);
      } else if (current.length > 0) {
        windows.push(windowFromSlots(current, topCount));
        current = [];
      }
    }

    if (current.length > 0) {
      windows.push(windowFromSlots(current, topCount));
    }
  }

  return windows.slice(0, 3);
}

function windowFromSlots(slots: ScheduleSlot[], participantCount: number): BestWindow {
  const first = slots[0];
  const last = slots[slots.length - 1];

  return {
    label: `${first.dayLabel} · ${first.timeLabel}–${last.timeLabel}`,
    participantCount,
    slotIds: slots.map((slot) => slot.slotId),
  };
}

export function mapAvailabilityByParticipant(availability: AvailabilityRecord[]) {
  return new Map(availability.map((entry) => [entry.participant_id, new Set(entry.slot_ids)]));
}

export function mergeParticipantSummaries(
  participants: ParticipantRecord[],
  availability: AvailabilityRecord[],
) {
  const availabilityMap = mapAvailabilityByParticipant(availability);

  return participants.map((participant) => ({
    ...participant,
    selectedCount: availabilityMap.get(participant.id)?.size ?? 0,
  }));
}
