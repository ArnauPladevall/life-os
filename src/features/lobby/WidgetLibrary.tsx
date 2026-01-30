"use client";
import { motion } from "framer-motion";
import { Search, X, Plus } from "lucide-react";
import { useState } from "react";

import type { WidgetSize } from "./SmartWidget";

const WIDGET_TYPES: { id: string; name: string; desc: string; recommended: WidgetSize }[] = [
  { id: "clock", name: "Reloj", desc: "Hora en vivo", recommended: "2x1" },
  { id: "date", name: "Fecha", desc: "Hoy, bonito", recommended: "2x1" },
  { id: "weather", name: "Clima", desc: "Temperatura local", recommended: "2x2" },
  { id: "calendar", name: "Calendario", desc: "Mes + tareas", recommended: "2x2" },
  { id: "notes", name: "Notas rápidas", desc: "Auto-guardado", recommended: "2x2" },
  { id: "pomodoro", name: "Pomodoro", desc: "50 / 10", recommended: "2x2" },
  { id: "tasks", name: "Tareas", desc: "Lista + focus", recommended: "2x2" },
  { id: "focus", name: "Focus", desc: "Top 3 + progreso", recommended: "2x2" },
  { id: "budget", name: "Presupuesto", desc: "Mes + historial", recommended: "4x2" },
  { id: "quote", name: "Frase del día", desc: "Random diaria", recommended: "2x1" },
];

const SIZE_PRESETS: { id: WidgetSize; label: string }[] = [
  { id: "1x1", label: "S" },
  { id: "2x1", label: "M" },
  { id: "2x2", label: "L" },
  { id: "4x2", label: "XL" },
];

export function WidgetLibrary({ onClose, onAdd }: { onClose: () => void; onAdd: (type: string, size: WidgetSize) => void }) {
  const [search, setSearch] = useState("");

  const filtered = WIDGET_TYPES.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#121212] border-l border-white/10 z-[70] p-6 shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Biblioteca</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar widget..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-white/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filtered.map(w => (
            <div key={w.id} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white mb-1">{w.name}</div>
                  <div className="text-xs text-gray-500">{w.desc}</div>
                </div>
                <button
                  onClick={() => onAdd(w.id, w.recommended)}
                  className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/15 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[10px] text-white/35 uppercase tracking-widest">Tamaño</div>
                <div className="flex items-center gap-1">
                  {SIZE_PRESETS.map((s) => {
                    const isRec = s.id === w.recommended;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onAdd(w.id, s.id)}
                        className={`h-7 w-9 rounded-full border text-[10px] font-bold transition-colors ${isRec ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
                        title={s.id}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}