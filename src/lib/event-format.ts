import type { AppLocale } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/env";
import { formatMinutes } from "@/lib/utils";

export function getShareUrl(locale: AppLocale, slug: string) {
  return `${getBaseUrl()}/${locale}/events/${encodeURIComponent(slug)}`;
}

export function formatSlotSize(minutes: number) {
  return `${minutes}m`;
}

export function formatTimeRange(start: number, end: number) {
  return `${formatMinutes(start)}–${formatMinutes(end)}`;
}
