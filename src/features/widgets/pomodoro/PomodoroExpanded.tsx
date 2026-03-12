"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { LobbyWidget } from "@/features/lobby/types";
import {
  PomodoroConfig,
  usePomodoroConfigDraft,
  usePomodoroController,
} from "./pomodoroLogic";

type Props = {
  widget: LobbyWidget;
};

function ExpandedButton({
  onClick,
  children,
  primary = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition duration-200 ${
        primary
          ? "border border-white/10 bg-white/12 text-white hover:bg-white/18"
          : "border border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function ProgressRing({
  progress,
  size,
  strokeWidth,
  className,
  children,
}: {
  progress: number;
  size: number;
  strokeWidth: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function ConfigPanel({
  config,
  onSave,
  onClose,
  saving,
}: {
  config: PomodoroConfig;
  onSave: (config: PomodoroConfig) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const { draft, setDraft } = usePomodoroConfigDraft(config);

  const updateField = (field: keyof PomodoroConfig, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: Number(value || 0),
    }));
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/45">
          Settings
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-white/45 transition hover:text-white/80"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs text-white/55">Work</span>
          <input
            type="number"
            min={1}
            value={draft.workMinutes}
            onChange={(event) => updateField("workMinutes", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs text-white/55">Break</span>
          <input
            type="number"
            min={1}
            value={draft.breakMinutes}
            onChange={(event) => updateField("breakMinutes", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs text-white/55">Long Break</span>
          <input
            type="number"
            min={1}
            value={draft.longBreakMinutes}
            onChange={(event) => updateField("longBreakMinutes", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs text-white/55">Cycles</span>
          <input
            type="number"
            min={2}
            value={draft.cyclesBeforeLongBreak}
            onChange={(event) =>
              updateField("cyclesBeforeLongBreak", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-white/40">
          {saving ? "Saving..." : "Saved to Supabase"}
        </span>
        <button
          type="button"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function PomodoroExpanded({ widget }: Props) {
  const {
    formattedTime,
    modeLabel,
    cycleLabel,
    progress,
    config,
    configSaving,
    state,
    actions,
    visualTheme,
  } = usePomodoroController(widget.id);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      if (tag === "input" || tag === "textarea") return;

      if (event.code === "Space") {
        event.preventDefault();
        actions.toggleRunning();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        actions.resetTimer();
        return;
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        actions.skipPhase();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);

  const modeSummary = useMemo(() => {
    if (!state.isRunning) return "Idle";
    if (state.mode === "WORK") return "Work";
    if (state.mode === "SHORT_BREAK") return "Short break";
    return "Long break";
  }, [state.isRunning, state.mode]);

  return (
    <div className="flex h-full w-full items-center justify-center px-8 py-10">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${visualTheme.glowClassName} opacity-80 transition-opacity duration-500`}
          />

          <div className="relative z-10 mb-8 flex items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] ${visualTheme.badgeClassName}`}
            >
              {modeLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/55">
              Cycle {cycleLabel}
            </span>
          </div>

          <ProgressRing
            progress={progress}
            size={360}
            strokeWidth={14}
            className={`${visualTheme.ringClassName} transition-all duration-500 ${
              state.isRunning ? "scale-[1.01]" : "scale-100"
            }`}
          >
            <div className="flex flex-col items-center">
              <span
                className={`text-6xl font-semibold tracking-tight sm:text-7xl ${visualTheme.textClassName}`}
              >
                {formattedTime}
              </span>
              <span className="mt-3 text-xs uppercase tracking-[0.32em] text-white/40">
                {modeSummary}
              </span>
            </div>
          </ProgressRing>

          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
            <ExpandedButton onClick={actions.toggleRunning} primary>
              {state.isRunning ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="translate-x-[1px]" />
              )}
              {state.isRunning ? "Pause" : "Start"}
            </ExpandedButton>

            <ExpandedButton onClick={actions.resetTimer}>
              <RotateCcw size={16} />
              Reset
            </ExpandedButton>

            <ExpandedButton onClick={actions.skipPhase}>
              <SkipForward size={16} />
              Skip
            </ExpandedButton>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
                Pomodoro
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Focus timer
              </div>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                Clean full-screen timer with professional visual states,
                keyboard shortcuts and reliable persistence.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings((value) => !value)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
              title="Settings"
            >
              <Settings2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                Completed cycles
              </div>
              <div className="mt-3 text-4xl font-semibold text-white">
                {state.completedWorkCycles}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                Current cycle
              </div>
              <div className="mt-3 text-4xl font-semibold text-white">
                {cycleLabel}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
              <Sparkles size={14} />
              Current setup
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                Work: {config.workMinutes}m
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                Break: {config.breakMinutes}m
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                Long: {config.longBreakMinutes}m
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                Every {config.cyclesBeforeLongBreak} cycles
              </div>
            </div>
          </div>

          {showSettings ? (
            <ConfigPanel
              config={config}
              onSave={actions.updateConfig}
              onClose={() => setShowSettings(false)}
              saving={configSaving}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}