"use client";
import { useTasks } from "@/context/TasksContext";
import { Plus, CheckSquare, Circle } from "lucide-react";
import { useState, useMemo } from "react";
import { parseQuickTask } from "./taskParsing";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function TasksWidget({ size }: { size: WidgetSize }) {
  const { tasks, addTask, updateTask } = useTasks();
  const [quickTitle, setQuickTitle] = useState("");

  const smartTasks = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0,10);
    const notDone = tasks.filter(t => t.status !== 'done');
    const overdue = notDone.filter(t => (t as any).due_date && (t as any).due_date < todayIso);
    const dueToday = notDone.filter(t => (t as any).due_date === todayIso || t.status === 'today');
    const backlog = notDone.filter(t => !overdue.includes(t) && !dueToday.includes(t));
    return [...overdue, ...dueToday, ...backlog];
  }, [tasks]);

  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTitle.trim()) {
      addTask({ ...parseQuickTask(quickTitle), status: 'backlog' });
      setQuickTitle("");
    }
  };

  const take = size === "1x1" ? 2 : size === "2x1" ? 3 : size === "4x2" ? 8 : 5;
  const pendingTasks = smartTasks.slice(0, take);

  const compact = size === "1x1";

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
          <CheckSquare size={16} className="text-blue-400"/> Tareas
        </h3>
        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1" onPointerDown={(e) => e.stopPropagation()}>
        {pendingTasks.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-white/20">
               <span className="text-[10px] font-bold uppercase tracking-widest">Todo Listo</span>
           </div>
        ) : (
            pendingTasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: 'done' }); }} className="text-white/20 hover:text-blue-500 transition-colors">
                        <Circle size={14} />
                    </button>
                    <span className="text-xs truncate text-white/70 group-hover:text-white transition-colors">{task.title}</span>
                </div>
            ))
        )}
      </div>

      {!compact && (
      <div className="mt-2 pt-2 border-t border-white/5">
         <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1.5 focus-within:bg-white/10 transition-colors">
             <Plus size={12} className="text-white/40"/>
             <input 
                type="text" 
                placeholder="Añadir..." 
                className="bg-transparent outline-none text-xs text-white w-full placeholder:text-white/20"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                onKeyDown={handleQuickAdd}
                onPointerDown={(e) => e.stopPropagation()}
             />
         </div>
      </div>
      )}
    </div>
  );
}