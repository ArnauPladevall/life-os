"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Layout, LogOut, Type, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Preferences } from "./types";

const EMOJIS = ["💻", "🧠", "⚡", "🪐", "🎯", "🔒"];

interface Props {
  onClose: () => void;
  preferences: Preferences;
  onUpdatePref: (newPrefs: Preferences) => void;
}

export function SettingsPanel({ onClose, preferences, onUpdatePref }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const prefs: Preferences = {
    ...preferences,
    showHeader: typeof preferences.showHeader === "boolean" ? preferences.showHeader : true,
    bgId: typeof preferences.bgId === "string" ? preferences.bgId : "aurora",
    customTitle: typeof preferences.customTitle === "string" ? preferences.customTitle : "Life OS",
    emoji: typeof preferences.emoji === "string" ? preferences.emoji : "💻",
    emojiPosition: preferences.emojiPosition === "top" ? "top" : "inline",
    titleAlign: preferences.titleAlign === "left" ? "left" : "center",
  };

  const backgrounds = [
    {
      id: "aurora",
      name: "Aurora",
      preview:
        "bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.25),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.28),transparent_32%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,#07080c_0%,#040507_100%)]",
    },
    {
      id: "midnight",
      name: "Midnight",
      preview:
        "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.16),transparent_30%),linear-gradient(180deg,#07121f_0%,#020407_100%)]",
    },
    {
      id: "slate",
      name: "Slate",
      preview:
        "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_28%),linear-gradient(180deg,#0b0f14_0%,#050507_100%)]",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 14 }}
        className="relative z-10 flex max-h-[86vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0c10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Settings</h2>
            <p className="mt-1 text-sm text-white/40">Visual foundation and global behavior</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar space-y-7 overflow-y-auto px-6 py-6">
          <section className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/38">
              Identity
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-white/40">Title</label>
              <div className="relative">
                <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={prefs.customTitle || ""}
                  onChange={(e) => onUpdatePref({ ...prefs, customTitle: e.target.value })}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05]"
                  placeholder="Life OS"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-white/40">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    onClick={() => onUpdatePref({ ...prefs, emoji })}
                    className={`flex h-12 items-center justify-center rounded-[1rem] border text-xl transition ${
                      prefs.emoji === emoji
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-white/40">Header layout</label>
              <div className="grid grid-cols-2 gap-2 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={() => onUpdatePref({ ...prefs, emojiPosition: "inline" })}
                  className={`rounded-[1rem] px-4 py-2.5 text-sm transition ${
                    prefs.emojiPosition === "inline" ? "bg-white text-black" : "text-white/55"
                  }`}
                >
                  Inline
                </button>
                <button
                  onClick={() => onUpdatePref({ ...prefs, emojiPosition: "top" })}
                  className={`rounded-[1rem] px-4 py-2.5 text-sm transition ${
                    prefs.emojiPosition === "top" ? "bg-white text-black" : "text-white/55"
                  }`}
                >
                  Stacked
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/38">
              Appearance
            </div>

            <div className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="flex items-center gap-3">
                <Layout size={17} className="text-white/40" />
                <div>
                  <div className="text-sm font-medium text-white">Show header</div>
                  <div className="text-xs text-white/38">Display the board title at the top</div>
                </div>
              </div>

              <button
                onClick={() => onUpdatePref({ ...prefs, showHeader: !prefs.showHeader })}
                className={`relative h-7 w-12 rounded-full transition ${
                  prefs.showHeader ? "bg-white" : "bg-white/12"
                }`}
              >
                <div
                  className={`absolute top-1 h-5 w-5 rounded-full transition ${
                    prefs.showHeader ? "left-6 bg-black" : "left-1 bg-white"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <ImageIcon size={15} />
                Background
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => onUpdatePref({ ...prefs, bgId: bg.id })}
                    className={`overflow-hidden rounded-[1.35rem] border transition ${
                      prefs.bgId === bg.id
                        ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                        : "border-white/10"
                    }`}
                  >
                    <div className={`h-24 w-full ${bg.preview}`} />
                    <div className="border-t border-white/6 bg-black/20 px-3 py-2 text-left text-sm text-white">
                      {bg.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-white/6 px-6 py-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-red-500/15 bg-red-500/8 px-4 py-4 font-medium text-red-400 transition hover:bg-red-500/12"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}