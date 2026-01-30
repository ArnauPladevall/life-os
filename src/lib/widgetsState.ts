"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type WidgetsState = {
  notesText?: string;
  focusIds?: string[];
  pomodoro?: {
    mode: "focus" | "break";
    isActive: boolean;
    timeLeft: number;
    endAt?: number | null;
    cycle?: number;
  };
  budget?: any;
  quote?: any;
};

export async function fetchWidgetsState(supabase: SupabaseClient): Promise<WidgetsState | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("widgets_state")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return null;
  const raw = (data as any)?.widgets_state;
  return raw && typeof raw === "object" ? (raw as WidgetsState) : null;
}

export async function mergeSaveWidgetsState(supabase: SupabaseClient, patch: Partial<WidgetsState>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("widgets_state")
    .eq("id", user.id)
    .maybeSingle();

  const current = ((data as any)?.widgets_state ?? {}) as Record<string, unknown>;
  const next = { ...current, ...patch };
  await supabase
    .from("profiles")
    .upsert({ id: user.id, widgets_state: next, email: user.email });
}
