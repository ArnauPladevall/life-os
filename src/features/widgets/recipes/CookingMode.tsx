"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, TimerReset } from "lucide-react";
import type { RecipeWithRelations } from "./types";

type CookingModeProps = {
  recipe: RecipeWithRelations;
  onFinish: () => void;
};

export default function CookingMode({ recipe, onFinish }: CookingModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const step = recipe.steps[currentIndex];
  const isLast = currentIndex === recipe.steps.length - 1;

  useEffect(() => {
    if (remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      setRemainingSeconds(null);
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null) return null;
        if (current <= 1) return null;
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    setRemainingSeconds(null);
  }, [currentIndex]);

  const timerLabel = useMemo(() => {
    if (remainingSeconds === null) return null;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [remainingSeconds]);

  if (!step) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">This recipe has no steps</h1>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
        >
          Back to detail
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-between gap-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Cooking Mode</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">{recipe.name}</h1>
        <div className="text-sm text-zinc-400">
          Step {currentIndex + 1} of {recipe.steps.length}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Current step</div>
          <p className="text-2xl font-medium leading-10 text-zinc-100 md:text-4xl md:leading-[1.4]">
            {step.text}
          </p>

          {step.approx_time ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-zinc-400">Approx time: {step.approx_time} min</div>

              {timerLabel ? (
                <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-5 py-2 text-lg font-semibold text-amber-200">
                  {timerLabel}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setRemainingSeconds(step.approx_time ? step.approx_time * 60 : null)}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
              >
                <TimerReset className="h-4 w-4" />
                Start Timer
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onFinish}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20"
          >
            Finish
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((current) => Math.min(recipe.steps.length - 1, current + 1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}