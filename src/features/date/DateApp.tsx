"use client";

import { Calendar, CheckCircle2, Circle } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "@/context/TasksContext";

export default function DateApp() {
  const now = new Date();
  const { tasks, updateTask } = useTasks();

  const label = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const todayKey = now.toISOString().slice(0, 10);
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === "today") return true;
        if (!t.due_date) return false;
        return t.due_date.slice(0, 10) === todayKey;
      })
      .slice(0, 14);
  }, [tasks, todayKey]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Calendar size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Fecha</div>
            <div className="text-sm text-white/40 capitalize">{label}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 lg:col-span-1">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Semana</div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(now);
              d.setDate(now.getDate() - ((now.getDay() + 6) % 7) + i);
              const isToday = d.toDateString() === now.toDateString();
              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-3 text-center ${isToday ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"}`}
                >
                  <div className="text-[10px] uppercase tracking-widest text-white/40">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="mt-1 text-lg font-mono text-white/80">{d.getDate().toString().padStart(2, "0")}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 lg:col-span-2 flex flex-col">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Hoy</div>
              <div className="text-sm text-white/40">Tareas con due_date de hoy o marcadas como Today</div>
            </div>
            <div className="text-[11px] text-white/40">{todayTasks.length}</div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-2" onPointerDown={(e) => e.stopPropagation()}>
            {todayTasks.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-white/30 text-sm">Nada programado para hoy.</div>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <button
                    onClick={() => updateTask(t.id, { status: t.status === "done" ? "backlog" : "done" })}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {t.status === "done" ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-base font-semibold truncate ${t.status === "done" ? "text-white/40 line-through" : "text-white"}`}>{t.title}</div>
                    <div className="mt-1 text-[11px] text-white/35">{t.priority}{t.due_date ? ` · ${t.due_date.slice(0, 16).replace('T', ' ')}` : ""}</div>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${t.status === "done" ? "bg-white/20" : "bg-white/60"}`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
