"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  IngredientRecord,
  RecipeIngredientInput,
  RecipeWithRelations,
  SaveRecipePayload,
} from "./types";

type CreateRecipeProps = {
  ingredients: IngredientRecord[];
  initialRecipe?: RecipeWithRelations | null;
  onCancel: () => void;
  onSave: (payload: SaveRecipePayload) => Promise<void>;
  onCreateIngredient: (name: string) => Promise<IngredientRecord>;
};

function emptyIngredient(): RecipeIngredientInput {
  return {
    ingredient_id: "",
    ingredient_name: "",
    quantity: "",
    unit: "",
  };
}

function emptyStep(order: number) {
  return {
    text: "",
    approx_time: null as number | null,
    step_order: order,
  };
}

export default function CreateRecipe({
  ingredients,
  initialRecipe,
  onCancel,
  onSave,
  onCreateIngredient,
}: CreateRecipeProps) {
  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [photo, setPhoto] = useState(initialRecipe?.photo ?? "");
  const [prepTime, setPrepTime] = useState(String(initialRecipe?.prep_time ?? 0));
  const [totalTime, setTotalTime] = useState(String(initialRecipe?.total_time ?? 0));
  const [eatOutside, setEatOutside] = useState(initialRecipe?.eat_outside ?? false);
  const [ingredientRows, setIngredientRows] = useState<RecipeIngredientInput[]>(
    initialRecipe?.ingredients.length ? initialRecipe.ingredients : [emptyIngredient()],
  );
  const [steps, setSteps] = useState(
    initialRecipe?.steps.length ? initialRecipe.steps : [emptyStep(1)],
  );
  const [saving, setSaving] = useState(false);

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await onSave({
        id: initialRecipe?.id,
        name,
        photo: photo || null,
        prep_time: Number(prepTime || 0),
        total_time: Number(totalTime || 0),
        eat_outside: eatOutside,
        ingredients: ingredientRows,
        steps: steps.map((step, index) => ({
          ...step,
          step_order: index + 1,
        })),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateIngredient(index: number) {
    const value = ingredientRows[index]?.ingredient_name?.trim();

    if (!value) {
      return;
    }

    const created = await onCreateIngredient(value);

    setIngredientRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              ingredient_id: created.id,
              ingredient_name: created.name,
            }
          : row,
      ),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
            {initialRecipe ? "Edit Recipe" : "Create Recipe"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            {initialRecipe ? initialRecipe.name : "New recipe"}
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-50"
          >
            {saving ? "Saving..." : initialRecipe ? "Save changes" : "Create recipe"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Basics</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-zinc-300">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Chicken curry"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-zinc-300">Photo URL (optional)</span>
              <input
                value={photo}
                onChange={(event) => setPhoto(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-zinc-300">Prep time (min)</span>
              <input
                value={prepTime}
                onChange={(event) => setPrepTime(event.target.value)}
                type="number"
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-400/30"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-zinc-300">Total time (min)</span>
              <input
                value={totalTime}
                onChange={(event) => setTotalTime(event.target.value)}
                type="number"
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-400/30"
                required
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                checked={eatOutside}
                onChange={(event) => setEatOutside(event.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-transparent"
              />
              <span className="text-sm text-zinc-200">Good to eat outside / carry in tupper</span>
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Ingredients</h2>

          <div className="space-y-3">
            {ingredientRows.map((row, index) => {
              const matches = ingredients.filter((ingredient) =>
                ingredient.name.toLowerCase().includes(row.ingredient_name.toLowerCase()),
              );
              const exactSelected = row.ingredient_id && ingredientMap.has(row.ingredient_id);
              const exactNameExists = ingredients.some(
                (ingredient) => ingredient.name.toLowerCase() === row.ingredient_name.trim().toLowerCase(),
              );

              return (
                <div key={`${row.ingredient_id}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
                    <div className="space-y-2">
                      <input
                        value={row.ingredient_name}
                        onChange={(event) => {
                          const value = event.target.value;
                          setIngredientRows((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    ingredient_name: value,
                                    ingredient_id:
                                      exactSelected &&
                                      ingredientMap.get(item.ingredient_id)?.name.toLowerCase() === value.toLowerCase()
                                        ? item.ingredient_id
                                        : "",
                                  }
                                : item,
                            ),
                          );
                        }}
                        placeholder="Search or create ingredient"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                      />

                      {matches.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {matches.slice(0, 8).map((match) => (
                            <button
                              key={match.id}
                              type="button"
                              onClick={() =>
                                setIngredientRows((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          ingredient_id: match.id,
                                          ingredient_name: match.name,
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 transition hover:border-amber-400/30 hover:bg-amber-400/10"
                            >
                              {match.name}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {!exactNameExists && row.ingredient_name.trim() ? (
                        <button
                          type="button"
                          onClick={() => handleCreateIngredient(index)}
                          className="text-xs font-medium text-amber-300 transition hover:text-amber-200"
                        >
                          + Create ingredient "{row.ingredient_name.trim()}"
                        </button>
                      ) : null}
                    </div>

                    <input
                      value={row.quantity}
                      onChange={(event) =>
                        setIngredientRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, quantity: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Quantity"
                      className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                    />

                    <input
                      value={row.unit}
                      onChange={(event) =>
                        setIngredientRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, unit: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Unit"
                      className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setIngredientRows((current) => (current.length === 1 ? [emptyIngredient()] : current.filter((_, itemIndex) => itemIndex !== index)))
                      }
                      className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIngredientRows((current) => [...current, emptyIngredient()])}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
          >
            <Plus className="h-4 w-4" />
            Add ingredient
          </button>
        </section>
      </div>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Steps</h2>

          <button
            type="button"
            onClick={() => setSteps((current) => [...current, emptyStep(current.length + 1)])}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
          >
            <Plus className="h-4 w-4" />
            Add step
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Step {index + 1}</div>

              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <textarea
                  value={step.text}
                  onChange={(event) =>
                    setSteps((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, text: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Describe this step"
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                />

                <input
                  value={step.approx_time ?? ""}
                  onChange={(event) =>
                    setSteps((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              approx_time: event.target.value ? Number(event.target.value) : null,
                            }
                          : item,
                      ),
                    )
                  }
                  type="number"
                  min="0"
                  placeholder="Approx min"
                  className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/30"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSteps((current) => (current.length === 1 ? [emptyStep(1)] : current.filter((_, itemIndex) => itemIndex !== index)))
                  }
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}