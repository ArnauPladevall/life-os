"use client";

import type { LobbyWidget, WidgetDefinition, WidgetTone } from "./types";
import PomodoroPreview from "@/features/widgets/pomodoro/PomodoroPreview";
import PomodoroExpanded from "@/features/widgets/pomodoro/PomodoroExpanded";


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
];


export const WIDGET_MAP = Object.fromEntries(
  WIDGET_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<string, WidgetDefinition>;

export const DEFAULT_WIDGET_LAYOUT: LobbyWidget[] = [];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_MAP[type];
}
