"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { fetchWidgetsState, mergeSaveWidgetsState } from "@/lib/widgetsState";
import type { BudgetState } from "./budgetTypes";
import { clampMonthKey, getOrCreateMonth, makeEmptyMonth, monthKey } from "./budgetUtils";

const LS_KEY = "lifeos_budget";

const DEFAULT_STATE: BudgetState = {
  currency: "EUR",
  months: {},
  activeMonth: monthKey(),
};

export function useBudgetState() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<BudgetState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      let next: BudgetState | null = null;
      // 1) Try profile
      try {
        const ws = await fetchWidgetsState(supabase);
        const b = (ws as any)?.budget;
        if (b && typeof b === "object") next = b as BudgetState;
      } catch {
        // ignore
      }
      // 2) Fallback localStorage
      if (!next) {
        try {
          const raw = window.localStorage.getItem(LS_KEY);
          if (raw) next = JSON.parse(raw);
        } catch {
          // ignore
        }
      }
      const active = clampMonthKey((next as any)?.activeMonth ?? monthKey());
      const months = (next as any)?.months && typeof (next as any).months === "object" ? (next as any).months : {};
      const currency = (next as any)?.currency === "USD" ? "USD" : "EUR";
      const hydrated: BudgetState = {
        currency,
        months,
        activeMonth: active,
      };
      // ensure current month exists
      if (!hydrated.months[active]) hydrated.months[active] = makeEmptyMonth(active);
      setState(hydrated);
      setIsLoaded(true);
    };
    load();
  }, [supabase]);

  const persist = async (next: BudgetState) => {
    setState(next);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    try {
      await mergeSaveWidgetsState(supabase, { budget: next } as any);
    } catch {
      // ignore
    }
  };

  const api = useMemo(() => {
    const current = getOrCreateMonth(state, state.activeMonth);
    return {
      state,
      isLoaded,
      current,
      setCurrency: (currency: BudgetState["currency"]) => persist({ ...state, currency }),
      setActiveMonth: (month: string) => {
        const m = clampMonthKey(month);
        const months = { ...state.months };
        if (!months[m]) months[m] = makeEmptyMonth(m);
        return persist({ ...state, activeMonth: m, months });
      },
      upsertMonth: (month: string, updater: (m: any) => any) => {
        const mKey = clampMonthKey(month);
        const base = state.months[mKey] ?? makeEmptyMonth(mKey);
        const nextMonth = { ...base, ...updater(base), updated_at: Date.now() };
        const next = { ...state, months: { ...state.months, [mKey]: nextMonth } };
        return persist(next);
      },
      resetMonth: (month: string) => {
        const mKey = clampMonthKey(month);
        const next = { ...state, months: { ...state.months, [mKey]: makeEmptyMonth(mKey) } };
        return persist(next);
      },
    };
  }, [state, isLoaded]);

  return api;
}
