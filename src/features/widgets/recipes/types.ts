export type RecipeIngredientInput = {
  ingredient_id: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
};

export type RecipeStepInput = {
  id?: string;
  text: string;
  approx_time: number | null;
  step_order: number;
};

export type RecipeRecord = {
  id: string;
  user_id: string;
  name: string;
  photo: string | null;
  prep_time: number;
  total_time: number;
  eat_outside: boolean;
  created_at: string;
  updated_at: string;
};

export type IngredientRecord = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type RecipeIngredientRecord = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: string;
  unit: string;
  ingredient?: IngredientRecord;
};

export type RecipeStepRecord = {
  id: string;
  recipe_id: string;
  text: string;
  approx_time: number | null;
  step_order: number;
};

export type RecipeWithRelations = RecipeRecord & {
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
};

export type MealSlotType = "lunch" | "dinner";

export type MealPlanSlot = {
  id: string;
  week_start: string;
  day_index: number;
  slot_type: MealSlotType;
  recipe_id: string | null;
  note: string | null;
};

export type MealPlanDayNote = {
  id: string;
  week_start: string;
  day_index: number;
  note: string | null;
};

export type WeekSlotValue = {
  recipe_id: string | null;
  note: string;
};

export type WeekDayPlan = {
  lunch: WeekSlotValue;
  dinner: WeekSlotValue;
  dayNote: string;
};

export type WeekPlanState = Record<number, WeekDayPlan>;

export type RecipeFilters = {
  search: string;
  totalTimeMax: string;
  ingredientIds: string[];
  eatOutsideOnly: boolean;
};

export type SaveRecipePayload = {
  id?: string;
  name: string;
  photo: string | null;
  prep_time: number;
  total_time: number;
  eat_outside: boolean;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
};