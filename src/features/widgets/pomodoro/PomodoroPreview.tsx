"use client";

import { useMemo } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { LobbyWidget } from "@/features/lobby/types";
import { usePomodoroController } from "./pomodoroLogic";

type Props = {
  widget: LobbyWidget;
};

function IconButton({
  onClick,
  children,
  title,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/90 transition duration-200 hover:bg-white/14 ${className}`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  onClick,
  children,
  title,
  compact = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 font-medium text-white transition duration-200 hover:bg-white/16 ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
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

function MicroLayout({ widget }: Props) {
  const { formattedTime, state, actions, visualTheme } = usePomodoroController(
    widget.id
  );

  const zen = state.isRunning;

  return (
    <div className="group relative h-full overflow-hidden rounded-[inherit]">
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-2 py-2">
        <div
          className={`text-center transition-all duration-300 ${
            zen ? "translate-y-1 scale-[1.03]" : "scale-100"
          }`}
        >
          <div
            className={`text-[2.3rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}
          >
            {formattedTime}
          </div>
        </div>

        <div
          className={`mt-3 flex items-center justify-center gap-2 transition-all duration-300 ${
            zen
              ? "pointer-events-none opacity-0 translate-y-1 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={actions.toggleRunning}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition duration-200 hover:bg-white/16"
            title={state.isRunning ? "Pause" : "Start"}
          >
            {state.isRunning ? (
              <Pause size={18} strokeWidth={2.2} />
            ) : (
              <Play size={18} strokeWidth={2.2} className="translate-x-[1px]" />
            )}
          </button>

          <IconButton
            onClick={actions.resetTimer}
            title="Reset"
            className="h-8 w-8"
          >
            <RotateCcw size={14} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function CompactLayout({ widget }: Props) {
  const { formattedTime, modeLabel, state, actions, visualTheme } =
    usePomodoroController(widget.id);
  const zen = state.isRunning;

  return (
    <div className="group relative h-full overflow-hidden rounded-[inherit]">
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-3 pb-3 pt-4">
        <div
          className={`pointer-events-none transition-all duration-300 ${
            zen
              ? "opacity-0 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] ${visualTheme.badgeClassName}`}
          >
            {modeLabel}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div
            className={`text-center transition-all duration-300 ${
              zen ? "scale-[1.04]" : "scale-100"
            }`}
          >
            <div
              className={`text-[2.8rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}
            >
              {formattedTime}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center gap-2 transition-all duration-300 ${
            zen
              ? "pointer-events-none translate-y-1 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <PrimaryButton
            onClick={actions.toggleRunning}
            title={state.isRunning ? "Pause" : "Start"}
            compact
          >
            {state.isRunning ? (
              <Pause size={14} />
            ) : (
              <Play size={14} className="translate-x-[1px]" />
            )}
            {state.isRunning ? "Pause" : "Start"}
          </PrimaryButton>

          <IconButton onClick={actions.resetTimer} title="Reset" className="h-9 w-9">
            <RotateCcw size={14} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function VisualLayout({ widget }: Props) {
  const { formattedTime, modeLabel, progress, state, actions, visualTheme } =
    usePomodoroController(widget.id);
  const zen = state.isRunning;

  return (
    <div className="group relative h-full overflow-hidden rounded-[inherit]">
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 pb-4 pt-3">
        <div
          className={`transition-all duration-300 ${
            zen
              ? "opacity-0 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] ${visualTheme.badgeClassName}`}
          >
            {modeLabel}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <ProgressRing
            progress={progress}
            size={164}
            strokeWidth={9}
            className={`${visualTheme.ringClassName} transition-all duration-300 ${
              zen ? "scale-[1.03]" : "scale-100"
            }`}
          >
            <div className="flex flex-col items-center">
              <span
                className={`text-[2.5rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}
              >
                {formattedTime}
              </span>
              <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/45">
                {modeLabel}
              </span>
            </div>
          </ProgressRing>
        </div>

        <div
          className={`flex items-center justify-center gap-2 transition-all duration-300 ${
            zen
              ? "pointer-events-none translate-y-1 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <PrimaryButton
            onClick={actions.toggleRunning}
            title={state.isRunning ? "Pause" : "Start"}
            compact
          >
            {state.isRunning ? (
              <Pause size={14} />
            ) : (
              <Play size={14} className="translate-x-[1px]" />
            )}
            {state.isRunning ? "Pause" : "Start"}
          </PrimaryButton>

          <IconButton onClick={actions.resetTimer} title="Reset" className="h-9 w-9">
            <RotateCcw size={14} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default function PomodoroPreview({ widget }: Props) {
  const content = useMemo(() => {
    if (widget.size === "1x1") return <MicroLayout widget={widget} />;
    if (widget.size === "2x1") return <CompactLayout widget={widget} />;
    return <VisualLayout widget={widget} />;
  }, [widget]);

  return <div className="h-full w-full">{content}</div>;
}