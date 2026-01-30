"use client";

import { NotebookText, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadNotes, saveNotes } from "./notesStorage";

import type { WidgetSize } from "@/features/lobby/SmartWidget";
import { mergeSaveWidgetsState, fetchWidgetsState } from "@/lib/widgetsState";
import { createClient } from "@/lib/supabase";

export default function QuickNotesWidget({ size }: { size: WidgetSize }) {
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setText(loadNotes());
    const supabase = createClient();
    fetchWidgetsState(supabase).then((s) => {
      if (s?.notesText != null) setText(s.notesText);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const id = window.setTimeout(() => {
      saveNotes(text);
      mergeSaveWidgetsState(supabase, { notesText: text }).catch(() => {});
      setSavedAt(Date.now());
    }, 350);
    return () => window.clearTimeout(id);
  }, [text, size]);

  const rows = size === "1x1" ? 4 : size === "2x1" ? 4 : size === "2x2" ? 7 : 8;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <NotebookText size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-semibold text-white">Notas</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40">
          <Save size={12} />
          <span>{savedAt ? "Saved" : "Idle"}</span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Escribe aquí. Se guarda solo."
        rows={rows}
        className="flex-1 w-full resize-none rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-white/90 placeholder:text-white/25 outline-none focus:border-white/20 focus:bg-white/10 transition-colors custom-scrollbar"
      />
    </div>
  );
}
