"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import CreateRecipe from "./CreateRecipe";
import CookingMode from "./CookingMode";
import RecipeDetail from "./RecipeDetail";
import RecipeLibrary from "./RecipeLibrary";
import RecipesHome from "./RecipesHome";
import RecipeSelector from "./RecipeSelector";
import WeekPlanner from "./WeekPlanner";
import {
  createIngredient,
  deleteRecipe,
  fetchIngredients,
  fetchRecipes,
  fetchWeekPlan,
  getWeekStart,
  resetWeekPlan,
  saveRecipe,
  updateDayNote,
  upsertMealSlot,
} from "./recipesApi";
import type {
  IngredientRecord,
  RecipeWithRelations,
  SaveRecipePayload,
  WeekPlanState,
} from "./types";

type View =
  | { type: "home" }
  | { type: "create"; recipe?: RecipeWithRelations | null }
  | { type: "library" }
  | { type: "detail"; recipeId: string }
  | { type: "cooking"; recipeId: string }
  | { type: "planner" };

function buildEmptyWeekState(): WeekPlanState {
  return {
    0: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    1: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    2: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    3: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    4: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    5: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
    6: { lunch: { recipe_id: null, note: "" }, dinner: { recipe_id: null, note: "" }, dayNote: "" },
  };
}

export default function RecipesApp() {
  const [view, setView] = useState<View>({ type: "home" });
  const [recipes, setRecipes] = useState<RecipeWithRelations[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
  const [weekPlan, setWeekPlan] = useState<WeekPlanState>(buildEmptyWeekState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<{
    dayIndex: number;
    slotType: "lunch" | "dinner";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = useMemo(() => getWeekStart(new Date()), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [recipeData, ingredientData, weekData] = await Promise.all([
        fetchRecipes(),
        fetchIngredients(),
        fetchWeekPlan(weekStart),
      ]);

      const nextWeek = buildEmptyWeekState();

      weekData.slots.forEach((slot) => {
        nextWeek[slot.day_index] = {
          ...nextWeek[slot.day_index],
          [slot.slot_type]: {
            recipe_id: slot.recipe_id,
            note: slot.note ?? "",
          },
        };
      });

      weekData.dayNotes.forEach((item) => {
        nextWeek[item.day_index] = {
          ...nextWeek[item.day_index],
          dayNote: item.note ?? "",
        };
      });

      setRecipes(recipeData);
      setIngredients(ingredientData);
      setWeekPlan(nextWeek);
    } catch (loadError: any) {
      setError(loadError?.message ?? "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedRecipe =
    view.type === "detail" || view.type === "cooking"
      ? recipes.find((recipe) => recipe.id === view.recipeId) ?? null
      : null;

  async function handleSaveRecipe(payload: SaveRecipePayload) {
    setSaving(true);
    setError(null);

    try {
      const saved = await saveRecipe(payload);
      await loadData();
      setView({ type: "detail", recipeId: saved.id });
    } catch (saveError: any) {
      setError(saveError?.message ?? "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecipe(recipe: RecipeWithRelations) {
    const confirmed = window.confirm(`Delete "${recipe.name}"?`);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteRecipe(recipe.id);
      await loadData();
      setView({ type: "library" });
    } catch (deleteError: any) {
      setError(deleteError?.message ?? "Failed to delete recipe");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateIngredient(name: string) {
    const created = await createIngredient(name);
    const fresh = await fetchIngredients();
    setIngredients(fresh);
    return created;
  }

  async function handleAssignRecipe(recipe: RecipeWithRelations) {
    if (!selectorTarget) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await upsertMealSlot({
        week_start: weekStart,
        day_index: selectorTarget.dayIndex,
        slot_type: selectorTarget.slotType,
        recipe_id: recipe.id,
        note: weekPlan[selectorTarget.dayIndex][selectorTarget.slotType].note,
      });

      await loadData();
      setSelectorTarget(null);
    } catch (assignError: any) {
      setError(assignError?.message ?? "Failed to assign recipe");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearSlot(dayIndex: number, slotType: "lunch" | "dinner") {
    setSaving(true);
    setError(null);

    try {
      await upsertMealSlot({
        week_start: weekStart,
        day_index: dayIndex,
        slot_type: slotType,
        recipe_id: null,
        note: "",
      });

      await loadData();
    } catch (slotError: any) {
      setError(slotError?.message ?? "Failed to clear slot");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDayNote(dayIndex: number, note: string) {
    setError(null);

    try {
      await updateDayNote({
        week_start: weekStart,
        day_index: dayIndex,
        note,
      });

      setWeekPlan((current) => ({
        ...current,
        [dayIndex]: {
          ...current[dayIndex],
          dayNote: note,
        },
      }));
    } catch (noteError: any) {
      setError(noteError?.message ?? "Failed to update day note");
    }
  }

  async function handleResetWeek() {
    const confirmed = window.confirm("Reset the whole week plan?");

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await resetWeekPlan(weekStart);
      await loadData();
    } catch (resetError: any) {
      setError(resetError?.message ?? "Failed to reset week");
    } finally {
      setSaving(false);
    }
  }

  function renderBody() {
    if (loading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading recipes...
          </div>
        </div>
      );
    }

    switch (view.type) {
      case "home":
        return (
          <RecipesHome
            onCreate={() => setView({ type: "create", recipe: null })}
            onLibrary={() => setView({ type: "library" })}
            onPlanner={() => setView({ type: "planner" })}
          />
        );

      case "create":
        return (
          <CreateRecipe
            ingredients={ingredients}
            initialRecipe={view.recipe ?? null}
            onCancel={() =>
              view.recipe ? setView({ type: "detail", recipeId: view.recipe.id }) : setView({ type: "home" })
            }
            onSave={handleSaveRecipe}
            onCreateIngredient={handleCreateIngredient}
          />
        );

      case "library":
        return (
          <RecipeLibrary
            recipes={recipes}
            ingredients={ingredients}
            onOpen={(recipe) => setView({ type: "detail", recipeId: recipe.id })}
            onEdit={(recipe) => setView({ type: "create", recipe })}
            onDelete={handleDeleteRecipe}
          />
        );

      case "detail":
        if (!selectedRecipe) {
          return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-zinc-400">
              Recipe not found.
            </div>
          );
        }

        return (
          <RecipeDetail
            recipe={selectedRecipe}
            onEdit={() => setView({ type: "create", recipe: selectedRecipe })}
            onDelete={() => handleDeleteRecipe(selectedRecipe)}
            onStartCooking={() => setView({ type: "cooking", recipeId: selectedRecipe.id })}
          />
        );

      case "cooking":
        if (!selectedRecipe) {
          return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-zinc-400">
              Recipe not found.
            </div>
          );
        }

        return (
          <CookingMode
            recipe={selectedRecipe}
            onFinish={() => setView({ type: "detail", recipeId: selectedRecipe.id })}
          />
        );

      case "planner":
        return (
          <WeekPlanner
            weekStart={weekStart}
            weekPlan={weekPlan}
            recipes={recipes}
            onOpenSelector={(target) => setSelectorTarget(target)}
            onUpdateDayNote={handleUpdateDayNote}
            onClearSlot={handleClearSlot}
            onResetWeek={handleResetWeek}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto rounded-[32px] border border-white/10 bg-zinc-950 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-6 px-6 py-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {view.type !== "home" ? (
              <button
                type="button"
                onClick={() => {
                  if (view.type === "detail" || view.type === "library" || view.type === "planner") {
                    setView({ type: "home" });
                    return;
                  }

                  if (view.type === "cooking" && selectedRecipe) {
                    setView({ type: "detail", recipeId: selectedRecipe.id });
                    return;
                  }

                  if (view.type === "create" && view.recipe) {
                    setView({ type: "detail", recipeId: view.recipe.id });
                    return;
                  }

                  setView({ type: "home" });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setView({ type: "home" })}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setView({ type: "library" })}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
            >
              Library
            </button>

            <button
              type="button"
              onClick={() => setView({ type: "planner" })}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
            >
              Week Planner
            </button>

            <button
              type="button"
              onClick={() => setView({ type: "create", recipe: null })}
              className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
            >
              Create Recipe
            </button>
          </div>

          {saving ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {renderBody()}
      </div>

      {selectorTarget ? (
        <RecipeSelector
          recipes={recipes}
          ingredients={ingredients}
          onSelect={handleAssignRecipe}
          onCreate={() => {
            setSelectorTarget(null);
            setView({ type: "create", recipe: null });
          }}
          onClose={() => setSelectorTarget(null)}
        />
      ) : null}
    </div>
  );
}