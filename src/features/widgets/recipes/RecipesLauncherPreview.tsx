"use client";

import { ChefHat } from "lucide-react";

type RecipesLauncherPreviewProps = {
  compact?: boolean;
};

export default function RecipesLauncherPreview({ compact = false }: RecipesLauncherPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={[
          "flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-center",
          compact ? "gap-1 px-3 py-3" : "gap-2 px-4 py-4",
        ].join(" ")}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
          <ChefHat className="h-5 w-5 text-amber-300" />
        </div>

        <span className="text-xs font-medium tracking-wide text-zinc-200">Recipes</span>
      </div>
    </div>
  );
}