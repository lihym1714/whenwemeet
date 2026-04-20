import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AvailabilityGrid } from "@/components/availability-grid";
import { CopyButton } from "@/components/copy-button";
import { JoinEventForm } from "@/components/join-event-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getEventBundle } from "@/lib/data/events";
import { hasSupabaseConfig } from "@/lib/env";
import { formatSlotSize, formatTimeRange, getShareUrl } from "@/lib/event-format";
import { buildScheduleDays } from "@/lib/schedule";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tEvent = await getTranslations({ locale, namespace: "Event" });
  const tLocale = await getTranslations({ locale, namespace: "Locale" });

  if (!hasSupabaseConfig()) {
    return (
      <main className="min-h-screen bg-[#f5f4ef] px-6 py-8 text-zinc-950 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-8">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ArrowLeft className="h-4 w-4" />
              {tEvent("back")}
            </Link>
            <LanguageSwitcher currentLocale={locale} label={tLocale("switch")} />
          </div>
          <div className="rounded-[2rem] border border-zinc-900/10 bg-white p-8 shadow-sm">
            <p className="text-lg leading-8 text-zinc-700">{tEvent("eventMissing")}</p>
          </div>
        </div>
      </main>
    );
  }

  const bundle = await getEventBundle(slug, locale);

  if (!bundle) {
    return (
      <main className="min-h-screen bg-[#f5f4ef] px-6 py-8 text-zinc-950 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-8">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ArrowLeft className="h-4 w-4" />
              {tEvent("back")}
            </Link>
            <LanguageSwitcher currentLocale={locale} label={tLocale("switch")} />
          </div>
          <div className="rounded-[2rem] border border-zinc-900/10 bg-white p-8 shadow-sm">
            <p className="text-lg leading-8 text-zinc-700">{tEvent("missingSupabase")}</p>
          </div>
        </div>
      </main>
    );
  }

  const shareUrl = getShareUrl(locale, slug);
  const days = buildScheduleDays(bundle.event, locale);

  return (
    <main className="min-h-screen bg-[#f5f4ef] px-6 py-8 text-zinc-950 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
            <ArrowLeft className="h-4 w-4" />
            {tEvent("back")}
          </Link>
          <LanguageSwitcher currentLocale={locale} label={tLocale("switch")} />
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="grid gap-6 rounded-[2rem] border border-zinc-900/10 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="grid gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">WhenWeMeet</p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                  {bundle.event.title}
                </h1>
                {bundle.event.description ? (
                  <p className="max-w-2xl text-base leading-7 text-zinc-600">{bundle.event.description}</p>
                ) : null}
              </div>
              <CopyButton value={shareUrl} label={tEvent("copy")} copiedLabel={tEvent("copied")} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-400">{tEvent("share")}</p>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{tEvent("shareHint")}</p>
              </div>
              <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                  <Clock3 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-400">{tEvent("timezone")}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-950">{bundle.event.timezone}</p>
                <p className="mt-1 text-sm text-zinc-600">{formatTimeRange(bundle.event.day_start_minutes, bundle.event.day_end_minutes)}</p>
              </div>
              <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-400">{tEvent("participants")}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-950">{bundle.participants.length}</p>
                <p className="mt-1 text-sm text-zinc-600">{formatSlotSize(bundle.event.slot_minutes)}</p>
              </div>
            </div>
          </div>

          <aside className="grid gap-5 rounded-[2rem] border border-zinc-900/10 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{tEvent("bestTimes")}</p>
              <div className="mt-4 grid gap-3">
                {bundle.bestWindows.length > 0 ? (
                  bundle.bestWindows.map((window) => (
                    <div key={window.label} className="rounded-[1.5rem] bg-zinc-950 p-4 text-white">
                      <p className="text-sm font-semibold">{window.label}</p>
                      <p className="mt-2 text-sm text-zinc-300">{window.participantCount} {tEvent("participants")}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.5rem] bg-zinc-50 p-4 text-sm leading-7 text-zinc-600">{tEvent("noBestTimes")}</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{tEvent("manageNote")}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {days.length} days · {bundle.event.timezone} · {bundle.participants.length} {tEvent("participants")}
              </p>
            </div>
          </aside>
        </section>

        {!bundle.viewer ? (
          <JoinEventForm
            locale={locale}
            slug={slug}
            labels={{
              title: tEvent("joinTitle"),
              description: tEvent("joinDescription"),
              nameLabel: tEvent("nameLabel"),
              submit: tEvent("joinSubmit"),
            }}
          />
        ) : (
          <AvailabilityGrid
            locale={locale}
            slug={slug}
            event={bundle.event}
            initialSelectedSlots={bundle.viewerAvailability}
            slotCounts={bundle.slotCounts}
            participantSummaries={bundle.participantSummaries}
            labels={{
              save: tEvent("save"),
              saving: tEvent("saving"),
              saved: tEvent("saved"),
              yourAvailability: tEvent("yourAvailability"),
              intensity: tEvent("intensity"),
              summary: tEvent("summary"),
              updatedAt: tEvent("updatedAt"),
              unknownParticipant: tEvent("unknownParticipant"),
            }}
          />
        )}
      </div>
    </main>
  );
}
