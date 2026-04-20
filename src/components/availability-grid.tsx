"use client";

import { Fragment, useActionState, useMemo, useRef, useState } from "react";

import { saveAvailabilityAction } from "@/app/[locale]/actions";
import { initialActionState } from "@/lib/action-state";
import type { AppLocale } from "@/i18n/routing";
import { buildScheduleDays } from "@/lib/schedule";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type ParticipantSummary = {
  id: string;
  display_name: string;
  color_token: string;
  selectedCount: number;
};

type Props = {
  locale: AppLocale;
  slug: string;
  event: EventRecord;
  initialSelectedSlots: string[];
  slotCounts: Record<string, number>;
  participantSummaries: ParticipantSummary[];
  labels: {
    save: string;
    saving: string;
    saved: string;
    yourAvailability: string;
    intensity: string;
    summary: string;
    updatedAt: string;
    unknownParticipant: string;
  };
};

const colorClasses: Record<string, string> = {
  lime: "bg-lime-300 text-lime-950",
  cyan: "bg-cyan-300 text-cyan-950",
  amber: "bg-amber-300 text-amber-950",
  rose: "bg-rose-300 text-rose-950",
  violet: "bg-violet-300 text-violet-950",
  sky: "bg-sky-300 text-sky-950",
};

export function AvailabilityGrid({
  locale,
  slug,
  event,
  initialSelectedSlots,
  slotCounts,
  participantSummaries,
  labels,
}: Props) {
  const days = useMemo(() => buildScheduleDays(event, locale), [event, locale]);
  const [selectedSlots, setSelectedSlots] = useState(new Set(initialSelectedSlots));
  const [dragMode, setDragMode] = useState<boolean | null>(null);
  const [activeCell, setActiveCell] = useState("");
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [state, formAction, pending] = useActionState(
    saveAvailabilityAction.bind(null, locale, slug),
    initialActionState,
  );

  const flatSlots = days.flatMap((day) => day.slots);
  const maxCount = Math.max(0, ...Object.values(slotCounts));

  function updateSlot(slotId: string, nextValue?: boolean) {
    setSelectedSlots((previous) => {
      const next = new Set(previous);
      const shouldAdd = nextValue ?? !next.has(slotId);

      if (shouldAdd) {
        next.add(slotId);
      } else {
        next.delete(slotId);
      }

      return next;
    });
  }

  function startDrag(slotId: string) {
    const nextMode = !selectedSlots.has(slotId);
    setDragMode(nextMode);
    updateSlot(slotId, nextMode);
  }

  function intensityClass(slotId: string) {
    const count = slotCounts[slotId] ?? 0;

    if (count === 0 || maxCount === 0) {
      return "bg-white";
    }

    if (count === maxCount) {
      return "bg-lime-300/90";
    }

    if (count >= Math.max(1, Math.ceil(maxCount * 0.66))) {
      return "bg-lime-200/80";
    }

    return "bg-lime-100/80";
  }

  function moveFocus(currentId: string, direction: "up" | "down" | "left" | "right") {
    const index = flatSlots.findIndex((slot) => slot.slotId === currentId);

    if (index === -1) {
      return;
    }

    const rows = days[0]?.slots.length ?? 0;
    const columns = days.length;
    const row = index % rows;
    const column = Math.floor(index / rows);
    let nextIndex = index;

    if (direction === "up" && row > 0) nextIndex = index - 1;
    if (direction === "down" && row < rows - 1) nextIndex = index + 1;
    if (direction === "left" && column > 0) nextIndex = index - rows;
    if (direction === "right" && column < columns - 1) nextIndex = index + rows;

    const nextSlot = flatSlots[nextIndex];
    if (nextSlot) {
      setActiveCell(nextSlot.slotId);
      cellRefs.current[nextSlot.slotId]?.focus();
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700">
              <span className="h-2 w-2 rounded-full bg-zinc-950" />
              {labels.yourAvailability}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5 font-medium text-zinc-700">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              {labels.intensity}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700">
              {labels.summary}: {selectedSlots.size}
            </span>
          </div>

          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="slotIds" value={JSON.stringify(Array.from(selectedSlots))} />
            <div className="overflow-auto rounded-[1.5rem] border border-zinc-200 bg-zinc-50">
              <div
                className="grid min-w-[860px]"
                style={{ gridTemplateColumns: `88px repeat(${days.length}, minmax(110px, 1fr))` }}
                onPointerUp={() => setDragMode(null)}
                onPointerLeave={() => setDragMode(null)}
              >
                <div className="sticky left-0 top-0 z-20 border-b border-r border-zinc-200 bg-zinc-950/95 px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
                  {event.timezone}
                </div>
                {days.map((day) => (
                  <div key={day.isoDate} className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-4 text-center backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{day.shortLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">{day.label}</p>
                  </div>
                ))}

                {(days[0]?.slots ?? []).map((baseSlot, rowIndex) => (
                  <Fragment key={`row-${baseSlot.slotId}`}>
                    <div className="sticky left-0 z-10 border-r border-t border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-500">
                      {baseSlot.timeLabel}
                    </div>
                    {days.map((day) => {
                      const slot = day.slots[rowIndex];
                      const selected = selectedSlots.has(slot.slotId);
                      const count = slotCounts[slot.slotId] ?? 0;

                      return (
                        <button
                          key={slot.slotId}
                          ref={(element) => {
                            cellRefs.current[slot.slotId] = element;
                          }}
                          type="button"
                          aria-pressed={selected}
                          onPointerDown={() => startDrag(slot.slotId)}
                          onPointerEnter={() => {
                            if (dragMode !== null) {
                              updateSlot(slot.slotId, dragMode);
                            }
                          }}
                          onFocus={() => setActiveCell(slot.slotId)}
                          onKeyDown={(event) => {
                            if (event.key === " " || event.key === "Enter") {
                              event.preventDefault();
                              updateSlot(slot.slotId);
                            }

                            if (event.key === "ArrowUp") {
                              event.preventDefault();
                              moveFocus(slot.slotId, "up");
                            }

                            if (event.key === "ArrowDown") {
                              event.preventDefault();
                              moveFocus(slot.slotId, "down");
                            }

                            if (event.key === "ArrowLeft") {
                              event.preventDefault();
                              moveFocus(slot.slotId, "left");
                            }

                            if (event.key === "ArrowRight") {
                              event.preventDefault();
                              moveFocus(slot.slotId, "right");
                            }
                          }}
                          className={cn(
                            "group relative border-t border-l border-zinc-200 p-0 transition",
                            selected ? "bg-zinc-950 text-white" : intensityClass(slot.slotId),
                            activeCell === slot.slotId && "ring-2 ring-inset ring-zinc-950",
                          )}
                        >
                          <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 bg-white/10" />
                          <span className="relative flex h-11 items-center justify-center text-xs font-semibold">
                            {selected ? "✓" : count > 0 ? count : ""}
                          </span>
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={cn("text-sm", state.status === "error" ? "text-rose-500" : "text-zinc-500")}>
                {state.status === "success" && state.message
                  ? `${labels.saved} · ${labels.updatedAt} ${state.message}`
                  : state.message}
              </div>
              <button type="submit" disabled={pending} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70">
                {pending ? labels.saving : labels.save}
              </button>
            </div>
          </form>
        </div>

        <aside className="grid gap-4 rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{labels.summary}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{selectedSlots.size}</p>
          </div>
          <div className="grid gap-2">
            {participantSummaries.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <span className="flex items-center gap-3 font-medium text-zinc-700">
                  <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-bold", colorClasses[participant.color_token] ?? colorClasses.lime)}>
                    {participant.display_name || labels.unknownParticipant}
                  </span>
                </span>
                <span className="text-zinc-500">{participant.selectedCount}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
