"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import type { ActionState } from "@/lib/action-state";
import { hasSupabaseConfig } from "@/lib/env";
import { getParticipantCookieName } from "@/lib/data/events";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parseTimeInput, randomToken, sha256, slugify } from "@/lib/utils";

export async function createEventAction(
  locale: AppLocale,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations({ locale, namespace: "Errors" });

  if (!hasSupabaseConfig()) {
    return { status: "error", message: t("supabaseMissing") };
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const hostName = formData.get("hostName")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const timezone = formData.get("timezone")?.toString() ?? "Asia/Seoul";
  const startDate = formData.get("startDate")?.toString() ?? "";
  const endDate = formData.get("endDate")?.toString() ?? "";
  const dayStart = formData.get("dayStart")?.toString() ?? "09:00";
  const dayEnd = formData.get("dayEnd")?.toString() ?? "22:00";
  const slotMinutes = Number(formData.get("slotMinutes")?.toString() ?? "30");

  if (!title || !hostName || !startDate || !endDate) {
    return { status: "error", message: t("missingFields") };
  }

  const dayStartMinutes = parseTimeInput(dayStart);
  const dayEndMinutes = parseTimeInput(dayEnd);

  if (dayStartMinutes >= dayEndMinutes) {
    return { status: "error", message: t("invalidTimeRange") };
  }

  if (startDate > endDate) {
    return { status: "error", message: t("invalidDateRange") };
  }

  const supabase = createSupabaseAdminClient();
  const slugBase = slugify(title) || "event";
  const slug = `${slugBase}-${randomToken(6).toLowerCase()}`;
  const participantToken = randomToken();
  const participantTokenHash = await sha256(participantToken);
  const colorToken = ["lime", "cyan", "amber", "rose", "violet", "sky"][Math.floor(Math.random() * 6)];

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      slug,
      title,
      description: description || null,
      timezone,
      start_date: startDate,
      end_date: endDate,
      day_start_minutes: dayStartMinutes,
      day_end_minutes: dayEndMinutes,
      slot_minutes: slotMinutes,
    })
    .select("id")
    .single<{ id: string }>();

  if (eventError || !event) {
    return { status: "error", message: eventError?.message ?? t("generic") };
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      event_id: event.id,
      display_name: hostName,
      color_token: colorToken,
      session_token_hash: participantTokenHash,
    })
    .select("id")
    .single<{ id: string }>();

  if (participantError || !participant) {
    return { status: "error", message: participantError?.message ?? t("generic") };
  }

  const { error: availabilityError } = await supabase.from("availability_entries").insert({
    participant_id: participant.id,
    event_id: event.id,
    slot_ids: [],
  });

  if (availabilityError) {
    return { status: "error", message: availabilityError.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(getParticipantCookieName(slug), participantToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/${locale}/events/${encodeURIComponent(slug)}`);
}

export async function joinEventAction(
  locale: AppLocale,
  slug: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations({ locale, namespace: "Errors" });

  if (!hasSupabaseConfig()) {
    return { status: "error", message: t("supabaseMissing") };
  }

  const displayName = formData.get("displayName")?.toString().trim() ?? "";

  if (!displayName) {
    return { status: "error", message: t("missingFields") };
  }

  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle<{ id: string }>();

  if (!event) {
    return { status: "error", message: t("eventMissing") };
  }

  const participantToken = randomToken();
  const participantTokenHash = await sha256(participantToken);
  const colorToken = ["lime", "cyan", "amber", "rose", "violet", "sky"][Math.floor(Math.random() * 6)];

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      event_id: event.id,
      display_name: displayName,
      color_token: colorToken,
      session_token_hash: participantTokenHash,
    })
    .select("id")
    .single<{ id: string }>();

  if (participantError || !participant) {
    return { status: "error", message: participantError?.message ?? t("generic") };
  }

  const { error: availabilityError } = await supabase.from("availability_entries").insert({
    participant_id: participant.id,
    event_id: event.id,
    slot_ids: [],
  });

  if (availabilityError) {
    return { status: "error", message: availabilityError.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(getParticipantCookieName(slug), participantToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/${locale}/events/${encodeURIComponent(slug)}`);
}

export async function saveAvailabilityAction(
  locale: AppLocale,
  slug: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations({ locale, namespace: "Errors" });

  if (!hasSupabaseConfig()) {
    return { status: "error", message: t("supabaseMissing") };
  }

  const cookieStore = await cookies();
  const participantToken = cookieStore.get(getParticipantCookieName(slug))?.value;

  if (!participantToken) {
    return { status: "error", message: t("participantMissing") };
  }

  const slotIdsRaw = formData.get("slotIds")?.toString() ?? "[]";
  const slotIds = JSON.parse(slotIdsRaw) as string[];
  const participantTokenHash = await sha256(participantToken);
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle<{ id: string }>();

  if (!event) {
    return { status: "error", message: t("eventMissing") };
  }

  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", event.id)
    .eq("session_token_hash", participantTokenHash)
    .maybeSingle<{ id: string }>();

  if (!participant) {
    return { status: "error", message: t("participantMissing") };
  }

  const { error } = await supabase.from("availability_entries").upsert(
    {
      participant_id: participant.id,
      event_id: event.id,
      slot_ids: slotIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "participant_id" },
  );

  if (error) {
    return { status: "error", message: t("saveFailed") };
  }

  revalidatePath(`/${locale}/events/${encodeURIComponent(slug)}`);

  return {
    status: "success",
    message: new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };
}
