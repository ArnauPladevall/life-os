"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { fetchWidgetsState, mergeSaveWidgetsState } from "@/lib/widgetsState";

type Mode = "focus" | "break";

const STORAGE_KEY = "lifeos_pomodoro_v2";

type Persisted = {
  mode: Mode;
  isActive: boolean;
  timeLeft: number;
  cycle: number;
  endAt: number | null;
};

function durationFor(mode: Mode) {
  return mode === "focus" ? 50 * 60 : 10 * 60;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function usePomodoro() {
  const [mode, setMode] = useState<Mode>("focus");
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationFor("focus"));
  const [cycle, setCycle] = useState(1);
  const [endAt, setEndAt] = useState<number | null>(null);

  const lastSyncedAt = useRef<number>(0);
  const totalTime = useMemo(() => durationFor(mode), [mode]);

  const persistNow = (p: Persisted) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
    try {
      const supabase = createClient();
      mergeSaveWidgetsState(supabase, {
        pomodoro: { mode: p.mode, isActive: p.isActive, timeLeft: p.timeLeft, endAt: p.endAt, cycle: p.cycle },
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  // Load (local + supabase)
  useEffect(() => {
    const local = safeParse<Persisted>(localStorage.getItem(STORAGE_KEY));
    if (local) {
      setMode(local.mode);
      setCycle(typeof local.cycle === "number" ? local.cycle : 1);
      setIsActive(!!local.isActive);
      setEndAt(typeof local.endAt === "number" ? local.endAt : null);
      setTimeLeft(typeof local.timeLeft === "number" ? local.timeLeft : durationFor(local.mode));
    }

    const supabase = createClient();
    fetchWidgetsState(supabase)
      .then((s) => {
        const p = s?.pomodoro;
        if (!p) return;
        setMode(p.mode);
        setIsActive(!!p.isActive);
        setCycle(typeof p.cycle === "number" ? p.cycle : 1);
        setEndAt(typeof p.endAt === "number" ? p.endAt : null);
        const fallback = durationFor(p.mode);
        setTimeLeft(typeof p.timeLeft === "number" ? p.timeLeft : fallback);
      })
      .catch(() => {});
  }, []);

  // Drift-free ticking
  useEffect(() => {
    if (!isActive || !endAt) return;

    const tick = () => {
      const now = Date.now();
      const next = Math.max(0, Math.ceil((endAt - now) / 1000));
      setTimeLeft(next);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isActive, endAt]);

  // Mode transitions
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft > 0) return;

    // Stop, swap mode, prep next duration (user hits start again)
    setIsActive(false);
    setEndAt(null);

    setMode((m) => {
      const next = m === "focus" ? "break" : "focus";
      setTimeLeft(durationFor(next));
      // Completing a break = new cycle
      if (m === "break") setCycle((c) => c + 1);
      return next;
    });

    // subtle beep
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      window.setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 140);
    } catch {
      // ignore
    }
  }, [isActive, timeLeft]);

  // Persist (local + supabase)
  useEffect(() => {
    const payload: Persisted = { mode, isActive, timeLeft, cycle, endAt };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }

    const supabase = createClient();
    const now = Date.now();
    const shouldSync = !isActive || now - lastSyncedAt.current > 5000;
    if (!shouldSync) return;

    // If user closes the window quickly after a mode change, we still want to persist.
    // So: sync immediately when idle, throttle only while running.
    if (!isActive) {
      mergeSaveWidgetsState(supabase, {
        pomodoro: { mode, isActive, timeLeft, endAt, cycle },
      }).catch(() => {});
      lastSyncedAt.current = Date.now();
      return;
    }

    const id = window.setTimeout(() => {
      mergeSaveWidgetsState(supabase, {
        pomodoro: { mode, isActive, timeLeft, endAt, cycle },
      }).catch(() => {});
      lastSyncedAt.current = Date.now();
    }, 250);
    return () => window.clearTimeout(id);
  }, [mode, isActive, timeLeft, cycle, endAt]);

  const toggle = () => {
    setIsActive((a) => {
      const next = !a;
      if (next) {
        const now = Date.now();
        setEndAt(now + timeLeft * 1000);
      } else {
        // pause
        setEndAt(null);
      }
      return next;
    });
  };

  const reset = (nextMode: Mode = mode) => {
    setIsActive(false);
    setEndAt(null);
    setMode(nextMode);
    setTimeLeft(durationFor(nextMode));

    // Ensure persistence even if the user closes immediately.
    persistNow({ mode: nextMode, isActive: false, timeLeft: durationFor(nextMode), cycle, endAt: null });
  };

  const setModeSafe = (next: Mode) => {
    // Changing mode resets timer (prevents weird active states)
    reset(next);
  };

  const skip = () => {
    setIsActive(false);
    setEndAt(null);

    setMode((m) => {
      const next = m === "focus" ? "break" : "focus";
      // Completing a break = new cycle
      if (m === "break") setCycle((c) => c + 1);
      setTimeLeft(durationFor(next));

      // Persist transition instantly
      persistNow({ mode: next, isActive: false, timeLeft: durationFor(next), cycle: m === "break" ? cycle + 1 : cycle, endAt: null });
      return next;
    });
  };

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (1 - timeLeft / totalTime) * 100;

  return { mode, isActive, timeLeft, totalTime, cycle, toggle, reset, format, progress, setMode: setModeSafe, skip };
}
