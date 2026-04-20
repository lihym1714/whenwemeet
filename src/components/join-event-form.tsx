"use client";

import { useActionState } from "react";

import { initialActionState, joinEventAction } from "@/app/[locale]/actions";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  locale: AppLocale;
  slug: string;
  labels: {
    title: string;
    description: string;
    nameLabel: string;
    submit: string;
  };
};

export function JoinEventForm({ locale, slug, labels }: Props) {
  const [state, formAction, pending] = useActionState(
    joinEventAction.bind(null, locale, slug),
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-zinc-950">{labels.title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{labels.description}</p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="displayName" className="text-sm font-medium text-zinc-700">
          {labels.nameLabel}
        </label>
        <input id="displayName" name="displayName" required className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400" placeholder="Jamie" />
      </div>
      <div className="min-h-5 text-sm text-rose-500">{state.status === "error" ? state.message : null}</div>
      <button type="submit" disabled={pending} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70">
        {labels.submit}
      </button>
    </form>
  );
}
