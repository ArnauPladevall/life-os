"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { WIDGET_DEFINITIONS } from "./widgetRegistry";

export function WidgetLibrary({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (type: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return WIDGET_DEFINITIONS;

    return WIDGET_DEFINITIONS.filter((widget) => {
      return (
        widget.name.toLowerCase().includes(term) ||
        widget.description.toLowerCase().includes(term) ||
        widget.type.toLowerCase().includes(term)
      );
    });
  }, [search]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b0c10]/96 p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Biblioteca</h2>
            <p className="mt-1 text-sm text-white/40">Aquí aparecerán tus widgets registrados</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-white/20"
          />
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
              <div className="text-base font-semibold text-white">Sin widgets disponibles</div>
              <div className="mt-2 max-w-sm text-sm leading-6 text-white/45">
                La base está lista para producción. Cuando añadas widgets al registro, aparecerán aquí
                automáticamente.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => onAdd(widget.type)}
                  className="group flex w-full items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{widget.name}</div>
                    <div className="mt-1 text-xs text-white/45">{widget.description}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/25">
                      Sizes: {widget.supportedSizes.join(" · ")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
