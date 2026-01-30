"use client";

import { NotebookText, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadNotes, saveNotes } from "./notesStorage";

import { createClient } from "@/lib/supabase";
import { fetchWidgetsState, mergeSaveWidgetsState } from "@/lib/widgetsState";

export default function QuickNotesApp() {
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setText(loadNotes());
    const supabase = createClient();
    fetchWidgetsState(supabase)
      .then((s) => {
        if (s?.notesText != null) setText(s.notesText);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const id = window.setTimeout(() => {
      saveNotes(text);
      mergeSaveWidgetsState(supabase, { notesText: text }).catch(() => {});
      setSavedAt(Date.now());
    }, 300);
    return () => window.clearTimeout(id);
  }, [text]);

  const meta = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  }, [text]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <NotebookText size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Notas rápidas</div>
            <div className="text-sm text-white/40">Auto-guardado · {meta.words} palabras · {meta.chars} chars</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-xs text-white/40">
            <Save size={14} />
            <span>{savedAt ? new Date(savedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
          </div>
          <button
            onClick={() => {
              setText("");
              saveNotes("");
              const supabase = createClient();
              mergeSaveWidgetsState(supabase, { notesText: "" }).catch(() => {});
              setSavedAt(Date.now());
            }}
            className="h-11 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe sin fricción. Esto se guarda solo."
          className="w-full h-full resize-none rounded-3xl bg-white/5 border border-white/10 p-6 text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-white/20 focus:bg-white/10 transition-colors custom-scrollbar"
        />
      </div>
    </div>
  );
}
