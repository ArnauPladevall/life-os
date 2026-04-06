"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Check,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { SortableWidget } from "./SortableWidget";
import { SmartWidget } from "./SmartWidget";
import { SettingsPanel } from "./SettingsPanel";
import { WidgetLibrary } from "./WidgetLibrary";
import {
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_TONE_CLASSES,
  getAppDefinition,
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
  "1x1": "Small",
  "2x1": "Wide",
  "2x2": "Square",
  "4x2": "Large",
};

const TONE_LABELS: Record<WidgetTone, string> = {
  neutral: "Neutral",
  violet: "Violet",
  blue: "Blue",
  emerald: "Emerald",
  amber: "Amber",
  rose: "Rose",
};

const BOARD_COLUMNS = 6;
const BOARD_ROWS = 5;
const BOARD_GAP = 18;
const BOARD_ROW_HEIGHT = 154;

function parseDropCellId(id: string) {
  const [prefix, x, y] = id.split(":");

  if (prefix !== "cell") return null;

  const parsed = {
    x: Number(x),
    y: Number(y),
  };

  if (Number.isNaN(parsed.x) || Number.isNaN(parsed.y)) {
    return null;
  }

  return parsed;
}

function getWidgetSpan(size: WidgetSize) {
  switch (size) {
    case "1x1":
      return { w: 1, h: 1 };
    case "2x1":
      return { w: 2, h: 1 };
    case "2x2":
      return { w: 2, h: 2 };
    case "4x2":
      return { w: 4, h: 2 };
    default:
      return { w: 1, h: 1 };
  }
}

function rectanglesOverlap(a: LobbyWidget, b: LobbyWidget) {
  const aSpan = getWidgetSpan(a.size);
  const bSpan = getWidgetSpan(b.size);

  return !(
    a.x + aSpan.w <= b.x ||
    b.x + bSpan.w <= a.x ||
    a.y + aSpan.h <= b.y ||
    b.y + bSpan.h <= a.y
  );
}

function canPlaceWidget(widgets: LobbyWidget[], candidate: LobbyWidget, ignoreId?: string) {
  const span = getWidgetSpan(candidate.size);

  if (candidate.x < 0 || candidate.y < 0) return false;
  if (candidate.x + span.w > BOARD_COLUMNS) return false;
  if (candidate.y + span.h > BOARD_ROWS) return false;

  return widgets.every((widget) => {
    if (widget.id === ignoreId) return true;
    return !rectanglesOverlap(widget, candidate);
  });
}

function findFirstFit(widgets: LobbyWidget[], widget: Omit<LobbyWidget, "x" | "y">) {
  for (let y = 0; y < BOARD_ROWS; y += 1) {
    for (let x = 0; x < BOARD_COLUMNS; x += 1) {
      const candidate: LobbyWidget = { ...widget, page: 0, x, y };

      if (canPlaceWidget(widgets, candidate, widget.id)) {
        return candidate;
      }
    }
  }

  return { ...widget, page: 0, x: 0, y: 0 };
}

function flattenToSingleBoard(input: LobbyWidget[]) {
  const flattened: LobbyWidget[] = [];

  for (const widget of input) {
    const candidate: LobbyWidget = {
      ...widget,
      page: 0,
    };

    if (canPlaceWidget(flattened, candidate, candidate.id)) {
      flattened.push(candidate);
      continue;
    }

    flattened.push(
      findFirstFit(flattened, {
        id: candidate.id,
        type: candidate.type,
        size: candidate.size,
        tone: candidate.tone,
        page: 0,
      })
    );
  }

  return flattened;
}

function normalizeWidgets(input: unknown) {
  if (!Array.isArray(input)) return DEFAULT_WIDGET_LAYOUT;

  const normalized: LobbyWidget[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as Partial<LobbyWidget>;

    if (typeof candidate.id !== "string" || typeof candidate.type !== "string") continue;

    const definition = getWidgetDefinition(candidate.type);
    if (!definition) continue;

    const size =
      typeof candidate.size === "string" &&
      definition.supportedSizes.includes(candidate.size as WidgetSize)
        ? (candidate.size as WidgetSize)
        : definition.defaultSize;

    const tone =
      typeof candidate.tone === "string" && candidate.tone in WIDGET_TONE_CLASSES
        ? (candidate.tone as WidgetTone)
        : definition.defaultTone;

    normalized.push({
      id: candidate.id,
      type: candidate.type,
      size,
      tone,
      page: 0,
      x: typeof candidate.x === "number" ? Math.floor(candidate.x) : 0,
      y: typeof candidate.y === "number" ? Math.floor(candidate.y) : 0,
    });
  }

  return flattenToSingleBoard(normalized);
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

function sanitizeWidgetsState(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {} as Record<string, unknown>;
  }

  return input as Record<string, unknown>;
}

function createWidgetInstance(type: string, widgets: LobbyWidget[]): LobbyWidget | null {
  const definition = getWidgetDefinition(type);
  if (!definition) return null;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${type}-${Date.now()}`;

  return findFirstFit(widgets, {
    id,
    type,
    size: definition.defaultSize,
    tone: definition.defaultTone,
    page: 0,
  });
}

function getBackgroundClass(bgId: string) {
  switch (bgId) {
    case "midnight":
      return "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_28%),linear-gradient(180deg,#04070d_0%,#020306_100%)]";
    case "slate":
      return "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_24%),linear-gradient(180deg,#090b10_0%,#040507_100%)]";
    case "aurora":
    default:
      return "bg-[radial-gradient(circle_at_15%_18%,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(139,92,246,0.12),transparent_26%),radial-gradient(circle_at_55%_72%,rgba(16,185,129,0.08),transparent_26%),linear-gradient(180deg,#06070b_0%,#040507_100%)]";
  }
}

function CellDropZone({ id, isEditing }: { id: string; isEditing: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled: !isEditing });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-[1.35rem] border transition ${
        isOver ? "border-white/18 bg-white/[0.05]" : "border-transparent bg-transparent"
      }`}
    />
  );
}

export default function LobbyGrid() {
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState<LobbyWidget[]>(DEFAULT_WIDGET_LAYOUT);
  const [widgetsState, setWidgetsState] = useState<Record<string, unknown>>({});
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [expandedAppType, setExpandedAppType] = useState<string | null>(null);
  const [floatingMenu, setFloatingMenu] = useState<{
    type: "color" | "size" | null;
    widgetId: string | null;
    x: number;
    y: number;
  }>({ type: null, widgetId: null, x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = () => {
      setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
    };

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
        .select("layout, preferences, widgets_state")
        .eq("id", user.id)
        .maybeSingle();

      if (!data) {
        setWidgets(DEFAULT_WIDGET_LAYOUT);
        setPreferences(DEFAULT_PREFERENCES);
        setWidgetsState({});
        return;
      }

      setWidgets(normalizeWidgets(data.layout));
      setPreferences(sanitizePreferences(data.preferences));
      setWidgetsState(sanitizeWidgetsState(data.widgets_state));
    };

    load();
  }, [supabase]);

  const expandedWidget = useMemo(() => {
    return widgets.find((widget) => widget.id === expandedWidgetId) ?? null;
  }, [expandedWidgetId, widgets]);

  const expandedApp = useMemo(() => {
    return expandedAppType ? getAppDefinition(expandedAppType) ?? null : null;
  }, [expandedAppType]);

  const handleSave = async (
    nextWidgets: LobbyWidget[] = widgets,
    nextPreferences: Preferences = preferences,
    nextWidgetsState: Record<string, unknown> = widgetsState
  ) => {
    setIsSaving(true);
    setWidgets(nextWidgets);
    setPreferences(nextPreferences);
    setWidgetsState(nextWidgetsState);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        layout: nextWidgets,
        preferences: nextPreferences,
        widgets_state: nextWidgetsState,
      });
    }

    setIsSaving(false);
  };

  const saveSingleWidgetState = async (widgetId: string, nextState: unknown) => {
    const nextWidgetsState = {
      ...widgetsState,
      [widgetId]: nextState,
    };

    await handleSave(widgets, preferences, nextWidgetsState);
  };

  const handleUpdateWidget = (id: string, updates: Partial<LobbyWidget>) => {
    setWidgets((current) => {
      const next = flattenToSingleBoard(
        current.map((widget) =>
          widget.id === id ? { ...widget, ...updates, page: 0 } : widget
        )
      );

      return next;
    });

    setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));

    setWidgetsState((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    if (expandedWidgetId === id) {
      setExpandedWidgetId(null);
    }
  };

  const openApp = (type: string) => {
    setExpandedWidgetId(null);
    setExpandedAppType(type);
    setShowLibrary(false);
  };

  const handleAddWidget = (type: string) => {
    const widget = createWidgetInstance(type, widgets);
    if (!widget) return;

    setWidgets((current) => [...current, widget]);
    setShowLibrary(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;

    if (typeof overId !== "string") return;

    const target = parseDropCellId(overId);
    if (!target) return;

    setWidgets((current) => {
      const activeIndex = current.findIndex((widget) => widget.id === event.active.id);
      if (activeIndex === -1) return current;

      const activeWidget = current[activeIndex];

      const candidate: LobbyWidget = {
        ...activeWidget,
        page: 0,
        x: target.x,
        y: target.y,
      };

      if (!canPlaceWidget(current, candidate, activeWidget.id)) {
        return current;
      }

      const next = [...current];
      next[activeIndex] = candidate;
      return next;
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
      handleSave(widgets, { ...preferences, titleAlign: nextAlign }, widgetsState);
    }
  };

  const openFloatingMenu = (e: React.MouseEvent, type: "color" | "size", widgetId: string) => {
    e.stopPropagation();

    setFloatingMenu({
      type,
      widgetId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleResize = (widget: LobbyWidget, size: WidgetSize) => {
    const definition = getWidgetDefinition(widget.type);
    if (!definition || !definition.supportedSizes.includes(size)) return;

    const resizedCandidate: LobbyWidget = { ...widget, page: 0, size };

    if (canPlaceWidget(widgets, resizedCandidate, widget.id)) {
      handleUpdateWidget(widget.id, { size, page: 0 });
      return;
    }

    const relocated = findFirstFit(
      widgets.filter((entry) => entry.id !== widget.id),
      { ...widget, size, page: 0 }
    );

    setWidgets((current) => current.map((entry) => (entry.id === widget.id ? relocated : entry)));
    setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className={`fixed inset-0 -z-20 transition-colors duration-700 ${getBackgroundClass(
          preferences.bgId
        )}`}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-45 [mask-image:radial-gradient(circle_at_center,black,transparent_86%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <AnimatePresence>
        {preferences.showHeader && (
          <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-6 pt-10 md:px-8">
            <motion.div
              layout
              className={`flex ${
                preferences.titleAlign === "left" ? "justify-start" : "justify-center"
              }`}
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
                    ? "cursor-grab rounded-[1.5rem] border border-white/10 bg-white/[0.035]"
                    : ""
                } px-4 py-3 transition-all duration-300`}
              >
                <div
                  className={`${
                    preferences.emojiPosition === "inline"
                      ? "flex items-center gap-3"
                      : "text-center"
                  }`}
                >
                  <div
                    className={`${
                      preferences.emojiPosition === "inline"
                        ? "text-3xl"
                        : "mb-2 text-5xl"
                    }`}
                  >
                    {preferences.emoji || "💻"}
                  </div>

                  <div className={preferences.emojiPosition === "inline" ? "" : "text-center"}>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/24">
                      Personal board
                    </div>
                    <h1 className="select-none text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
                      {preferences.customTitle || "Life OS"}
                    </h1>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto mt-2 w-full max-w-[1500px] px-4 pb-36 md:px-8">
        {widgets.length === 0 && !isEditing && (
          <div className="mx-auto max-w-5xl rounded-[2.25rem] border border-white/8 bg-black/18 px-8 py-24 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.04]">
              <LayoutGrid size={28} className="text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Your board is ready</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">
              Keep only what helps at a glance. Widgets stay light, apps open fullscreen, and the board remains calm and easy to use.
            </p>
          </div>
        )}

        <AnimatePresence>
          {showLibrary && (
            <WidgetLibrary
              onClose={() => setShowLibrary(false)}
              onAddWidget={handleAddWidget}
              onOpenApp={openApp}
            />
          )}

          {showSettings && (
            <SettingsPanel
              onClose={() => setShowSettings(false)}
              preferences={preferences}
              onUpdatePref={(nextPreferences) =>
                handleSave(widgets, nextPreferences, widgetsState)
              }
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
                {floatingMenu.type === "size" ? "Size" : "Tone"}
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
                        type="button"
                        onClick={() => handleResize(widget, size)}
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
                        type="button"
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <section>
            <div
              className="relative overflow-hidden rounded-[2.35rem] border border-white/8 bg-black/18 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              style={{
                minHeight: BOARD_ROWS * BOARD_ROW_HEIGHT + (BOARD_ROWS - 1) * BOARD_GAP + 40,
              }}
            >
              <div
                className="relative"
                style={{
                  height: BOARD_ROWS * BOARD_ROW_HEIGHT + (BOARD_ROWS - 1) * BOARD_GAP,
                  ["--board-gap" as string]: `${BOARD_GAP}px`,
                  ["--board-cell-width" as string]: `calc((100% - ${
                    (BOARD_COLUMNS - 1) * BOARD_GAP
                  }px) / ${BOARD_COLUMNS})`,
                  ["--board-row-height" as string]: `${BOARD_ROW_HEIGHT}px`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-5 gap-[18px]">
                  {Array.from({ length: BOARD_COLUMNS * BOARD_ROWS }, (_, index) => (
                    <div
                      key={`grid-${index}`}
                      className={`rounded-[1.35rem] border ${
                        isEditing
                          ? "border-white/[0.045] bg-white/[0.012]"
                          : "border-transparent bg-transparent"
                      }`}
                    />
                  ))}
                </div>

                {isEditing && (
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-5 gap-[18px]">
                    {Array.from({ length: BOARD_COLUMNS * BOARD_ROWS }, (_, index) => {
                      const x = index % BOARD_COLUMNS;
                      const y = Math.floor(index / BOARD_COLUMNS);

                      return (
                        <CellDropZone
                          key={`drop-${x}-${y}`}
                          id={`cell:${x}:${y}`}
                          isEditing={isEditing}
                        />
                      );
                    })}
                  </div>
                )}

                {widgets.map((widget) => {
                  const span = getWidgetSpan(widget.size);

                  return (
                    <div
                      key={widget.id}
                      className="absolute"
                      style={{
                        left: `calc(${widget.x} * (var(--board-cell-width) + var(--board-gap)))`,
                        top: `calc(${widget.y} * (var(--board-row-height) + var(--board-gap)))`,
                        width: `calc(${span.w} * var(--board-cell-width) + ${
                          (span.w - 1) * BOARD_GAP
                        }px)`,
                        height: `calc(${span.h} * var(--board-row-height) + ${
                          (span.h - 1) * BOARD_GAP
                        }px)`,
                      }}
                    >
                      <SortableWidget id={widget.id} isEditing={isEditing}>
                        <SmartWidget
                          widget={widget}
                          isEditing={isEditing}
                          widgetState={widgetsState[widget.id]}
                          onOpenApp={openApp}
                          onSetWidgetState={(nextState) => {
                            setWidgetsState((current) => ({
                              ...current,
                              [widget.id]: nextState,
                            }));
                          }}
                          onOpenColor={(e) => openFloatingMenu(e, "color", widget.id)}
                          onOpenSize={(e) => openFloatingMenu(e, "size", widget.id)}
                          onRemove={() => handleRemoveWidget(widget.id)}
                          onExpand={() => {
                            const definition = getWidgetDefinition(widget.type);

                            if (definition?.expandable) {
                              setExpandedAppType(null);
                              setExpandedWidgetId(widget.id);
                            }
                          }}
                        />
                      </SortableWidget>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </DndContext>

        <div className="fixed bottom-8 left-1/2 z-[130] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0c0d11]/82 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-full p-3 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <SettingsIcon size={20} />
          </button>

          <div className="mx-1 h-6 w-px bg-white/10" />

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/92"
            >
              <Pencil size={18} />
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="rounded-full bg-white p-3 text-black transition hover:bg-white/92"
                aria-label="Open library"
              >
                <Plus size={22} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  handleSave(widgets, preferences, widgetsState);
                }}
                className="rounded-full bg-emerald-500 p-3 text-white transition hover:bg-emerald-400"
                aria-label="Save board"
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Check size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expandedWidget && getWidgetDefinition(expandedWidget.type)?.expandable && (
          <motion.div
            className="fixed inset-0 z-[180] p-4 md:p-8"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setExpandedWidgetId(null)}
            />

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
                  type="button"
                  onClick={() => setExpandedWidgetId(null)}
                  className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-xl transition hover:text-white"
                >
                  <X size={18} />
                </button>

                {getWidgetDefinition(expandedWidget.type)?.renderExpanded?.(expandedWidget, {
                  openApp,
                  widgetState: widgetsState[expandedWidget.id],
                  setWidgetState: (nextState) => {
                    void saveSingleWidgetState(expandedWidget.id, nextState);
                  },
                  isEditing,
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedApp && (
          <motion.div
            className="fixed inset-0 z-[190] p-4 md:p-8"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setExpandedAppType(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center justify-center"
            >
              <div className="relative h-full w-full max-h-[92vh]">
                <button
                  type="button"
                  onClick={() => setExpandedAppType(null)}
                  className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 p-3 text-white/70 backdrop-blur-xl transition hover:text-white"
                >
                  <X size={18} />
                </button>

                {expandedApp.renderApp()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}