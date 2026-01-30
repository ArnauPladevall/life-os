"use client";

import { Target, Pin, PinOff, CheckCircle2, Circle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "@/context/TasksContext";
import { loadFocusIds, saveFocusIds } from "./focusStorage";
import { createClient } from "@/lib/supabase";
import { fetchWidgetsState, mergeSaveWidgetsState } from "@/lib/widgetsState";

export default function FocusApp() {
  const { tasks, updateTask } = useTasks();
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<string[]>(() => loadFocusIds());

  useEffect(() => {
    const supabase = createClient();
    fetchWidgetsState(supabase)
      .then((s) => {
        if (Array.isArray(s?.focusIds)) setPinned(s!.focusIds!);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    saveFocusIds(pinned);
    const supabase = createClient();
    const id = window.setTimeout(() => {
      mergeSaveWidgetsState(supabase, { focusIds: pinned }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(id);
  }, [pinned]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = tasks.filter((t) => t.status !== "done");
    if (!q) return base;
    return base.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, query]);

  const pinnedTasks = pinned.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as typeof tasks;
  const progress = pinnedTasks.length === 0 ? 0 : (pinnedTasks.filter((t) => t.status === "done").length / pinnedTasks.length) * 100;

  const togglePin = (id: string) => {
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 5)));
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Target size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Focus</div>
            <div className="text-sm text-white/40">Pinea hasta 5 tareas · progreso {Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="glass-panel rounded-3xl p-5 md:p-6 border border-white/10 lg:col-span-1">
          <div className="text-lg font-semibold text-white">Pinned</div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-white/20" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <div className="mt-4 space-y-2">
            {pinnedTasks.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-sm">No hay tareas fijadas.</div>
            ) : (
              pinnedTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => updateTask(t.id, { status: t.status === "done" ? "backlog" : "done" })}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {t.status === "done" ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${t.status === "done" ? "text-white/45 line-through" : "text-white"}`}>{t.title}</div>
                    <div className="text-[11px] text-white/35">{t.priority}</div>
                  </div>
                  <button
                    onClick={() => togglePin(t.id)}
                    className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <PinOff size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 md:p-6 border border-white/10 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Backlog</div>
              <div className="text-sm text-white/40">Encuentra y fija lo importante</div>
            </div>
            <div className="w-72 max-w-full rounded-2xl bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-2">
              <Search size={16} className="text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/25"
              />
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-2" onPointerDown={(e) => e.stopPropagation()}>
            {filtered.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-sm">Nada por aquí.</div>
            ) : (
              filtered.map((t) => {
                const isPinned = pinned.includes(t.id);
                return (
                  <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                      <div className="text-[11px] text-white/35">{t.status} · {t.priority}</div>
                    </div>
                    <button
                      onClick={() => togglePin(t.id)}
                      className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 ${isPinned ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"}`}
                    >
                      <Pin size={14} />
                      {isPinned ? "Pinned" : "Pin"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
