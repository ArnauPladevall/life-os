"use client";

import { createClient } from "@/lib/supabase";
import type {
  IngredientRecord,
  MealPlanDayNote,
  MealPlanSlot,
  RecipeIngredientInput,
  RecipeRecord,
  RecipeStepInput,
  RecipeWithRelations,
  SaveRecipePayload,
} from "./types";

const supabase = createClient();

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function fetchIngredients(): Promise<IngredientRecord[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as IngredientRecord[];
}

export async function createIngredient(name: string): Promise<IngredientRecord> {
  const userId = await getUserId();
  const normalized = name.trim();

  if (!normalized) {
    throw new Error("Ingredient name is required");
  }

  const { data: existing, error: existingError } = await supabase
    .from("ingredients")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", normalized)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing as IngredientRecord;
  }

  const { data, error } = await supabase
    .from("ingredients")
    .insert({
      user_id: userId,
      name: normalized,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as IngredientRecord;
}

export async function fetchRecipes(): Promise<RecipeWithRelations[]> {
  const userId = await getUserId();

  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (recipesError) {
    throw recipesError;
  }

  const recipeList = (recipes ?? []) as RecipeRecord[];

  if (recipeList.length === 0) {
    return [];
  }

  const recipeIds = recipeList.map((recipe) => recipe.id);

  const { data: ingredientLinks, error: ingredientLinksError } = await supabase
    .from("recipe_ingredients")
    .select(`
      id,
      recipe_id,
      ingredient_id,
      quantity,
      unit,
      ingredients (
        id,
        user_id,
        name,
        created_at
      )
    `)
    .in("recipe_id", recipeIds);

  if (ingredientLinksError) {
    throw ingredientLinksError;
  }

  const { data: steps, error: stepsError } = await supabase
    .from("recipe_steps")
    .select("*")
    .in("recipe_id", recipeIds)
    .order("step_order", { ascending: true });

  if (stepsError) {
    throw stepsError;
  }

  return recipeList.map((recipe) => {
    const recipeIngredients = (ingredientLinks ?? [])
      .filter((item: any) => item.recipe_id === recipe.id)
      .map(
        (item: any): RecipeIngredientInput => ({
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredients?.name ?? "",
          quantity: item.quantity ?? "",
          unit: item.unit ?? "",
        }),
      );

    const recipeSteps = (steps ?? [])
      .filter((step: any) => step.recipe_id === recipe.id)
      .map(
        (step: any): RecipeStepInput => ({
          id: step.id,
          text: step.text,
          approx_time: step.approx_time,
          step_order: step.step_order,
        }),
      );

    return {
      ...recipe,
      ingredients: recipeIngredients,
      steps: recipeSteps,
    };
  });
}

export async function saveRecipe(payload: SaveRecipePayload): Promise<RecipeWithRelations> {
  const userId = await getUserId();

  const baseRecipe = {
    user_id: userId,
    name: payload.name.trim(),
    photo: payload.photo?.trim() || null,
    prep_time: payload.prep_time,
    total_time: payload.total_time,
    eat_outside: payload.eat_outside,
  };

  let recipeId = payload.id;

  if (recipeId) {
    const { error: updateError } = await supabase
      .from("recipes")
      .update(baseRecipe)
      .eq("id", recipeId)
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    const { error: deleteIngredientsError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);

    if (deleteIngredientsError) {
      throw deleteIngredientsError;
    }

    const { error: deleteStepsError } = await supabase
      .from("recipe_steps")
      .delete()
      .eq("recipe_id", recipeId);

    if (deleteStepsError) {
      throw deleteStepsError;
    }
  } else {
    const { data, error } = await supabase
      .from("recipes")
      .insert(baseRecipe)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    recipeId = data.id;
  }

  const normalizedIngredients = payload.ingredients.filter(
    (item) => item.ingredient_id && (item.quantity.trim() || item.unit.trim() || item.ingredient_name.trim()),
  );

  if (normalizedIngredients.length > 0) {
    const { error: ingredientsError } = await supabase.from("recipe_ingredients").insert(
      normalizedIngredients.map((item) => ({
        recipe_id: recipeId,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity.trim(),
        unit: item.unit.trim(),
      })),
    );

    if (ingredientsError) {
      throw ingredientsError;
    }
  }

  const normalizedSteps = payload.steps
    .filter((step) => step.text.trim())
    .map((step, index) => ({
      recipe_id: recipeId,
      text: step.text.trim(),
      approx_time: step.approx_time,
      step_order: index + 1,
    }));

  if (normalizedSteps.length > 0) {
    const { error: stepsError } = await supabase.from("recipe_steps").insert(normalizedSteps);

    if (stepsError) {
      throw stepsError;
    }
  }

  const recipes = await fetchRecipes();
  const created = recipes.find((recipe) => recipe.id === recipeId);

  if (!created) {
    throw new Error("Failed to load saved recipe");
  }

  return created;
}

export async function deleteRecipe(recipeId: string) {
  const userId = await getUserId();

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function fetchWeekPlan(weekStart: string): Promise<{
  slots: MealPlanSlot[];
  dayNotes: MealPlanDayNote[];
}> {
  const userId = await getUserId();

  const { data: slots, error: slotsError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  if (slotsError) {
    throw slotsError;
  }

  const { data: dayNotes, error: dayNotesError } = await supabase
    .from("meal_plan_day_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  if (dayNotesError) {
    throw dayNotesError;
  }

  return {
    slots: (slots ?? []) as MealPlanSlot[],
    dayNotes: (dayNotes ?? []) as MealPlanDayNote[],
  };
}

export async function upsertMealSlot(input: {
  week_start: string;
  day_index: number;
  slot_type: "lunch" | "dinner";
  recipe_id: string | null;
  note?: string | null;
}) {
  const userId = await getUserId();

  const { error } = await supabase.from("meal_plans").upsert(
    {
      user_id: userId,
      week_start: input.week_start,
      day_index: input.day_index,
      slot_type: input.slot_type,
      recipe_id: input.recipe_id,
      note: input.note ?? null,
    },
    {
      onConflict: "user_id,week_start,day_index,slot_type",
    },
  );

  if (error) {
    throw error;
  }
}

export async function updateDayNote(input: {
  week_start: string;
  day_index: number;
  note: string;
}) {
  const userId = await getUserId();

  const { error } = await supabase.from("meal_plan_day_notes").upsert(
    {
      user_id: userId,
      week_start: input.week_start,
      day_index: input.day_index,
      note: input.note,
    },
    {
      onConflict: "user_id,week_start,day_index",
    },
  );

  if (error) {
    throw error;
  }
}

export async function resetWeekPlan(weekStart: string) {
  const userId = await getUserId();

  const { error: slotsError } = await supabase
    .from("meal_plans")
    .delete()
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  if (slotsError) {
    throw slotsError;
  }

  const { error: notesError } = await supabase
    .from("meal_plan_day_notes")
    .delete()
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  if (notesError) {
    throw notesError;
  }
}