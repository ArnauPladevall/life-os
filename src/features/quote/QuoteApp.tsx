"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useQuoteState } from "./useQuoteState";

const TOPIC_LABEL_ES: Record<string, string> = {
  motivation: "Motivación",
  focus: "Focus",
  health: "Salud",
  life: "Vida",
  success: "Éxito",
  creativity: "Creatividad",
  stoicism: "Estoicismo",
};

export default function QuoteApp() {
  const { t } = useLocale();
  const { state, setTopic, next, more } = useQuoteState();

  const label = TOPIC_LABEL_ES[state.topic];

  const topics = useMemo(() => Object.keys(TOPIC_LABEL_ES), []);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    // cambia tema al abrir: hint del UI
  }, [open]);

  return (
    <div className="h-full w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
        >
          {label}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={next}
            className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
            title={t("quote_change_topic_hint")}
          >
            ↻
          </button>

          <button
            onClick={more}
            className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            {t("quote_more")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex-1 min-h-0 overflow-auto">
        <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
          {state.quote}
        </div>
        <div className="mt-3 text-xs text-white/45">{state.author}</div>
      </div>

      <div className="flex gap-2 overflow-auto">
        {topics.map((tp) => {
          const l = TOPIC_LABEL_ES[tp];
          return (
            <button
              key={tp}
              onClick={() => setTopic(tp)}
              className={`text-xs px-3 py-2 rounded-lg border border-white/10 ${
                tp === state.topic ? "bg-white/10 text-white/90" : "bg-white/5 hover:bg-white/10 text-white/70"
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
