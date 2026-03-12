"use client";

import { Pencil, Play, Trash2 } from "lucide-react";
import type { RecipeWithRelations } from "./types";

type RecipeDetailProps = {
  recipe: RecipeWithRelations;
  onEdit: () => void;
  onDelete: () => void;
  onStartCooking: () => void;
};

export default function RecipeDetail({
  recipe,
  onEdit,
  onDelete,
  onStartCooking,
}: RecipeDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {recipe.photo ? (
            <div
              className="min-h-[320px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${recipe.photo})` }}
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center bg-black/20 text-sm text-zinc-500">
              No photo
            </div>
          )}
        </section>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Recipe Detail</p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">{recipe.name}</h1>

            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Prep {recipe.prep_time} min
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Total {recipe.total_time} min
              </span>
              {recipe.eat_outside ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                  Good outside
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              type="button"
              onClick={onStartCooking}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
            >
              <Play className="h-4 w-4" />
              Start cooking mode
            </button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Ingredients</h2>

          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient.ingredient_id}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <span className="text-sm text-zinc-100">{ingredient.ingredient_name}</span>
                <span className="text-sm text-zinc-400">
                  {[ingredient.quantity, ingredient.unit].filter(Boolean).join(" ")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Steps</h2>

          <div className="space-y-3">
            {recipe.steps.map((step, index) => (
              <div key={step.id ?? index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Step {index + 1}</span>
                  {step.approx_time ? (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                      ~ {step.approx_time} min
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-zinc-200">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}