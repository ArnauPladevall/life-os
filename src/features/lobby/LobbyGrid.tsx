"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Check, Plus, Loader2, LayoutGrid, Settings as SettingsIcon, AppWindow, Briefcase, Terminal, Coffee, Home, Zap, Monitor, NotebookText, CalendarDays, CloudSun, Clock3, Timer, Target, Wallet, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useLocale } from "@/context/LocaleContext";

import { SortableWidget } from "./SortableWidget";
import { SmartWidget, WidgetSize } from "./SmartWidget";
import { WidgetLibrary } from "./WidgetLibrary";
import { SettingsPanel } from "./SettingsPanel";
import { OSWindow } from "@/components/OSWindow";
import { TasksProvider } from "@/context/TasksContext";
import TasksWidget from "@/features/tasks/TasksWidget";
import TasksApp from "@/features/tasks/TasksApp";
import PomodoroWidget from "@/features/pomodoro/PomodoroWidget";
import PomodoroApp from "@/features/pomodoro/PomodoroApp";
import WeatherWidget from "@/features/weather/WeatherWidget";
import WeatherApp from "@/features/weather/WeatherApp";
import CalendarWidget from "@/features/calendar/CalendarWidget";
import CalendarApp from "@/features/calendar/CalendarApp";
import QuickNotesWidget from "@/features/notes/QuickNotesWidget";
import QuickNotesApp from "@/features/notes/QuickNotesApp";
import ClockWidget from "@/features/clock/ClockWidget";
import ClockApp from "@/features/clock/ClockApp";
import DateWidget from "@/features/date/DateWidget";
import DateApp from "@/features/date/DateApp";
import FocusWidget from "@/features/focus/FocusWidget";
import FocusApp from "@/features/focus/FocusApp";
import BudgetWidget from "@/features/budget/BudgetWidget";
import BudgetApp from "@/features/budget/BudgetApp";
import QuoteWidget from "@/features/quote/QuoteWidget";
import QuoteApp from "@/features/quote/QuoteApp";

interface WidgetData { id: string; type: string; size: WidgetSize; color: string; }
interface Preferences { showHeader: boolean; bgId: string; customTitle?: string; iconId?: string; titleAlign?: 'center' | 'left'; }

const COLORS = [
  { name: "Void", class: "bg-[#0A0A0A]" },
  { name: "Glass", class: "bg-white/[0.03]" },
  { name: "Navy", class: "bg-blue-950/20" },
];

const SIZES: { id: WidgetSize, label: string }[] = [
  { id: "1x1", label: "S" }, { id: "2x1", label: "M" }, { id: "2x2", label: "L" }, { id: "4x2", label: "XL" },
];

export default function LobbyGrid() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeApp, setActiveApp] = useState<{ id: string; originRect: DOMRect | null } | null>(null);
  const [floatingMenu, setFloatingMenu] = useState<{ type: 'color' | 'size' | null; widgetId: string | null; x: number; y: number; }>({ type: null, widgetId: null, x: 0, y: 0 });
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({ showHeader: true, bgId: 'default', customTitle: 'LifeOS', iconId: 'terminal', titleAlign: 'center' });
  const { t } = useLocale();
  
  const supabase = createClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    const handleClickOutside = () => setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
    if (floatingMenu.type) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [floatingMenu.type]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('layout, preferences').eq('id', user.id).maybeSingle();
        if (data) {
            setWidgets(Array.isArray(data.layout) ? data.layout : []);
            if(data.preferences) setPreferences(data.preferences as Preferences);        }
      }
    };
    load();
  }, []);

  const handleSave = async (newWidgets = widgets, newPrefs = preferences) => {
    setIsSaving(true);
    setWidgets(newWidgets);
    setPreferences(newPrefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').upsert({ id: user.id, layout: newWidgets, preferences: newPrefs, email: user.email });
    setIsSaving(false);
  };

  const handleUpdateWidget = (id: string, updates: Partial<WidgetData>) => {
    const updated = widgets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWidgets(updated);
    setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
  };

  const handleRemoveWidget = (id: string) => {
    const newWidgets = widgets.filter(w => w.id !== id);
    setWidgets(newWidgets);
    setFloatingMenu({ type: null, widgetId: null, x: 0, y: 0 });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(w => w.id === active.id);
        const newIndex = items.findIndex(w => w.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getBgClass = () => {
    switch(preferences.bgId) {
      case 'aurora': return "bg-gradient-to-br from-gray-900 via-purple-900/20 to-black";
      case 'midnight': return "bg-gradient-to-b from-blue-950/30 to-black";
      case 'forest': return "bg-gradient-to-br from-green-950/30 to-black";
      default: return "bg-[#050505]"; 
    }
  };

  const getIcon = () => {
    switch(preferences.iconId) {
      case 'briefcase': return <Briefcase size={32} className="text-blue-400"/>;
      case 'coffee': return <Coffee size={32} className="text-orange-400"/>;
      case 'home': return <Home size={32} className="text-green-400"/>;
      case 'zap': return <Zap size={32} className="text-yellow-400"/>;
      case 'monitor': return <Monitor size={32} className="text-purple-400"/>;
      default: return <Terminal size={32} className="text-gray-400"/>;
    }
  };

  const getSizeClass = (size: WidgetSize) => {
    switch (size) {
      case "1x1": return "col-span-1 row-span-1";
      case "2x1": return "col-span-2 row-span-1";
      case "2x2": return "col-span-2 row-span-2";
      case "4x2": return "col-span-2 md:col-span-4 row-span-2";
      default: return "col-span-1";
    }
  };

  const openFloatingMenu = (e: React.PointerEvent, type: 'color' | 'size', widgetId: string) => { e.stopPropagation(); setFloatingMenu({ type, widgetId, x: e.clientX, y: e.clientY }); };

  const openApp = (id: string, rect: DOMRect) => setActiveApp({ id, originRect: rect });

  return (
    <TasksProvider>
      {/* Contenedor principal con Scroll Habilitado */}
      <div className="h-screen w-full relative isolate overflow-y-auto overflow-x-hidden bg-[#050505] text-white">
        
        {/* Fondo Fijo */}
        <div className={`fixed inset-0 -z-20 transition-colors duration-1000 ${getBgClass()}`} />
        <div className="bg-noise" />
        
        {/* App Windows */}
        <AnimatePresence>
          {activeApp?.id === 'tasks' && (
             <OSWindow title={t('app_tasks_full')} icon={<AppWindow size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <TasksApp />
             </OSWindow>
          )}
          {activeApp?.id === 'notes' && (
             <OSWindow title={t('app_notes_quick')} icon={<NotebookText size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <QuickNotesApp />
             </OSWindow>
          )}
          {activeApp?.id === 'calendar' && (
             <OSWindow title={t('app_calendar')} icon={<CalendarDays size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <CalendarApp />
             </OSWindow>
          )}
          {activeApp?.id === 'weather' && (
             <OSWindow title={t('app_weather')} icon={<CloudSun size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <WeatherApp />
             </OSWindow>
          )}
          {activeApp?.id === 'pomodoro' && (
             <OSWindow title={t('app_pomodoro')} icon={<Timer size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <PomodoroApp />
             </OSWindow>
          )}
          {activeApp?.id === 'clock' && (
             <OSWindow title={t('app_clock')} icon={<Clock3 size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <ClockApp />
             </OSWindow>
          )}
          {activeApp?.id === 'date' && (
             <OSWindow title={t('app_date')} icon={<CalendarDays size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <DateApp />
             </OSWindow>
          )}
          {activeApp?.id === 'focus' && (
             <OSWindow title={t('app_focus')} icon={<Target size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <FocusApp />
             </OSWindow>
          )}
          {activeApp?.id === 'budget' && (
             <OSWindow title={t('app_budget')} icon={<Wallet size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <BudgetApp />
             </OSWindow>
          )}
          {activeApp?.id === 'quote' && (
             <OSWindow title={t('app_quote')} icon={<Quote size={16} className="text-white"/>} onClose={() => setActiveApp(null)} originRect={activeApp.originRect}>
                <QuoteApp />
             </OSWindow>
          )}
        </AnimatePresence>

        {/* Header */}
        {preferences.showHeader && (
            <div className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-20 pb-6 md:pb-10 relative z-10 flex items-center gap-4 ${preferences.titleAlign === 'left' ? 'justify-start' : 'justify-center'}`}>
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-xl backdrop-blur-sm">
                 {getIcon()}
               </div>
               <h1 className="text-4xl font-bold tracking-tight text-white">{preferences.customTitle}</h1>
            </div>
        )}

        {/* Grid Container */}
        <div className="w-full max-w-[1600px] mx-auto relative pb-40 px-4 md:px-8">
          
          {widgets.length === 0 && !isEditing && (
            <div className="flex flex-col items-center justify-center opacity-30 py-32 select-none">
              <LayoutGrid size={48} className="mb-4" />
              <h2 className="text-lg">{t('lobby_empty')}</h2>
            </div>
          )}

          {/* Modals */}
          <AnimatePresence>
            {showLibrary && (
              <WidgetLibrary
                onClose={() => setShowLibrary(false)}
                onAdd={(type, size) => {
                  handleSave(
                    [...widgets, { id: `${type}-${Date.now()}`, type, size, color: "bg-[#0A0A0A]" }],
                    preferences
                  );
                  setShowLibrary(false);
                }}
              />
            )}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} preferences={preferences} onUpdatePref={(p) => handleSave(widgets, p as any)} />}
          </AnimatePresence>

          {/* Menú Edición Widget */}
          <AnimatePresence>
            {floatingMenu.type && floatingMenu.widgetId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="fixed z-[200] p-1.5 glass-panel rounded-full flex gap-1 shadow-2xl"
                style={{ left: floatingMenu.x, top: floatingMenu.y, x: '-50%', y: '-130%' }}
                onClick={(e) => e.stopPropagation()}
              >
                {floatingMenu.type === 'color' && COLORS.map((c) => (
                  <button key={c.name} onClick={() => handleUpdateWidget(floatingMenu.widgetId!, { color: c.class })} className={`w-6 h-6 rounded-full ${c.class} ring-1 ring-white/20 hover:scale-110 transition-transform`} />
                ))}
                {floatingMenu.type === 'size' && SIZES.map((s) => (
                  <button key={s.id} onClick={() => handleUpdateWidget(floatingMenu.widgetId!, { size: s.id })} className="w-8 h-8 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 hover:bg-white/10 transition-colors">{s.label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dock */}
          <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[80] p-2 glass-panel rounded-full flex items-center gap-2 transition-transform hover:scale-[1.01]">
              <button onClick={() => setShowSettings(true)} className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><SettingsIcon size={20} /></button>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"><Pencil size={16} /> {t('common_edit')}</button>
              ) : (
                  <>
                      <button onClick={() => setShowLibrary(true)} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"><Plus size={20} /></button>
                      <button onClick={() => { setIsEditing(false); handleSave(); }} className="p-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20">{isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}</button>
                  </>
              )}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 auto-rows-[140px] md:auto-rows-[165px]">
                {widgets.map((widget) => (
                  <div key={widget.id} className={getSizeClass(widget.size)}>
                    <SortableWidget id={widget.id} isEditing={isEditing}>
                      <SmartWidget 
                        {...widget} 
                        isEditing={isEditing}
                        onOpenColor={(e) => openFloatingMenu(e, 'color', widget.id)}
                        onOpenSize={(e) => openFloatingMenu(e, 'size', widget.id)}
                        onRemove={() => handleRemoveWidget(widget.id)}
                        onOpenApp={(rect) => {
                          if (widget.type === 'tasks') openApp('tasks', rect);
                          if (widget.type === 'notes') openApp('notes', rect);
                          if (widget.type === 'calendar') openApp('calendar', rect);
                          if (widget.type === 'weather') openApp('weather', rect);
                          if (widget.type === 'pomodoro') openApp('pomodoro', rect);
                          if (widget.type === 'clock') openApp('clock', rect);
                          if (widget.type === 'date') openApp('date', rect);
                          if (widget.type === 'focus') openApp('focus', rect);
                          if (widget.type === 'budget') openApp('budget', rect);
                          if (widget.type === 'quote') openApp('quote', rect);
                        }}
                      >
                          {widget.type === 'tasks' ? <TasksWidget size={widget.size} /> : null}
                          {widget.type === 'notes' ? <QuickNotesWidget size={widget.size} /> : null}
                          {widget.type === 'calendar' ? <CalendarWidget size={widget.size} /> : null}
                          {widget.type === 'weather' ? <WeatherWidget size={widget.size} /> : null}
                          {widget.type === 'pomodoro' ? <PomodoroWidget size={widget.size} /> : null}
                          {widget.type === 'clock' ? <ClockWidget size={widget.size} /> : null}
                          {widget.type === 'date' ? <DateWidget size={widget.size} /> : null}
                          {widget.type === 'focus' ? <FocusWidget size={widget.size} /> : null}
                          {widget.type === 'budget' ? <BudgetWidget size={widget.size} /> : null}
                          {widget.type === 'quote' ? <QuoteWidget size={widget.size} /> : null}
                      </SmartWidget>
                    </SortableWidget>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </TasksProvider>
  );
}