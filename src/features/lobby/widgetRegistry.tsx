"use client";

import { Check } from "lucide-react";
import type {
  AppDefinition,
  LobbyWidget,
  WidgetDefinition,
  WidgetRenderContext,
  WidgetTone,
} from "./types";
import PomodoroPreview from "@/features/widgets/pomodoro/PomodoroPreview";
import PomodoroExpanded from "@/features/widgets/pomodoro/PomodoroExpanded";
import RecipesApp from "@/features/widgets/recipes/RecipesApp";
import VaultApp from "@/features/widgets/vault/VaultApp";

export const WIDGET_TONE_CLASSES: Record<WidgetTone, string> = {
  neutral:
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]",
  violet:
    "bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(255,255,255,0.02))]",
  blue: "bg-[linear-gradient(180deg,rgba(59,130,246,0.16),rgba(255,255,255,0.02))]",
  emerald:
    "bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(255,255,255,0.02))]",
  amber:
    "bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(255,255,255,0.02))]",
  rose: "bg-[linear-gradient(180deg,rgba(244,63,94,0.15),rgba(255,255,255,0.02))]",
};

export const APP_DEFINITIONS: AppDefinition[] = [
  {
    kind: "app",
    type: "recipes",
    name: "Recipes",
    description: "Personal recipe book and weekly meal planning workspace.",
    icon: "🍳",
    renderApp: () => <RecipesApp />,
  },
  {
    kind: "app",
    type: "vault",
    name: "Vault",
    description: "Secure password manager and sensitive information storage.",
    icon: "🔐",
    renderApp: () => (
      <VaultApp
        widget={{
          id: "vault-app",
          type: "vault",
          size: "1x1",
          tone: "neutral",
          page: 0,
          x: 0,
          y: 0,
        }}
      />
    ),
  },
];

function getLauncherSelection(state: unknown) {
  if (!state || typeof state !== "object") {
    return APP_DEFINITIONS.map((app) => app.type);
  }

  const candidate = state as { apps?: unknown };

  if (!Array.isArray(candidate.apps)) {
    return APP_DEFINITIONS.map((app) => app.type);
  }

  const valid = candidate.apps.filter(
    (value): value is string =>
      typeof value === "string" &&
      APP_DEFINITIONS.some((app) => app.type === value)
  );

  return valid.length > 0 ? valid : APP_DEFINITIONS.map((app) => app.type);
}

function getLauncherPreviewConfig(size: LobbyWidget["size"]) {
  switch (size) {
    case "1x1":
      return { maxItems: 1, iconBox: "h-14 w-14 text-[1.45rem]", cols: "grid-cols-1", gap: "gap-0" };
    case "2x1":
      return { maxItems: 2, iconBox: "h-14 w-14 text-[1.35rem]", cols: "grid-cols-2", gap: "gap-3" };
    case "4x2":
      return { maxItems: 6, iconBox: "h-16 w-16 text-[1.55rem]", cols: "grid-cols-3", gap: "gap-3.5" };
    case "2x2":
    default:
      return { maxItems: 4, iconBox: "h-15 w-15 text-[1.45rem]", cols: "grid-cols-2", gap: "gap-3" };
  }
}

function LauncherPreview({
  widget,
  context,
}: {
  widget: LobbyWidget;
  context: WidgetRenderContext;
}) {
  const selectedAppTypes = getLauncherSelection(context.widgetState);
  const selectedApps = APP_DEFINITIONS.filter((app) => selectedAppTypes.includes(app.type));
  const config = getLauncherPreviewConfig(widget.size);
  const visibleApps = selectedApps.slice(0, config.maxItems);

  if (visibleApps.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/26">Empty</div>
      </div>
    );
  }

  if (widget.size === "1x1") {
    const app = visibleApps[0];

    return (
      <div className="flex h-full items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!context.isEditing) {
              context.openApp(app.type);
            }
          }}
          className={`flex items-center justify-center rounded-[1.45rem] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08] ${config.iconBox}`}
          title={app.name}
        >
          {app.icon}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className={`grid ${config.cols} ${config.gap}`}>
        {visibleApps.map((app) => (
          <button
            key={app.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!context.isEditing) {
                context.openApp(app.type);
              }
            }}
            className={`flex items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/[0.045] transition hover:bg-white/[0.08] ${config.iconBox}`}
            title={app.name}
          >
            {app.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function LauncherExpanded({ widgetState, setWidgetState, openApp }: WidgetRenderContext) {
  const selectedAppTypes = getLauncherSelection(widgetState);

  const toggleApp = (type: string) => {
    const exists = selectedAppTypes.includes(type);
    const nextApps = exists
      ? selectedAppTypes.filter((value) => value !== type)
      : [...selectedAppTypes, type];

    setWidgetState({
      apps: nextApps.length > 0 ? nextApps : [type],
    });
  };

  return (
    <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#0a0b0f]/92 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-8">
      <div className="mb-7">
        <div className="text-[11px] uppercase tracking-[0.32em] text-white/30">App launcher</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Visible apps</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/44">
          Select the app icons you want inside this launcher. The board stays compact and every icon opens the app directly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {APP_DEFINITIONS.map((app) => {
          const selected = selectedAppTypes.includes(app.type);

          return (
            <div
              key={app.type}
              className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-black/20 text-2xl">
                    {app.icon}
                  </div>

                  <div>
                    <div className="text-lg font-semibold tracking-tight text-white">{app.name}</div>
                    <div className="mt-1 text-sm text-white/44">{app.description}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleApp(app.type)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    selected
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]"
                  }`}
                  title={selected ? "Hide app" : "Show app"}
                >
                  {selected && <Check size={15} />}
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => openApp(app.type)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  Open app
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    kind: "widget",
    type: "pomodoro",
    name: "Pomodoro",
    description: "Focus timer with quick session control.",
    icon: "🍅",
    defaultSize: "2x2",
    supportedSizes: ["1x1", "2x1", "2x2", "4x2"],
    expandable: true,
    defaultTone: "rose",
    renderPreview: (widget, context) => (
      <PomodoroPreview widget={widget} isEditing={context.isEditing} />
    ),
    renderExpanded: (widget) => <PomodoroExpanded widget={widget} />,
  },
  {
    kind: "widget",
    type: "app-launcher",
    name: "App Launcher",
    description: "Compact icon launcher for fullscreen apps.",
    icon: "📱",
    defaultSize: "2x1",
    supportedSizes: ["1x1", "2x1", "2x2", "4x2"],
    expandable: true,
    defaultTone: "neutral",
    renderPreview: (widget, context) => (
      <LauncherPreview widget={widget} context={context} />
    ),
    renderExpanded: (_widget, context) => (
      <LauncherExpanded
        openApp={context.openApp}
        widgetState={context.widgetState}
        setWidgetState={context.setWidgetState}
        isEditing={context.isEditing}
      />
    ),
  },
];

export const WIDGET_MAP = Object.fromEntries(
  WIDGET_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<string, WidgetDefinition>;

export const APP_MAP = Object.fromEntries(
  APP_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<string, AppDefinition>;

export const DEFAULT_WIDGET_LAYOUT: LobbyWidget[] = [];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_MAP[type];
}

export function getAppDefinition(type: string): AppDefinition | undefined {
  return APP_MAP[type];
}