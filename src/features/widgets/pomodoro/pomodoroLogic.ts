"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type PomodoroMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

export type PomodoroConfig = {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
};

export type PomodoroRuntimeState = {
  mode: PomodoroMode;
  remainingSeconds: number;
  isRunning: boolean;
  completedWorkCycles: number;
};

type PomodoroStoreEntry = {
  config: PomodoroConfig;
  state: PomodoroRuntimeState;
  listeners: Set<() => void>;
  intervalId: number | null;
  configLoaded: boolean;
  configLoading: boolean;
  configSaving: boolean;
};

export type PomodoroVisualTheme = {
  ringClassName: string;
  textClassName: string;
  badgeClassName: string;
  glowClassName: string;
  accentClassName: string;
};

const DEFAULT_CONFIG: PomodoroConfig = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

const LOCAL_STORAGE_KEY_PREFIX = "lifeos:pomodoro:config";

const store = new Map<string, PomodoroStoreEntry>();

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}

function getLocalStorageKey(userId: string) {
  return `${LOCAL_STORAGE_KEY_PREFIX}:${userId}`;
}

function clampConfig(config: PomodoroConfig): PomodoroConfig {
  return {
    workMinutes: Math.max(1, Math.min(180, Math.floor(config.workMinutes || DEFAULT_CONFIG.workMinutes))),
    breakMinutes: Math.max(1, Math.min(60, Math.floor(config.breakMinutes || DEFAULT_CONFIG.breakMinutes))),
    longBreakMinutes: Math.max(
      1,
      Math.min(120, Math.floor(config.longBreakMinutes || DEFAULT_CONFIG.longBreakMinutes))
    ),
    cyclesBeforeLongBreak: Math.max(
      2,
      Math.min(12, Math.floor(config.cyclesBeforeLongBreak || DEFAULT_CONFIG.cyclesBeforeLongBreak))
    ),
  };
}

function readLocalConfig(userId: string | null): PomodoroConfig | null {
  if (typeof window === "undefined" || !userId) return null;

  try {
    const raw = window.localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return clampConfig({
      workMinutes: Number(parsed.workMinutes ?? DEFAULT_CONFIG.workMinutes),
      breakMinutes: Number(parsed.breakMinutes ?? DEFAULT_CONFIG.breakMinutes),
      longBreakMinutes: Number(parsed.longBreakMinutes ?? DEFAULT_CONFIG.longBreakMinutes),
      cyclesBeforeLongBreak: Number(
        parsed.cyclesBeforeLongBreak ?? DEFAULT_CONFIG.cyclesBeforeLongBreak
      ),
    });
  } catch {
    return null;
  }
}

function writeLocalConfig(userId: string | null, config: PomodoroConfig) {
  if (typeof window === "undefined" || !userId) return;

  try {
    window.localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(config));
  } catch {}
}

async function resolveCurrentUserId(supabase: SupabaseClient | null): Promise<string | null> {
  if (!supabase) return null;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) return session.user.id;
  } catch {}

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) return user.id;
  } catch {}

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 150));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) return session.user.id;
  } catch {}

  return null;
}

function getDurationMinutesForMode(config: PomodoroConfig, mode: PomodoroMode) {
  if (mode === "WORK") return config.workMinutes;
  if (mode === "SHORT_BREAK") return config.breakMinutes;
  return config.longBreakMinutes;
}

function getDurationSecondsForMode(config: PomodoroConfig, mode: PomodoroMode) {
  return getDurationMinutesForMode(config, mode) * 60;
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getModeLabel(mode: PomodoroMode) {
  if (mode === "WORK") return "WORK";
  if (mode === "SHORT_BREAK") return "BREAK";
  return "LONG BREAK";
}

function getCycleLabel(state: PomodoroRuntimeState, config: PomodoroConfig) {
  const currentCycle = (state.completedWorkCycles % config.cyclesBeforeLongBreak) + 1;
  return `${currentCycle}/${config.cyclesBeforeLongBreak}`;
}

function cloneEntry(entry: PomodoroStoreEntry): PomodoroStoreEntry {
  return {
    ...entry,
    config: { ...entry.config },
    state: { ...entry.state },
    listeners: entry.listeners,
  };
}

function getOrCreateEntry(widgetId: string) {
  const existing = store.get(widgetId);
  if (existing) return existing;

  const entry: PomodoroStoreEntry = {
    config: { ...DEFAULT_CONFIG },
    state: {
      mode: "WORK",
      remainingSeconds: DEFAULT_CONFIG.workMinutes * 60,
      isRunning: false,
      completedWorkCycles: 0,
    },
    listeners: new Set(),
    intervalId: null,
    configLoaded: false,
    configLoading: false,
    configSaving: false,
  };

  store.set(widgetId, entry);
  return entry;
}

function notify(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry) return;
  entry.listeners.forEach((listener) => listener());
}

function stopInterval(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry || entry.intervalId === null) return;
  window.clearInterval(entry.intervalId);
  entry.intervalId = null;
}

function applyResetRuntime(entry: PomodoroStoreEntry, config: PomodoroConfig) {
  const next = cloneEntry(entry);
  next.config = config;
  next.state.mode = "WORK";
  next.state.remainingSeconds = getDurationSecondsForMode(config, "WORK");
  next.state.isRunning = false;
  next.state.completedWorkCycles = 0;
  return next;
}

function advancePhase(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry) return;

  const next = cloneEntry(entry);

  if (next.state.mode === "WORK") {
    next.state.completedWorkCycles += 1;

    const shouldUseLongBreak =
      next.state.completedWorkCycles % next.config.cyclesBeforeLongBreak === 0;

    next.state.mode = shouldUseLongBreak ? "LONG_BREAK" : "SHORT_BREAK";
    next.state.remainingSeconds = getDurationSecondsForMode(next.config, next.state.mode);
    next.state.isRunning = false;
  } else {
    next.state.mode = "WORK";
    next.state.remainingSeconds = getDurationSecondsForMode(next.config, "WORK");
    next.state.isRunning = false;
  }

  store.set(widgetId, next);
  stopInterval(widgetId);
  notify(widgetId);
}

function startInterval(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry || entry.intervalId !== null) return;

  entry.intervalId = window.setInterval(() => {
    const current = store.get(widgetId);
    if (!current) return;

    if (!current.state.isRunning) {
      stopInterval(widgetId);
      return;
    }

    if (current.state.remainingSeconds <= 1) {
      advancePhase(widgetId);
      return;
    }

    const next = cloneEntry(current);
    next.state.remainingSeconds -= 1;
    store.set(widgetId, next);
    notify(widgetId);
  }, 1000);
}

function toggleRunning(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry) return;

  const next = cloneEntry(entry);
  next.state.isRunning = !next.state.isRunning;
  store.set(widgetId, next);

  if (next.state.isRunning) startInterval(widgetId);
  else stopInterval(widgetId);

  notify(widgetId);
}

function resetTimer(widgetId: string) {
  const entry = store.get(widgetId);
  if (!entry) return;

  const next = cloneEntry(entry);
  next.state.isRunning = false;
  next.state.remainingSeconds = getDurationSecondsForMode(next.config, next.state.mode);

  store.set(widgetId, next);
  stopInterval(widgetId);
  notify(widgetId);
}

function skipPhase(widgetId: string) {
  advancePhase(widgetId);
}

async function loadConfigFromSupabase(widgetId: string) {
  const entry = getOrCreateEntry(widgetId);
  if (entry.configLoaded || entry.configLoading) return;

  stopInterval(widgetId);
  entry.configLoading = true;
  notify(widgetId);

  const supabase = getSupabaseClient();
  const userId = await resolveCurrentUserId(supabase);

  const localConfig = readLocalConfig(userId);

  if (localConfig) {
    const localNext = applyResetRuntime(entry, localConfig);
    localNext.configLoading = true;
    store.set(widgetId, localNext);
    notify(widgetId);
  }

  if (!supabase || !userId) {
    const fallbackConfig = localConfig ?? entry.config;
    const next = applyResetRuntime(entry, fallbackConfig);
    next.configLoaded = true;
    next.configLoading = false;
    store.set(widgetId, next);
    notify(widgetId);
    return;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("widgets_state")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      const fallbackConfig = localConfig ?? entry.config;
      const next = applyResetRuntime(getOrCreateEntry(widgetId), fallbackConfig);
      next.configLoaded = true;
      next.configLoading = false;
      store.set(widgetId, next);
      notify(widgetId);
      return;
    }

    const saved = data?.widgets_state?.pomodoro;

    if (saved) {
      const nextConfig = clampConfig({
        workMinutes: Number(saved.workMinutes ?? DEFAULT_CONFIG.workMinutes),
        breakMinutes: Number(saved.breakMinutes ?? DEFAULT_CONFIG.breakMinutes),
        longBreakMinutes: Number(saved.longBreakMinutes ?? DEFAULT_CONFIG.longBreakMinutes),
        cyclesBeforeLongBreak: Number(
          saved.cyclesBeforeLongBreak ?? DEFAULT_CONFIG.cyclesBeforeLongBreak
        ),
      });

      writeLocalConfig(userId, nextConfig);

      const latestEntry = getOrCreateEntry(widgetId);
      const next = applyResetRuntime(latestEntry, nextConfig);
      next.configLoaded = true;
      next.configLoading = false;
      store.set(widgetId, next);
      notify(widgetId);
      return;
    }

    const fallbackConfig = localConfig ?? entry.config;
    const next = applyResetRuntime(getOrCreateEntry(widgetId), fallbackConfig);
    next.configLoaded = true;
    next.configLoading = false;
    store.set(widgetId, next);
    notify(widgetId);
  } catch {
    const fallbackConfig = localConfig ?? entry.config;
    const next = applyResetRuntime(getOrCreateEntry(widgetId), fallbackConfig);
    next.configLoaded = true;
    next.configLoading = false;
    store.set(widgetId, next);
    notify(widgetId);
  }
}

async function saveConfigToSupabase(widgetId: string, config: PomodoroConfig) {
  const entry = getOrCreateEntry(widgetId);
  const supabase = getSupabaseClient();
  const userId = await resolveCurrentUserId(supabase);

  writeLocalConfig(userId, config);

  if (!supabase || !userId) return;

  entry.configSaving = true;
  notify(widgetId);

  try {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("widgets_state")
      .eq("id", userId)
      .maybeSingle();

    const currentWidgetsState = currentProfile?.widgets_state ?? {};

    await supabase
      .from("profiles")
      .update({
        widgets_state: {
          ...currentWidgetsState,
          pomodoro: {
            workMinutes: config.workMinutes,
            breakMinutes: config.breakMinutes,
            longBreakMinutes: config.longBreakMinutes,
            cyclesBeforeLongBreak: config.cyclesBeforeLongBreak,
          },
        },
      })
      .eq("id", userId);
  } finally {
    const latest = getOrCreateEntry(widgetId);
    latest.configSaving = false;
    notify(widgetId);
  }
}

function updateConfig(widgetId: string, config: PomodoroConfig) {
  const entry = getOrCreateEntry(widgetId);
  const nextConfig = clampConfig(config);

  const next = applyResetRuntime(entry, nextConfig);

  store.set(widgetId, next);
  stopInterval(widgetId);
  notify(widgetId);

  void saveConfigToSupabase(widgetId, nextConfig);
}

export function getPomodoroVisualTheme(
  mode: PomodoroMode,
  isRunning: boolean
): PomodoroVisualTheme {
  if (!isRunning) {
    return {
      ringClassName: "text-white/28",
      textClassName: "text-white",
      badgeClassName: "border-white/10 bg-white/5 text-white/60",
      glowClassName: "from-white/[0.04] via-white/[0.015] to-transparent",
      accentClassName: "text-white/80",
    };
  }

  if (mode === "WORK") {
    return {
      ringClassName: "text-emerald-300/95",
      textClassName: "text-emerald-50",
      badgeClassName: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
      glowClassName: "from-emerald-400/[0.12] via-emerald-300/[0.05] to-transparent",
      accentClassName: "text-emerald-200",
    };
  }

  if (mode === "SHORT_BREAK") {
    return {
      ringClassName: "text-sky-300/95",
      textClassName: "text-sky-50",
      badgeClassName: "border-sky-400/20 bg-sky-400/10 text-sky-100",
      glowClassName: "from-sky-400/[0.12] via-sky-300/[0.05] to-transparent",
      accentClassName: "text-sky-200",
    };
  }

  return {
    ringClassName: "text-violet-300/95",
    textClassName: "text-violet-50",
    badgeClassName: "border-violet-400/20 bg-violet-400/10 text-violet-100",
    glowClassName: "from-violet-400/[0.12] via-violet-300/[0.05] to-transparent",
    accentClassName: "text-violet-200",
  };
}

export function usePomodoroController(widgetId: string) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const entry = getOrCreateEntry(widgetId);
    const listener = () => forceRender((value) => value + 1);

    entry.listeners.add(listener);
    void loadConfigFromSupabase(widgetId);

    return () => {
      stopInterval(widgetId);
      const latest = store.get(widgetId);
      latest?.listeners.delete(listener);
    };
  }, [widgetId]);

  const entry = getOrCreateEntry(widgetId);

  const totalSeconds = useMemo(() => {
    return getDurationSecondsForMode(entry.config, entry.state.mode);
  }, [entry.config, entry.state.mode]);

  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - entry.state.remainingSeconds / totalSeconds));
  }, [entry.state.remainingSeconds, totalSeconds]);

  const visualTheme = useMemo(() => {
    return getPomodoroVisualTheme(entry.state.mode, entry.state.isRunning);
  }, [entry.state.mode, entry.state.isRunning]);

  return {
    config: entry.config,
    state: entry.state,
    progress,
    totalSeconds,
    formattedTime: formatTime(entry.state.remainingSeconds),
    modeLabel: getModeLabel(entry.state.mode),
    cycleLabel: getCycleLabel(entry.state, entry.config),
    configLoaded: entry.configLoaded,
    configLoading: entry.configLoading,
    configSaving: entry.configSaving,
    visualTheme,
    actions: {
      toggleRunning: () => toggleRunning(widgetId),
      resetTimer: () => resetTimer(widgetId),
      skipPhase: () => skipPhase(widgetId),
      updateConfig: (config: PomodoroConfig) => updateConfig(widgetId, config),
    },
  };
}

export function usePomodoroConfigDraft(config: PomodoroConfig) {
  const [draft, setDraft] = useState<PomodoroConfig>(config);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  return {
    draft,
    setDraft,
  };
}