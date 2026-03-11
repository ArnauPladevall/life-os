"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  Check,
  GripHorizontal,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { AnimatePresence, PanInfo, motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { SortableWidget } from "./SortableWidget";
import { SmartWidget } from "./SmartWidget";
import { SettingsPanel } from "./SettingsPanel";
import { WidgetLibrary } from "./WidgetLibrary";
import {
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_DEFINITIONS,
  WIDGET_TONE_CLASSES,
  getWidgetDefinition,
} from "./widgetRegistry";
import type { LobbyWidget, Preferences, WidgetSize, WidgetTone } from "./types";

const DEFAULT_PREFERENCES: Preferences = {
  showHeader: true,
  bgId: "aurora",
  customTitle: "Life OS",
  emoji: "💻",
  emojiPosition: "inline",
  titleAlign: "center",
};

const SIZE_LABELS: Record<WidgetSize, string> = {
  "1x1": "Tiny",
  "2x1": "Wide S",
  "2x2": "Square",
  "4x2": "Wide L",
};

const TONE_LABELS: Record<WidgetTone, string> = {
  neutral: "Neutral",
  violet: "Violet",
  blue: "Blue",
  emerald: "Emerald",
  amber: "Amber",
  rose: "Rose",
};

function createWidgetInstance(type: string): LobbyWidget | null {
  const definition = getWidgetDefinition(type);
  if (!definition) return null;

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${type}-${Date.now()}`,
    type,
    size: definition.defaultSize,
    tone: definition.defaultTone,
  };
}

function sanitizeWidgets(input: unknown): LobbyWidget[] {
  if (!Array.isArray(input)) return DEFAULT_WIDGET_LAYOUT;

  const validTypes = new Set(WIDGET_DEFINITIONS.map((definition) => definition.type));
  const validTones = new Set<WidgetTone>(["neutral", "violet", "blue", "emerald", "amber", "rose"]);
  const validSizes = new Set<WidgetSize>(["1x1", "2x1", "2x2", "4x2"]);

  const sanitized = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const widget = item as Partial<LobbyWidget>;

      if (
        typeof widget.id !== "string" ||
        typeof widget.type !== "string" ||
        !validTypes.has(widget.type)
      ) {
        return null;
      }

      const definition = getWidgetDefinition(widget.type);
      if (!definition) return null;

      const size =
        typeof widget.size === "string" &&
        validSizes.has(widget.size as WidgetSize) &&
        definition.supportedSizes.includes(widget.size as WidgetSize)
          ? (widget.size as WidgetSize)
          : definition.defaultSize;

      const tone =
        typeof widget.tone === "string" && validTones.has(widget.tone as WidgetTone)
          ? (widget.tone as WidgetTone)
          : definition.defaultTone;

      return {
        id: widget.id,
        type: widget.type,
        size,
        tone,
      };
    })
    .filter(Boolean) as LobbyWidget[];

  return sanitized;
}

function sanitizePreferences(input: unknown): Preferences {
  if (!input || typeof input !== "object") return DEFAULT_PREFERENCES;

  const prefs = input as Partial<Preferences>;

  return {
    showHeader: typeof prefs.showHeader === "boolean" ? prefs.showHeader : true,
    bgId: typeof prefs.bgId === "string" ? prefs.bgId : "aurora",
    customTitle: typeof prefs.customTitle === "string" ? prefs.customTitle : "Life OS",
    emoji: typeof prefs.emoji === "string" ? prefs.emoji : "💻",
    emojiPosition: prefs.emojiPosition === "top" ? "top" : "inline",
    titleAlign: prefs.titleAlign === "left" ? "left" : "center",
  };
}

function getSizeClass(size: WidgetSize) {
  switch (size) {
    case "1x1":
      return "col-span-1 aspect-square";
    case "2x1":
      return "col-span-1 md:col-span-2 aspect-[2/1]";
    case "2x2":
      return "col-span-1 md:col-span-2 row-span-2 aspect-square";
    case "4x2":
      return "col-span-2 md:col-span-4 aspect-[2/1] md:aspect-[4/1]";
    default:
      return "col-span-1";
  }
}

function getBackgroundClass(bgId: string) {
  switch (bgId) {
    case "midnight":
      return "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_30%),linear-gradient(180deg,#04101d_0%,#020407_100%)]";
    case "slate":
      return "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_28%),linear-gradient(180deg,#0a0d12_0%,#050507_100%)]";
    case "aurora":
    default:
      return "bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_55%_72%,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,#06070b_0%,#040507_100%)]";
  }
}

export default function LobbyGrid() {
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState<LobbyWidget[]>(DEFAULT_WIDGET_LAYOUT);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [floatingMenu, setFloatingMenu] = useState<{
    type: "color" | "size" | null;
    widgetId: string | null;
    x: number;
    y: number;
  }>({ type: null, widgetId: null, x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = () =>
      setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });

    if (floatingMenu.type) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [floatingMenu.type]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("layout, preferences")
        .eq("id", user.id)
        .maybeSingle();

      if (!data) {
        setWidgets(DEFAULT_WIDGET_LAYOUT);
        setPreferences(DEFAULT_PREFERENCES);
        return;
      }

      setWidgets(sanitizeWidgets(data.layout));
      setPreferences(sanitizePreferences(data.preferences));
    };

    load();
  }, [supabase]);

  const expandedWidget = useMemo(() => {
    return widgets.find((widget) => widget.id === expandedWidgetId) ?? null;
  }, [expandedWidgetId, widgets]);

  const handleSave = async (
    nextWidgets: LobbyWidget[] = widgets,
    nextPreferences: Preferences = preferences
  ) => {
    setIsSaving(true);
    setWidgets(nextWidgets);
    setPreferences(nextPreferences);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        layout: nextWidgets,
        preferences: nextPreferences,
      });
    }

    setIsSaving(false);
  };

  const handleUpdateWidget = (id: string, updates: Partial<LobbyWidget>) => {
    setWidgets((current) =>
      current.map((widget) => (widget.id === id ? { ...widget, ...updates } : widget))
    );
    setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
    if (expandedWidgetId === id) {
      setExpandedWidgetId(null);
    }
  };

  const handleAddWidget = (type: string) => {
    const widget = createWidgetInstance(type);
    if (!widget) return;

    const next = [...widgets, widget];
    setWidgets(next);
    setShowLibrary(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setWidgets((items) => {
      const oldIndex = items.findIndex((widget) => widget.id === active.id);
      const newIndex = items.findIndex((widget) => widget.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleTitleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const draggedLeft = info.offset.x < -80;
    const draggedRight = info.offset.x > 80;

    let nextAlign = preferences.titleAlign;

    if (draggedLeft) nextAlign = "left";
    if (draggedRight) nextAlign = "center";

    if (nextAlign !== preferences.titleAlign) {
      handleSave(widgets, { ...preferences, titleAlign: nextAlign });
    }
  };

  const openFloatingMenu = (
    e: React.PointerEvent,
    type: "color" | "size",
    widgetId: string
  ) => {
    e.stopPropagation();
    setFloatingMenu({
      type,
      widgetId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={`fixed inset-0 -z-20 transition-colors duration-700 ${getBackgroundClass(preferences.bgId)}`} />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <AnimatePresence>
        {preferences.showHeader && (
          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-6 pt-10 md:px-8">
            <motion.div
              layout
              className={`flex ${preferences.titleAlign === "left" ? "justify-start" : "justify-center"}`}
            >
              <motion.div
                drag={isEditing ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.14}
                dragSnapToOrigin
                onDragEnd={handleTitleDragEnd}
                whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                className={`${
                  isEditing
                    ? "cursor-grab rounded-[1.6rem] border border-white/10 bg-white/[0.04]"
                    : ""
                } group relative px-4 py-3 transition-all duration-300`}
              >
                <div
                  className={`${
                    preferences.emojiPosition === "inline"
                      ? "flex items-center gap-3"
                      : "text-center"
                  }`}
                >
                  <div className={`${preferences.emojiPosition === "inline" ? "text-3xl" : "mb-2 text-5xl"}`}>
                    {preferences.emoji || "💻"}
                  </div>

                  <div className={preferences.emojiPosition === "inline" ? "" : "text-center"}>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/28">
                      Personal lobby
                    </div>
                    <h1 className="select-none text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
                      {preferences.customTitle || "Life OS"}
                    </h1>
                  </div>
                </div>

                {isEditing && (
                  <div className="pointer-events-none absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#0b0c10]/90 px-3 py-1.5 text-[11px] text-white/50 backdrop-blur-xl">
                    <GripHorizontal size={12} />
                    Desliza para alinear
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto mt-2 w-full max-w-[1600px] px-4 pb-40 md:px-8">
        {widgets.length === 0 && !isEditing && (
          <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-white/8 bg-black/20 px-8 py-24 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.04]">
              <LayoutGrid size={28} className="text-white/45" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Tu espacio está listo</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
              Base limpia, persistente y preparada para crecer. Desde aquí ya puedes empezar a registrar
              tus widgets y construir el flujo que quieras.
            </p>
          </div>
        )}

        {widgets.length === 0 && isEditing && (
          <div className="mx-auto mb-8 max-w-6xl rounded-[2.25rem] border border-dashed border-white/10 bg-black/18 px-8 py-20 text-center backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.04]">
              <LayoutGrid size={24} className="text-white/40" />
            </div>
            <div className="text-xl font-semibold tracking-tight text-white">Sin widgets aún</div>
            <div className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
              La estructura ya está preparada. Cuando registres widgets en el sistema aparecerán aquí y
              también en la biblioteca.
            </div>
          </div>
        )}

        <AnimatePresence>
          {showLibrary && <WidgetLibrary onClose={() => setShowLibrary(false)} onAdd={handleAddWidget} />}
          {showSettings && (
            <SettingsPanel
              onClose={() => setShowSettings(false)}
              preferences={preferences}
              onUpdatePref={(nextPreferences) => handleSave(widgets, nextPreferences)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {floatingMenu.type && floatingMenu.widgetId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed z-[120] min-w-[220px] rounded-[1.5rem] border border-white/10 bg-[#0d0d10]/95 p-3 shadow-2xl backdrop-blur-xl"
              style={{ left: floatingMenu.x, top: floatingMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.24em] text-white/35">
                {floatingMenu.type === "size" ? "Tamaño" : "Estilo"}
              </div>

              <div className="grid gap-2">
                {floatingMenu.type === "size" &&
                  (() => {
                    const widget = widgets.find((item) => item.id === floatingMenu.widgetId);
                    const definition = widget ? getWidgetDefinition(widget.type) : undefined;
                    if (!widget || !definition) return null;

                    return definition.supportedSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleUpdateWidget(widget.id, { size })}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                          widget.size === size
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span>{SIZE_LABELS[size]}</span>
                        <span className="text-xs">{size}</span>
                      </button>
                    ));
                  })()}

                {floatingMenu.type === "color" &&
                  (Object.keys(WIDGET_TONE_CLASSES) as WidgetTone[]).map((tone) => {
                    const widget = widgets.find((item) => item.id === floatingMenu.widgetId);
                    if (!widget) return null;

                    return (
                      <button
                        key={tone}
                        onClick={() => handleUpdateWidget(widget.id, { tone })}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                          widget.tone === tone
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span>{TONE_LABELS[tone]}</span>
                        <span className="text-xs">{tone}</span>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-8 left-1/2 z-[130] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0c0d11]/88 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-full p-3 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <SettingsIcon size={20} />
          </button>

          <div className="mx-1 h-6 w-px bg-white/10" />

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
            >
              <Pencil size={18} />
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowLibrary(true)}
                className="rounded-full bg-white p-3 text-black transition hover:bg-white/90"
              >
                <Plus size={22} />
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  handleSave();
                }}
                className="rounded-full bg-emerald-500 p-3 text-white transition hover:bg-emerald-400"
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Check size={22} />}
              </button>
            </>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map((widget) => widget.id)} strategy={rectSortingStrategy}>
            <div className="grid auto-rows-min grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
              {widgets.map((widget) => (
                <div key={widget.id} className={getSizeClass(widget.size)}>
                  <SortableWidget id={widget.id} isEditing={isEditing}>
                    <SmartWidget
                      widget={widget}
                      isEditing={isEditing}
                      onOpenColor={(e) => openFloatingMenu(e, "color", widget.id)}
                      onOpenSize={(e) => openFloatingMenu(e, "size", widget.id)}
                      onRemove={() => handleRemoveWidget(widget.id)}
                      onExpand={() => {
                        const definition = getWidgetDefinition(widget.type);
                        if (definition?.expandable) {
                          setExpandedWidgetId(widget.id);
                        }
                      }}
                    />
                  </SortableWidget>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <AnimatePresence>
        {expandedWidget && getWidgetDefinition(expandedWidget.type)?.expandable && (
          <motion.div
            className="fixed inset-0 z-[180] p-4 md:p-8"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setExpandedWidgetId(null)} />

            <motion.div
              layoutId={`widget-expanded-${expandedWidget.id}`}
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center justify-center"
            >
              <div className="relative h-full w-full max-h-[88vh]">
                <button
                  onClick={() => setExpandedWidgetId(null)}
                  className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-xl transition hover:text-white"
                >
                  <X size={18} />
                </button>

                {getWidgetDefinition(expandedWidget.type)?.renderExpanded?.(expandedWidget)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
