"use client";

import { useMemo } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { LobbyWidget } from "@/features/lobby/types";
import { usePomodoroController } from "./pomodoroLogic";

type Props = {
  widget: LobbyWidget;
  isEditing?: boolean;
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/90 transition duration-200 hover:bg-white/[0.10] ${className}`}
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.08] font-medium text-white transition duration-200 hover:bg-white/[0.12] ${
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
          stroke="rgba(255,255,255,0.08)"
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

      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function SmallLayout({ widget, isEditing }: Props) {
  const { formattedTime, state, actions, progress, visualTheme } = usePomodoroController(widget.id);

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <ProgressRing
        progress={progress}
        size={94}
        strokeWidth={7}
        className={visualTheme.ringClassName}
      >
        <div className="flex flex-col items-center">
          <div className={`text-[1.1rem] font-semibold tracking-tight ${visualTheme.textClassName}`}>
            {formattedTime}
          </div>
        </div>
      </ProgressRing>

      {!isEditing && (
        <div className="absolute bottom-1.5">
          <IconButton
            onClick={actions.toggleRunning}
            title={state.isRunning ? "Pause" : "Start"}
            className="h-8 w-8"
          >
            {state.isRunning ? <Pause size={13} /> : <Play size={13} className="translate-x-[1px]" />}
          </IconButton>
        </div>
      )}
    </div>
  );
}

function WideLayout({ widget, isEditing }: Props) {
  const { formattedTime, modeLabel, state, actions, visualTheme } = usePomodoroController(widget.id);

  return (
    <div className="flex h-full items-center justify-between gap-4 px-1">
      <div className="min-w-0">
        <div className={`text-[10px] font-medium uppercase tracking-[0.32em] ${visualTheme.badgeClassName}`}>
          {modeLabel}
        </div>
        <div className={`mt-3 text-[2.1rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}>
          {formattedTime}
        </div>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2">
          <PrimaryButton
            onClick={actions.toggleRunning}
            title={state.isRunning ? "Pause" : "Start"}
            compact
          >
            {state.isRunning ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
            {state.isRunning ? "Pause" : "Start"}
          </PrimaryButton>

          <IconButton onClick={actions.resetTimer} title="Reset" className="h-9 w-9">
            <RotateCcw size={14} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

function SquareLayout({ widget, isEditing }: Props) {
  const { formattedTime, modeLabel, progress, state, actions, visualTheme } =
    usePomodoroController(widget.id);

  return (
    <div className="flex h-full flex-col items-center justify-between pt-1">
      <div className={`text-[10px] font-medium uppercase tracking-[0.34em] ${visualTheme.badgeClassName}`}>
        {modeLabel}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <ProgressRing
          progress={progress}
          size={170}
          strokeWidth={8}
          className={visualTheme.ringClassName}
        >
          <div className="flex flex-col items-center">
            <span className={`text-[2.5rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}>
              {formattedTime}
            </span>
            <span className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/32">
              Focus
            </span>
          </div>
        </ProgressRing>
      </div>

      {!isEditing && (
        <div className="flex items-center justify-center gap-2">
          <PrimaryButton
            onClick={actions.toggleRunning}
            title={state.isRunning ? "Pause" : "Start"}
            compact
          >
            {state.isRunning ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
            {state.isRunning ? "Pause" : "Start"}
          </PrimaryButton>

          <IconButton onClick={actions.resetTimer} title="Reset" className="h-9 w-9">
            <RotateCcw size={14} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

function LargeLayout({ widget, isEditing }: Props) {
  const { formattedTime, modeLabel, progress, state, actions, visualTheme } =
    usePomodoroController(widget.id);

  return (
    <div className="flex h-full items-center justify-between gap-8 px-3">
      <div className="min-w-0 flex-1">
        <div className={`text-[10px] font-medium uppercase tracking-[0.36em] ${visualTheme.badgeClassName}`}>
          {modeLabel}
        </div>

        <div className={`mt-5 text-[4rem] font-semibold leading-none tracking-tight ${visualTheme.textClassName}`}>
          {formattedTime}
        </div>

        <div className="mt-3 text-sm text-white/36">Calm focus, one session at a time.</div>

        {!isEditing && (
          <div className="mt-6 flex items-center gap-2">
            <PrimaryButton onClick={actions.toggleRunning} title={state.isRunning ? "Pause" : "Start"}>
              {state.isRunning ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
              {state.isRunning ? "Pause" : "Start"}
            </PrimaryButton>

            <IconButton onClick={actions.resetTimer} title="Reset" className="h-10 w-10">
              <RotateCcw size={15} />
            </IconButton>
          </div>
        )}
      </div>

      <div className="flex w-[220px] items-center justify-center">
        <ProgressRing
          progress={progress}
          size={200}
          strokeWidth={9}
          className={visualTheme.ringClassName}
        >
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.30em] text-white/32">Session</div>
          </div>
        </ProgressRing>
      </div>
    </div>
  );
}

export default function PomodoroPreview({ widget, isEditing = false }: Props) {
  const content = useMemo(() => {
    if (widget.size === "1x1") return <SmallLayout widget={widget} isEditing={isEditing} />;
    if (widget.size === "2x1") return <WideLayout widget={widget} isEditing={isEditing} />;
    if (widget.size === "4x2") return <LargeLayout widget={widget} isEditing={isEditing} />;
    return <SquareLayout widget={widget} isEditing={isEditing} />;
  }, [widget, isEditing]);

  return <div className="h-full w-full">{content}</div>;
}