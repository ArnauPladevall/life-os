"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import type { IngredientRecord, RecipeFilters, RecipeWithRelations } from "./types";

type RecipeLibraryProps = {
  recipes?: RecipeWithRelations[];
  ingredients?: IngredientRecord[];
  onOpen: (recipe: RecipeWithRelations) => void;
  onEdit: (recipe: RecipeWithRelations) => void;
  onDelete: (recipe: RecipeWithRelations) => void;
};

function filterRecipes(recipes: RecipeWithRelations[] | undefined, filters: RecipeFilters) {
  const safeRecipes = recipes ?? [];
  const normalizedSearch = filters.search.trim().toLowerCase();

  return safeRecipes.filter((recipe) => {
    const matchesSearch = !normalizedSearch || recipe.name.toLowerCase().includes(normalizedSearch);

    const matchesTotalTime =
      !filters.totalTimeMax || recipe.total_time <= Number(filters.totalTimeMax);

    const matchesEatOutside = !filters.eatOutsideOnly || recipe.eat_outside;

    const matchesIngredients =
      filters.ingredientIds.length === 0 ||
      filters.ingredientIds.every((ingredientId) =>
        recipe.ingredients.some((ingredient) => ingredient.ingredient_id === ingredientId),
      );

    return matchesSearch && matchesTotalTime && matchesEatOutside && matchesIngredients;
  });
}

export default function RecipeLibrary({
  recipes,
  ingredients,
  onOpen,
  onEdit,
  onDelete,
}: RecipeLibraryProps) {
  const safeIngredients = ingredients ?? [];

  const [filters, setFilters] = useState<RecipeFilters>({
    search: "",
    totalTimeMax: "",
    ingredientIds: [],
    eatOutsideOnly: false,
  });

  const filteredRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Recipe Library</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Browse and filter your recipes</h1>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_220px_1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search by name"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-11 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
            />
          </label>

          <input
            value={filters.totalTimeMax}
            onChange={(event) => setFilters((current) => ({ ...current, totalTimeMax: event.target.value }))}
            type="number"
            min="0"
            placeholder="Max total time"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
          />

          <select
            value=""
            onChange={(event) => {
              const nextId = event.target.value;
              if (!nextId) return;

              setFilters((current) => ({
                ...current,
                ingredientIds: current.ingredientIds.includes(nextId)
                  ? current.ingredientIds
                  : [...current.ingredientIds, nextId],
              }));
            }}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-400/30"
          >
            <option value="">Add ingredient filter</option>
            {safeIngredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={filters.eatOutsideOnly}
              onChange={(event) =>
                setFilters((current) => ({ ...current, eatOutsideOnly: event.target.checked }))
              }
              className="h-4 w-4 rounded border-white/10"
            />
            <span className="text-sm text-zinc-200">Outside only</span>
          </label>
        </div>

        {filters.ingredientIds.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.ingredientIds.map((ingredientId) => {
              const ingredient = safeIngredients.find((item) => item.id === ingredientId);
              if (!ingredient) return null;

              return (
                <button
                  key={ingredientId}
                  type="button"
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      ingredientIds: current.ingredientIds.filter((id) => id !== ingredientId),
                    }))
                  }
                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"
                >
                  {ingredient.name} ×
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
          >
            <button type="button" onClick={() => onOpen(recipe)} className="block w-full text-left">
              {recipe.photo ? (
                <div
                  className="h-44 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${recipe.photo})` }}
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-black/20 text-sm text-zinc-500">
                  No photo
                </div>
              )}
            </button>

            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onOpen(recipe)}
                  className="text-left text-lg font-semibold text-zinc-100 transition hover:text-amber-200"
                >
                  {recipe.name}
                </button>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Prep {recipe.prep_time} min
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Total {recipe.total_time} min
                  </span>
                  {recipe.eat_outside ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                      Outside
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.slice(0, 4).map((ingredient) => (
                  <span
                    key={`${recipe.id}-${ingredient.ingredient_id}`}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                  >
                    {ingredient.ingredient_name}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(recipe)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(recipe)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRecipes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-zinc-400 md:col-span-2 xl:col-span-3">
            No recipes match the current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}