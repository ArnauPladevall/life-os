"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { APP_DEFINITIONS, WIDGET_DEFINITIONS } from "./widgetRegistry";

interface Props {
  onClose: () => void;
  onAddWidget: (type: string) => void;
  onOpenApp: (type: string) => void;
}

export function WidgetLibrary({ onClose, onAddWidget, onOpenApp }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    const widgets = !term
      ? WIDGET_DEFINITIONS
      : WIDGET_DEFINITIONS.filter((entry) => {
          return (
            entry.name.toLowerCase().includes(term) ||
            entry.description.toLowerCase().includes(term) ||
            entry.type.toLowerCase().includes(term)
          );
        });

    const apps = !term
      ? APP_DEFINITIONS
      : APP_DEFINITIONS.filter((entry) => {
          return (
            entry.name.toLowerCase().includes(term) ||
            entry.description.toLowerCase().includes(term) ||
            entry.type.toLowerCase().includes(term)
          );
        });

    return { widgets, apps };
  }, [search]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/44 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b0c10]/96 p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Library</h2>
            <p className="mt-1 text-sm text-white/40">
              Widgets stay on the board. Apps open fullscreen.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/28" size={16} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/18"
          />
        </div>

        <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto pr-1">
          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/34">
              Widgets
            </div>

            <div className="space-y-3">
              {filtered.widgets.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                  <div className="text-base font-semibold text-white">No matching widgets</div>
                  <div className="mt-2 text-sm leading-6 text-white/42">
                    Register a widget definition and it will appear here automatically.
                  </div>
                </div>
              ) : (
                filtered.widgets.map((widget) => (
                  <button
                    key={widget.type}
                    type="button"
                    onClick={() => onAddWidget(widget.type)}
                    className="group flex w-full items-center gap-4 rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.055]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/10 bg-black/20 text-xl">
                      {widget.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{widget.name}</div>
                      <div className="mt-1 text-xs text-white/42">{widget.description}</div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/24">
                        {widget.supportedSizes.join(" · ")}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/34">
              Apps
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filtered.apps.length === 0 ? (
                <div className="col-span-2 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                  <div className="text-base font-semibold text-white">No matching apps</div>
                  <div className="mt-2 text-sm leading-6 text-white/42">
                    App-only experiences launch without creating a board widget.
                  </div>
                </div>
              ) : (
                filtered.apps.map((app) => (
                  <button
                    key={app.type}
                    type="button"
                    onClick={() => onOpenApp(app.type)}
                    className="group rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.055]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/10 bg-black/20 text-xl">
                      {app.icon}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{app.name}</div>
                    <div className="mt-1 text-xs text-white/40">Open app</div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}