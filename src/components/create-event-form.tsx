"use client";

import { useActionState } from "react";

import { createEventAction } from "@/app/[locale]/actions";
import type { AppLocale } from "@/i18n/routing";
import { initialActionState } from "@/lib/action-state";

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
    <form action={formAction} className="grid gap-5 rounded-[2rem] border border-zinc-900/10 bg-white/92 p-6 text-zinc-950 shadow-2xl shadow-lime-950/5 backdrop-blur">
      <div className="grid gap-2">
        <label className="text-sm text-zinc-600" htmlFor="title">
          {labels.titleLabel}
        </label>
        <input id="title" name="title" required className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" placeholder="Team offsite alignment" />
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="hostName">
            {labels.hostLabel}
          </label>
          <input id="hostName" name="hostName" required className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" placeholder="Minji" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="timezone">
            {labels.timezoneLabel}
          </label>
          <select id="timezone" name="timezone" defaultValue="Asia/Seoul" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white">
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone} className="bg-white text-zinc-950">
                {timezone}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-zinc-600" htmlFor="description">
          {labels.descriptionLabel}
        </label>
        <textarea id="description" name="description" rows={3} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" placeholder="Decide which evening works for the whole group." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="startDate">
            {labels.startDateLabel}
          </label>
          <input id="startDate" name="startDate" type="date" required defaultValue={addDays(1)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="endDate">
            {labels.endDateLabel}
          </label>
          <input id="endDate" name="endDate" type="date" required defaultValue={addDays(4)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="dayStart">
            {labels.startTimeLabel}
          </label>
          <input id="dayStart" name="dayStart" type="time" required defaultValue="09:00" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="dayEnd">
            {labels.endTimeLabel}
          </label>
          <input id="dayEnd" name="dayEnd" type="time" required defaultValue="22:00" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-600" htmlFor="slotMinutes">
            {labels.slotLabel}
          </label>
          <select id="slotMinutes" name="slotMinutes" defaultValue="30" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-lime-400/80 focus:bg-white">
            <option value="30" className="bg-white text-zinc-950">30 min</option>
            <option value="60" className="bg-white text-zinc-950">60 min</option>
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
