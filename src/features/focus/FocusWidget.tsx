"use client";

import { Target } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "@/context/TasksContext";
import { loadFocusIds } from "./focusStorage";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function FocusWidget({ size }: { size: WidgetSize }) {
  const { tasks } = useTasks();

  const { top, done, total } = useMemo(() => {
    const ids = loadFocusIds();
    const focusTasks = ids.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as typeof tasks;
    const n = size === "1x1" ? 1 : size === "2x1" ? 2 : size === "4x2" ? 5 : 3;
    const fallbacks = tasks.filter((t) => t.status !== "done").slice(0, Math.max(0, n - focusTasks.length));
    const top3 = [...focusTasks, ...fallbacks].slice(0, n);
    const total = top3.length;
    const done = top3.filter((t) => t.status === "done").length;
    return { top: top3, done, total };
  }, [tasks]);

  const progress = total === 0 ? 0 : (done / total) * 100;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <Target size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-semibold text-white">Focus</div>
        </div>
        <div className="text-[10px] text-white/40">{done}/{total}</div>
      </div>

      <div className="space-y-2">
        {top.length === 0 ? (
          <div className="h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-sm">Vacío</div>
        ) : (
          top.map((t) => (
            <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${t.status === "done" ? "text-white/45 line-through" : "text-white"}`}>{t.title}</div>
                <div className="text-[11px] text-white/35">{t.priority}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${t.status === "done" ? "bg-white/20" : "bg-white/60"}`} />
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-3">
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-white/20" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      </div>
    </div>
  );
}
