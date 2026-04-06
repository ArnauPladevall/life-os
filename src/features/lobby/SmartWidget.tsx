"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Move, Palette, Settings2, Trash2 } from "lucide-react";
import { getWidgetDefinition, WIDGET_TONE_CLASSES } from "./widgetRegistry";
import type { LobbyWidget } from "./types";

interface Props {
  widget: LobbyWidget;
  isEditing: boolean;
  widgetState: unknown;
  onOpenApp: (type: string) => void;
  onSetWidgetState: (nextState: unknown) => void;
  onOpenColor: (e: React.MouseEvent) => void;
  onOpenSize: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onExpand: () => void;
}

export function SmartWidget({
  widget,
  isEditing,
  widgetState,
  onOpenApp,
  onSetWidgetState,
  onOpenColor,
  onOpenSize,
  onRemove,
  onExpand,
}: Props) {
  const definition = getWidgetDefinition(widget.type);

  if (!definition) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] text-sm text-white/45">
        Unknown widget: {widget.type}
      </div>
    );
  }

  const toneClass = WIDGET_TONE_CLASSES[widget.tone];

  return (
    <div
      role={!isEditing && definition.expandable ? "button" : undefined}
      tabIndex={!isEditing && definition.expandable ? 0 : -1}
      onClick={() => {
        if (!isEditing && definition.expandable) {
          onExpand();
        }
      }}
      onKeyDown={(e) => {
        if (!isEditing && definition.expandable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onExpand();
        }
      }}
      className={`group relative h-full w-full overflow-hidden rounded-[2rem] border border-white/8 ${toneClass} shadow-[0_20px_54px_rgba(0,0,0,0.26)] backdrop-blur-2xl transition-all duration-300 ${
        !isEditing && definition.expandable ? "cursor-pointer" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_44%)]" />

      <div className="relative z-10 h-full w-full p-4 md:p-5">
        {definition.renderPreview(widget, {
          openApp: onOpenApp,
          widgetState,
          setWidgetState: onSetWidgetState,
          isEditing,
        })}
      </div>

      {!isEditing && definition.expandable && (
        <div className="pointer-events-none absolute right-4 top-4 z-20 opacity-0 transition duration-200 group-hover:opacity-100">
          <div className="rounded-full border border-white/10 bg-black/24 p-2.5 text-white/68 backdrop-blur-xl">
            <Maximize2 size={15} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center gap-2 bg-black/38 backdrop-blur-[2px]"
          >
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <div className="rounded-full border border-white/10 bg-black/35 p-2 text-white/70">
                <Move size={16} />
              </div>
              <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/45">
                {definition.name}
              </div>
            </div>

            {definition.expandable && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onExpand}
                className="rounded-full border border-white/10 bg-white/90 p-3 text-black shadow-lg transition hover:scale-105 active:scale-95"
                title="Open widget"
              >
                <Settings2 size={18} />
              </button>
            )}

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onOpenSize}
              className="rounded-full border border-white/10 bg-white/90 p-3 text-black shadow-lg transition hover:scale-105 active:scale-95"
              title="Change size"
            >
              <Maximize2 size={18} />
            </button>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onOpenColor}
              className="rounded-full border border-white/10 bg-white/90 p-3 text-black shadow-lg transition hover:scale-105 active:scale-95"
              title="Change tone"
            >
              <Palette size={18} />
            </button>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              className="rounded-full border border-red-400/20 bg-red-500/90 p-3 text-white shadow-lg transition hover:scale-105 active:scale-95"
              title="Delete widget"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}