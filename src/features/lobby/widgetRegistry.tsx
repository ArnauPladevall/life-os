"use client";

import type { LobbyWidget, WidgetDefinition, WidgetTone } from "./types";
import PomodoroPreview from "@/features/widgets/pomodoro/PomodoroPreview";
import PomodoroExpanded from "@/features/widgets/pomodoro/PomodoroExpanded";

import RecipesApp from "@/features/widgets/recipes/RecipesApp";
import RecipesLauncherPreview from "@/features/widgets/recipes/RecipesLauncherPreview";

import VaultApp from "@/features/widgets/vault/VaultApp";

export const WIDGET_TONE_CLASSES: Record<WidgetTone, string> = {
  neutral: "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]",
  violet: "bg-[linear-gradient(180deg,rgba(139,92,246,0.22),rgba(255,255,255,0.03))]",
  blue: "bg-[linear-gradient(180deg,rgba(59,130,246,0.22),rgba(255,255,255,0.03))]",
  emerald: "bg-[linear-gradient(180deg,rgba(16,185,129,0.20),rgba(255,255,255,0.03))]",
  amber: "bg-[linear-gradient(180deg,rgba(245,158,11,0.20),rgba(255,255,255,0.03))]",
  rose: "bg-[linear-gradient(180deg,rgba(244,63,94,0.20),rgba(255,255,255,0.03))]",
};

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: "pomodoro",
    name: "Pomodoro",
    description: "Focus timer",
    defaultSize: "2x2",
    supportedSizes: ["1x1", "2x1", "2x2"],
    expandable: true,
    defaultTone: "rose",
    renderPreview: (widget) => <PomodoroPreview widget={widget} />,
    renderExpanded: (widget) => <PomodoroExpanded widget={widget} />,
  },
  {
    type: "recipes",
    name: "Recipes",
    description: "Personal recipe book and weekly meal planner",
    defaultSize: "1x1",
    supportedSizes: ["1x1"],
    expandable: true,
    defaultTone: "amber",
    renderPreview: () => <RecipesLauncherPreview compact />,
    renderExpanded: () => <RecipesApp />,
  },
  {
    type: "vault",
    name: "Vault",
    description: "Secure password manager",
    defaultSize: "1x1",
    supportedSizes: ["1x1"],
    expandable: true,
    defaultTone: "neutral",
    renderPreview: () => (
      <div className="flex h-full w-full cursor-pointer items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-2xl leading-none">🔑</div>
          <div className="text-xs font-medium text-white/78">Vault</div>
        </div>
      </div>
    ),
    renderExpanded: (widget) => <VaultApp widget={widget} />,
  },
];

export const WIDGET_MAP = Object.fromEntries(
  WIDGET_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<string, WidgetDefinition>;

export const DEFAULT_WIDGET_LAYOUT: LobbyWidget[] = [];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_MAP[type];
}