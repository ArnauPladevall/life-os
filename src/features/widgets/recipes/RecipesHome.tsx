"use client";

import { BookOpen, CalendarDays, PlusSquare } from "lucide-react";

type RecipesHomeProps = {
  onCreate: () => void;
  onLibrary: () => void;
  onPlanner: () => void;
};

function HomeCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-amber-400/30 hover:bg-amber-400/[0.06]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-amber-300">
        {icon}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
      </div>
    </button>
  );
}

export default function RecipesHome({ onCreate, onLibrary, onPlanner }: RecipesHomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Recipes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Recipe book and weekly planning</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Create recipes, organize them with ingredient tags, and assign them to lunch or dinner for the week.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <HomeCard
          title="Create Recipe"
          description="Add a new recipe with ingredients, timings, and ordered cooking steps."
          icon={<PlusSquare className="h-5 w-5" />}
          onClick={onCreate}
        />
        <HomeCard
          title="Recipe Library"
          description="Search and filter your saved recipes by time, ingredients, and portability."
          icon={<BookOpen className="h-5 w-5" />}
          onClick={onLibrary}
        />
        <HomeCard
          title="Week Planner"
          description="Plan lunch and dinner for all 7 days and keep optional notes per day."
          icon={<CalendarDays className="h-5 w-5" />}
          onClick={onPlanner}
        />
      </div>
    </div>
  );
}