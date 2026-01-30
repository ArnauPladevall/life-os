"use client";

import { Pause, Play, RotateCcw, Timer, Sparkles, SkipForward } from "lucide-react";
import { usePomodoro } from "./usePomodoro";
import { useLocale } from "@/context/LocaleContext";

export default function PomodoroApp() {
  const { t } = useLocale();
  const { mode, isActive, timeLeft, cycle, toggle, reset, format, progress, setMode, skip } = usePomodoro();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Timer size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">{t('app_pomodoro')}</div>
            <div className="text-sm text-white/40">{t('pomodoro_cycle')} #{cycle} · {mode === "focus" ? `${t('pomodoro_focus')} 50` : `${t('pomodoro_break')} 10`}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("focus")}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-colors ${mode === "focus" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
          >
            {t('pomodoro_focus')}
          </button>
          <button
            onClick={() => setMode("break")}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-colors ${mode === "break" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
          >
            {t('pomodoro_break')}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(600px 200px at 50% 10%, rgba(255,255,255,0.12), transparent 60%)" }} />

          <div className="relative">
            <div className="text-7xl md:text-8xl font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              {format(timeLeft)}
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
              <div className="h-full bg-white/25" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={toggle}
                className="h-12 px-5 rounded-2xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {isActive ? <Pause size={18} /> : <Play size={18} />}
                {isActive ? t('pomodoro_pause') : t('pomodoro_start')}
              </button>
              <button
                onClick={skip}
                className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <SkipForward size={18} />
                {t('pomodoro_skip')}
              </button>
              <button
                onClick={() => reset()}
                className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={18} />
                {t('pomodoro_reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">{t('common_mode')}</div>
              <div className="text-sm text-white/40">50/10</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Sparkles size={18} className="text-white/80" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => reset("focus")}
              className={`p-4 rounded-2xl border text-left transition-colors ${mode === "focus" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
            >
              <div className="text-xs uppercase tracking-widest opacity-70">{t('pomodoro_focus')}</div>
              <div className="text-xl font-semibold mt-1">50 min</div>
            </button>
            <button
              onClick={() => reset("break")}
              className={`p-4 rounded-2xl border text-left transition-colors ${mode === "break" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
            >
              <div className="text-xs uppercase tracking-widest opacity-70">{t('pomodoro_break')}</div>
              <div className="text-xl font-semibold mt-1">10 min</div>
            </button>
          </div>

          <div className="mt-6 text-sm text-white/60 leading-relaxed">{t('pomodoro_tip')}</div>
        </div>
      </div>
    </div>
  );
}
