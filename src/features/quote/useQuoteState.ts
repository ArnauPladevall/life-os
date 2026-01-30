"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { fetchWidgetsState, mergeSaveWidgetsState } from "@/lib/widgetsState";
import type { QuoteTopic } from "./quotes";

type QuoteState = { topic: QuoteTopic };

const LS_KEY = "lifeos_quote";

const DEFAULT_STATE: QuoteState = { topic: "reflective" };

export function useQuoteState() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QuoteState>(DEFAULT_STATE);

  useEffect(() => {
    const load = async () => {
      let next: QuoteState | null = null;
      try {
        const ws = await fetchWidgetsState(supabase);
        const q = (ws as any)?.quote;
        if (q && typeof q === "object") next = q as QuoteState;
      } catch {
        // ignore
      }
      if (!next) {
        try {
          const raw = window.localStorage.getItem(LS_KEY);
          if (raw) next = JSON.parse(raw);
        } catch {
          // ignore
        }
      }
      const topic = (next as any)?.topic;
      setState({ topic: topic === "motivation" || topic === "love" || topic === "focus" ? topic : "reflective" });
    };
    load();
  }, [supabase]);

  const persist = async (next: QuoteState) => {
    setState(next);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    try {
      await mergeSaveWidgetsState(supabase, { quote: next } as any);
    } catch {
      // ignore
    }
  };

  return {
    state,
    setTopic: (topic: QuoteTopic) => persist({ topic }),
  };
}
