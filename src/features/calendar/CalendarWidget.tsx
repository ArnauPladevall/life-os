"use client";

import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "@/context/TasksContext";
import { parseISODate, startOfMonth, toDayKey } from "./calendarUtils";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function CalendarWidget({ size }: { size: WidgetSize }) {
  const { tasks } = useTasks();
  const now = new Date();
  const first = startOfMonth(now);

  const compact = size === "1x1";
  const wide = size === "4x2";

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      const d = parseISODate(t.due_date) || (t.status === "today" ? new Date() : null);
      if (!d) continue;
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue;
      const key = toDayKey(d);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [tasks, now]);

  const monthLabel = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday-first

  const upcoming = useMemo(() => {
    const list = tasks
      .map((t) => {
        const d = parseISODate(t.due_date);
        if (!d) return null;
        return { t, d };
      })
      .filter(Boolean) as { t: typeof tasks[number]; d: Date }[];
    list.sort((a, b) => a.d.getTime() - b.d.getTime());
    return list.filter((x) => x.d.getTime() >= now.getTime() - 12 * 60 * 60 * 1000).slice(0, 4);
  }, [tasks, now]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <CalendarDays size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-semibold text-white">Calendario</div>
        </div>
        <div className="text-[10px] text-white/40 capitalize">{monthLabel}</div>
      </div>

      {!compact && (
        <div className="grid grid-cols-7 gap-1 text-[10px] text-white/35 mb-2 select-none">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
        </div>
      )}

      <div className={`flex-1 ${wide ? "grid grid-cols-12 gap-4" : ""}`}>
        <div className={`${wide ? "col-span-7" : "grid grid-cols-7 gap-1"} ${compact ? "hidden" : ""}`}>
          <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`o-${i}`} className="rounded-lg bg-transparent" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const d = new Date(now.getFullYear(), now.getMonth(), day);
          const key = toDayKey(d);
          const n = counts.get(key) ?? 0;
          const isToday = day === now.getDate();
          return (
            <div
              key={key}
              className={`rounded-xl border ${isToday ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"} flex flex-col items-center justify-center relative overflow-hidden`}
            >
              <div className={`text-xs font-semibold ${isToday ? "text-white" : "text-white/75"}`}>{day}</div>
              {n > 0 && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {Array.from({ length: Math.min(3, n) }).map((__, idx) => (
                    <div key={idx} className="w-1 h-1 rounded-full bg-white/60" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
          </div>
        </div>

        {(wide || compact) && (
          <div className={`${wide ? "col-span-5" : ""} ${compact ? "flex" : ""} flex-col`}
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Próximas</div>
              <div className="mt-2 space-y-2">
                {upcoming.length === 0 ? (
                  <div className="text-xs text-white/30">Sin fechas.</div>
                ) : (
                  upcoming.map(({ t, d }) => (
                    <div key={t.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white/80 truncate">{t.title}</div>
                        <div className="text-[10px] text-white/35">
                          {d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {t.priority}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
