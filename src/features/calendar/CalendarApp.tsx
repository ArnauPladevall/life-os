"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Plus, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { useTasks } from "@/context/TasksContext";
import { addMonths, parseISODate, sameDay, startOfMonth, toDayKey } from "./calendarUtils";

export default function CalendarApp() {
  const { tasks, addTask, updateTask } = useTasks();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [quickTitle, setQuickTitle] = useState("");

  const first = startOfMonth(cursor);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const byDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const d = parseISODate(t.due_date);
      if (!d) continue;
      const key = toDayKey(d);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const selectedKey = toDayKey(selected);
  const selectedTasks = (byDay.get(selectedKey) ?? []).slice().sort((a, b) => {
    const pa = a.priority === "high" ? 0 : a.priority === "medium" ? 1 : 2;
    const pb = b.priority === "high" ? 0 : b.priority === "medium" ? 1 : 2;
    return pa - pb;
  });

  const quickAdd = async () => {
    const title = quickTitle.trim();
    if (!title) return;
    await addTask({
      title,
      status: "week",
      priority: "medium",
      due_date: new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 12, 0, 0).toISOString(),
    });
    setQuickTitle("");
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <CalendarDays size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Calendario</div>
            <div className="text-sm text-white/40 capitalize">{monthLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor((d) => addMonths(d, -1))}
            className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 md:p-6 border border-white/10">
          <div className="grid grid-cols-7 gap-2 text-[10px] text-white/35 mb-3 select-none">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`o-${i}`} className="h-14 rounded-2xl bg-transparent" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(first.getFullYear(), first.getMonth(), day);
              const key = toDayKey(d);
              const n = (byDay.get(key) ?? []).length;
              const isSelected = sameDay(d, selected);
              const isToday = sameDay(d, new Date());
              return (
                <button
                  key={key}
                  onClick={() => setSelected(d)}
                  className={`h-14 rounded-2xl border transition-colors text-left px-3 py-2 flex flex-col justify-between ${
                    isSelected
                      ? "bg-white text-black border-white"
                      : isToday
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <div className={`text-sm font-semibold ${isSelected ? "text-black" : "text-white"}`}>{day}</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(4, n) }).map((__, idx) => (
                      <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? "bg-black/60" : "bg-white/50"}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 md:p-6 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">{selected.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" })}</div>
              <div className="text-sm text-white/40">{selectedTasks.length} tareas</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <ListChecks size={18} className="text-white/80" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
            <Plus size={16} className="text-white/50" />
            <input
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") quickAdd();
              }}
              placeholder="Añadir tarea a este día..."
              className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/25"
            />
          </div>

          <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-2" onPointerDown={(e) => e.stopPropagation()}>
            {selectedTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/25 text-sm">Sin tareas</div>
            ) : (
              selectedTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                    <div className="text-[11px] text-white/40">{t.status} · {t.priority}</div>
                  </div>
                  <button
                    onClick={() => updateTask(t.id, { status: t.status === "done" ? "backlog" : "done" })}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-colors ${t.status === "done" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"}`}
                  >
                    {t.status === "done" ? "Hecho" : "Marcar"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
