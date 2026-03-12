"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { RecipeWithRelations, WeekPlanState } from "./types";

type SlotTarget = {
  dayIndex: number;
  slotType: "lunch" | "dinner";
};

type WeekPlannerProps = {
  weekStart: string;
  weekPlan: WeekPlanState;
  recipes: RecipeWithRelations[];
  onOpenSelector: (target: SlotTarget) => void;
  onUpdateDayNote: (dayIndex: number, note: string) => void;
  onClearSlot: (dayIndex: number, slotType: "lunch" | "dinner") => void;
  onResetWeek: () => void;
};

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatDate(weekStart: string, dayIndex: number) {
  const base = new Date(`${weekStart}T00:00:00`);
  base.setDate(base.getDate() + dayIndex);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(base);
}

export default function WeekPlanner({
  weekStart,
  weekPlan,
  recipes,
  onOpenSelector,
  onUpdateDayNote,
  onClearSlot,
  onResetWeek,
}: WeekPlannerProps) {
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});

  const recipeMap = useMemo(
    () => new Map(recipes.map((recipe) => [recipe.id, recipe])),
    [recipes],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Week Planner</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Lunch and dinner for 7 days</h1>
          <p className="text-sm text-zinc-400">Week starting on {weekStart}</p>
        </div>

        <button
          type="button"
          onClick={onResetWeek}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Week
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {dayLabels.map((label, dayIndex) => {
          const dayState = weekPlan[dayIndex];
          const lunchRecipe = dayState?.lunch.recipe_id ? recipeMap.get(dayState.lunch.recipe_id) : null;
          const dinnerRecipe = dayState?.dinner.recipe_id ? recipeMap.get(dayState.dinner.recipe_id) : null;
          const noteValue = draftNotes[dayIndex] ?? dayState?.dayNote ?? "";

          return (
            <section
              key={label}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{label}</h2>
                  <p className="text-sm text-zinc-500">{formatDate(weekStart, dayIndex)}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(["lunch", "dinner"] as const).map((slotType) => {
                  const selectedRecipe = slotType === "lunch" ? lunchRecipe : dinnerRecipe;

                  return (
                    <div
                      key={slotType}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">{slotType}</div>

                      {selectedRecipe ? (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => onOpenSelector({ dayIndex, slotType })}
                            className="block text-left"
                          >
                            <div className="text-base font-medium text-zinc-100">{selectedRecipe.name}</div>
                            <div className="mt-2 text-xs text-zinc-400">
                              Total {selectedRecipe.total_time} min
                            </div>
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenSelector({ dayIndex, slotType })}
                              className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => onClearSlot(dayIndex, slotType)}
                              className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04]"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenSelector({ dayIndex, slotType })}
                          className="w-full rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400 transition hover:border-amber-400/30 hover:bg-amber-400/[0.05] hover:text-zinc-200"
                        >
                          + Assign recipe
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm text-zinc-300">Day note</label>
                <textarea
                  value={noteValue}
                  onChange={(event) =>
                    setDraftNotes((current) => ({
                      ...current,
                      [dayIndex]: event.target.value,
                    }))
                  }
                  onBlur={() => onUpdateDayNote(dayIndex, noteValue)}
                  rows={3}
                  placeholder="Optional note for the day"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}