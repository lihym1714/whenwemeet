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
    activeSelection: string;
    intensity: string;
    participants: string;
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
  const [viewMode, setViewMode] = useState<"selection" | "overlap">("selection");
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
      return "bg-lime-300/90 text-zinc-900";
    }

    if (count >= Math.max(1, Math.ceil(maxCount * 0.66))) {
      return "bg-lime-200/80 text-zinc-900";
    }

    return "bg-lime-100/80 text-zinc-900";
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[1.75rem] border border-zinc-900/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 grid gap-3">
            <div className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("selection")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  viewMode === "selection" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {labels.yourAvailability}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("overlap")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  viewMode === "overlap" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {labels.intensity}
              </button>
            </div>

            {viewMode === "selection" ? (
              <div className="rounded-[1.25rem] border border-lime-200 bg-lime-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{labels.yourAvailability}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-lime-300 px-3 py-1.5 text-sm font-semibold text-zinc-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-lime-600" />
                  {labels.activeSelection}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{labels.intensity}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <span className="h-8 w-8 rounded-xl border border-zinc-200 bg-white" />
                  <span className="h-8 w-8 rounded-xl bg-lime-100" />
                  <span className="h-8 w-8 rounded-xl bg-lime-200" />
                  <span className="h-8 w-8 rounded-xl bg-lime-300" />
                </div>
              </div>
            )}
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
                <div className="sticky left-0 top-0 z-20 border-b border-r border-zinc-200 bg-zinc-100/95 px-4 py-4" />
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
                          onPointerDown={() => {
                            if (viewMode === "selection") {
                              startDrag(slot.slotId);
                            }
                          }}
                          onPointerEnter={() => {
                            if (viewMode === "selection" && dragMode !== null) {
                              updateSlot(slot.slotId, dragMode);
                            }
                          }}
                          onFocus={() => setActiveCell(slot.slotId)}
                          onKeyDown={(event) => {
                            if (viewMode === "selection" && (event.key === " " || event.key === "Enter")) {
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
                            viewMode === "selection"
                              ? selected
                                ? "bg-lime-400 text-zinc-900"
                                : "bg-white"
                              : intensityClass(slot.slotId),
                            activeCell === slot.slotId && "ring-2 ring-inset ring-lime-500",
                            viewMode === "overlap" && "cursor-default",
                          )}
                        >
                          <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 bg-white/10" />
                          <span className="relative flex h-11 items-center justify-center text-xs font-semibold">
                            {viewMode === "selection" ? (selected ? "✓" : "") : count > 0 ? count : ""}
                          </span>
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            {viewMode === "selection" ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={cn("text-sm", state.status === "error" ? "text-rose-500" : "text-zinc-500")}>
                  {state.status === "success" && state.message
                    ? `${labels.saved} · ${labels.updatedAt} ${state.message}`
                    : state.message}
                </div>
                <button type="submit" disabled={pending} className="rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-lime-400 disabled:opacity-70">
                  {pending ? labels.saving : labels.save}
                </button>
              </div>
            ) : null}
          </form>
        </div>

        <aside className="grid h-fit content-start gap-4 self-start rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{labels.participants}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {participantSummaries.map((participant) => (
              <span
                key={participant.id}
                className={cn(
                  "inline-flex h-10 max-w-full items-center overflow-hidden rounded-full px-3 text-sm font-semibold whitespace-nowrap text-ellipsis",
                  colorClasses[participant.color_token] ?? colorClasses.lime,
                )}
                title={participant.display_name || labels.unknownParticipant}
              >
                {participant.display_name || labels.unknownParticipant}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
