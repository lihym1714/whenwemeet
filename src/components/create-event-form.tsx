"use client";

import { useActionState } from "react";

import { createEventAction, initialActionState } from "@/app/[locale]/actions";
import type { AppLocale } from "@/i18n/routing";

const TIMEZONES = ["Asia/Seoul", "Asia/Tokyo", "Europe/London", "America/New_York", "America/Los_Angeles"];

type Props = {
  locale: AppLocale;
  labels: {
    titleLabel: string;
    hostLabel: string;
    descriptionLabel: string;
    timezoneLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    startTimeLabel: string;
    endTimeLabel: string;
    slotLabel: string;
    submit: string;
  };
};

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function CreateEventForm({ locale, labels }: Props) {
  const [state, formAction, pending] = useActionState(createEventAction.bind(null, locale), initialActionState);

  return (
    <form action={formAction} className="grid gap-5 rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 text-white shadow-2xl shadow-lime-950/10 backdrop-blur">
      <div className="grid gap-2">
        <label className="text-sm text-zinc-300" htmlFor="title">
          {labels.titleLabel}
        </label>
        <input id="title" name="title" required className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" placeholder="Team offsite alignment" />
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="hostName">
            {labels.hostLabel}
          </label>
          <input id="hostName" name="hostName" required className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" placeholder="Minji" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="timezone">
            {labels.timezoneLabel}
          </label>
          <select id="timezone" name="timezone" defaultValue="Asia/Seoul" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60">
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone} className="bg-zinc-950">
                {timezone}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-zinc-300" htmlFor="description">
          {labels.descriptionLabel}
        </label>
        <textarea id="description" name="description" rows={3} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" placeholder="Decide which evening works for the whole group." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="startDate">
            {labels.startDateLabel}
          </label>
          <input id="startDate" name="startDate" type="date" required defaultValue={addDays(1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="endDate">
            {labels.endDateLabel}
          </label>
          <input id="endDate" name="endDate" type="date" required defaultValue={addDays(4)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="dayStart">
            {labels.startTimeLabel}
          </label>
          <input id="dayStart" name="dayStart" type="time" required defaultValue="09:00" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="dayEnd">
            {labels.endTimeLabel}
          </label>
          <input id="dayEnd" name="dayEnd" type="time" required defaultValue="22:00" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="slotMinutes">
            {labels.slotLabel}
          </label>
          <select id="slotMinutes" name="slotMinutes" defaultValue="30" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime-300/60">
            <option value="30" className="bg-zinc-950">30 min</option>
            <option value="60" className="bg-zinc-950">60 min</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-h-6 text-sm text-rose-300">{state.status === "error" ? state.message : null}</div>
        <button type="submit" disabled={pending} className="rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70">
          {pending ? "..." : labels.submit}
        </button>
      </div>
    </form>
  );
}
