import Link from "next/link";
import { ArrowUpRight, Clock3, Globe2, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CreateEventForm } from "@/components/create-event-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { AppLocale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tLocale = await getTranslations({ locale, namespace: "Locale" });
  const stats = [tHome("stats.0"), tHome("stats.1"), tHome("stats.2")];
  const previewPoints = [tHome("previewPoints.0"), tHome("previewPoints.1"), tHome("previewPoints.2")];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f6f1] text-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(255,255,255,0.15))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link href={`/${locale}`} className="inline-flex items-center gap-3 text-sm font-medium text-zinc-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-900/10 bg-white text-lime-500 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            WhenWeMeet
          </Link>
          <LanguageSwitcher currentLocale={locale} label={tLocale("switch")} tone="light" />
        </header>

        <section className="grid flex-1 gap-12 pb-12 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="grid gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-900/10 bg-white/90 px-4 py-2 text-sm text-zinc-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              {tHome("badge")}
            </div>

            <div className="grid gap-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 md:text-7xl">
                {tHome("title")}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600 md:text-xl">{tHome("subtitle")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item, index) => (
                <div key={item} className="rounded-[1.5rem] border border-zinc-900/10 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">0{index + 1}</p>
                  <p className="mt-3 text-sm font-medium text-zinc-900">{item}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 rounded-[2rem] border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur lg:max-w-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{tHome("previewTitle")}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-lime-300" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {previewPoints.map((point, index) => (
                  <div key={point} className="rounded-[1.5rem] bg-zinc-50 p-5">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lime-500 shadow-sm">
                      {index === 0 ? <Clock3 className="h-5 w-5" /> : index === 1 ? <Sparkles className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
                    </div>
                    <p className="text-sm leading-7 text-zinc-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:pl-10">
            <div className="absolute -left-10 top-10 hidden h-40 w-40 rounded-full bg-lime-300/10 blur-3xl lg:block" />
            <div className="absolute -right-12 bottom-0 hidden h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl lg:block" />
            <div className="relative grid gap-5">
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{tHome("createTitle")}</p>
                <p className="max-w-xl text-sm leading-7 text-zinc-600">{tHome("createDescription")}</p>
              </div>
              <CreateEventForm
                locale={locale}
                labels={{
                  titleLabel: tHome("titleLabel"),
                  hostLabel: tHome("hostLabel"),
                  descriptionLabel: tHome("descriptionLabel"),
                  timezoneLabel: tHome("timezoneLabel"),
                  startDateLabel: tHome("startDateLabel"),
                  endDateLabel: tHome("endDateLabel"),
                  startTimeLabel: tHome("startTimeLabel"),
                  endTimeLabel: tHome("endTimeLabel"),
                  slotLabel: tHome("slotLabel"),
                  submit: tHome("submit"),
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
