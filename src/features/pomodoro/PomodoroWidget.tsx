"use client";

import { Play, Pause, RotateCcw, Timer, SkipForward } from "lucide-react";
import { usePomodoro } from "./usePomodoro";
import { useLocale } from "@/context/LocaleContext";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function PomodoroWidget({ size }: { size: WidgetSize }) {
  const { t } = useLocale();
  const { mode, isActive, timeLeft, toggle, reset, skip, format, progress } = usePomodoro();

  const compact = size === "1x1";
  const wide = size === "4x2";

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <Timer size={16} className="text-white/80" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{t('app_pomodoro')}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              {mode === "focus" ? `${t('pomodoro_focus')} 50` : `${t('pomodoro_break')} 10`}
            </div>
          </div>
        </div>
        {!compact && (
          <div className={`text-[10px] px-2 py-1 rounded-full border ${isActive ? "bg-green-500/15 border-green-500/30 text-green-300" : "bg-white/5 border-white/10 text-white/40"}`}>
            {isActive ? t('pomodoro_status_run') : t('pomodoro_status_idle')}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className={`${compact ? "text-4xl" : wide ? "text-6xl" : "text-5xl"} font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50`}>
          {format(timeLeft)}
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); reset(); }}
          className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); skip(); }}
          className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          aria-label={t('pomodoro_skip')}
          title={t('pomodoro_skip')}
        >
          <SkipForward size={16} />
        </button>
        </div>
      )}

      {compact && (
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className="mt-2 h-10 w-full rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}

      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-white/20" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
}
