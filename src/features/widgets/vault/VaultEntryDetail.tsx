"use client";

import { useEffect, useMemo, useState } from "react";
import { decryptPassword, VaultEntryRow } from "./VaultApp";

type VaultEntryDetailProps = {
  entry: VaultEntryRow;
  pin: string;
  isBusy?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function normalizeUrl(url: string) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export default function VaultEntryDetail({
  entry,
  pin,
  isBusy,
  onBack,
  onEdit,
  onDelete,
}: VaultEntryDetailProps) {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState<"login" | "password" | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await decryptPassword(entry.password_encrypted, pin);

        if (!cancelled) {
          setPassword(result);
        }
      } catch {
        if (!cancelled) {
          setPassword("");
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [entry.password_encrypted, pin]);

  const displayPassword = useMemo(() => {
    if (isVisible) {
      return password;
    }

    return "••••••••••••";
  }, [isVisible, password]);

  const handleCopy = async (type: "login" | "password", value: string) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(type);

    window.setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={onDelete}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Entry</div>
          <h3 className="mt-2 text-2xl font-medium text-white">{entry.name}</h3>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/35">Login</div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="min-w-0 flex-1 truncate text-sm text-white">{entry.login}</div>
                <button
                  type="button"
                  onClick={() => void handleCopy("login", entry.login)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {copied === "login" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/35">Password</div>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="min-w-0 flex-1 break-all text-sm text-white">{displayPassword}</div>
                <button
                  type="button"
                  onClick={() => setIsVisible((current) => !current)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {isVisible ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy("password", password)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {copied === "password" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/35">URL</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                {entry.url ? (
                  <a
                    href={normalizeUrl(entry.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-white/85 underline decoration-white/20 underline-offset-4 transition hover:text-white"
                  >
                    {entry.url}
                  </a>
                ) : (
                  <span className="text-white/35">No URL</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Notes</div>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/75">
            {entry.notes?.trim() ? entry.notes : <span className="text-white/35">No notes</span>}
          </div>
        </div>
      </div>
    </div>
  );
}