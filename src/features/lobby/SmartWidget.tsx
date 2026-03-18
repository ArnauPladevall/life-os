"use client";

import { Maximize2, Palette, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getWidgetDefinition, WIDGET_TONE_CLASSES } from "./widgetRegistry";
import type { LobbyWidget } from "./types";

interface Props {
  widget: LobbyWidget;
  isEditing: boolean;
  onOpenColor: (e: React.MouseEvent) => void;
  onOpenSize: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onExpand: () => void;
}

export function SmartWidget({
  widget,
  isEditing,
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
  const isPreviewLauncher = widget.type === "recipes" && definition.expandable && !isEditing;

  return (
    <div
      className={`group relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 ${toneClass} shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_40%)]" />
      <div className="relative z-10 flex h-full w-full flex-col p-4 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-white">{definition.name}</div>
            <div className="mt-1 line-clamp-1 text-xs text-white/45">{definition.description}</div>
          </div>

          {!isEditing && definition.expandable && (
            <button
              onClick={onExpand}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/70 transition hover:bg-white/[0.1] hover:text-white"
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>

        <div
          className={`min-h-0 flex-1 ${isPreviewLauncher ? "cursor-pointer" : ""}`}
          onClick={isPreviewLauncher ? onExpand : undefined}
        >
          {definition.renderPreview(widget)}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-black/35 backdrop-blur-[2px]"
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onOpenSize}
              className="rounded-full border border-white/10 bg-white/90 p-3 text-black shadow-lg transition hover:scale-105 active:scale-95"
              title="Cambiar tamaño"
            >
              <Maximize2 size={18} />
            </button>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onOpenColor}
              className="rounded-full border border-white/10 bg-white/90 p-3 text-black shadow-lg transition hover:scale-105 active:scale-95"
              title="Cambiar estilo"
            >
              <Palette size={18} />
            </button>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              className="rounded-full border border-red-400/20 bg-red-500/90 p-3 text-white shadow-lg transition hover:scale-105 active:scale-95"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}