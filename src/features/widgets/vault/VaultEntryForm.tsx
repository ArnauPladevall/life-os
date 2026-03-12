"use client";

import { FormEvent, useEffect, useState } from "react";
import { decryptPassword, VaultEntryInput, VaultEntryRow } from "./VaultApp";

type VaultEntryFormProps = {
  title: string;
  submitLabel: string;
  isBusy?: boolean;
  entry?: VaultEntryRow;
  pin?: string;
  onCancel: () => void;
  onSubmit: (input: VaultEntryInput) => void;
};

const EMPTY_INPUT: VaultEntryInput = {
  name: "",
  login: "",
  password: "",
  url: "",
  notes: "",
};

export default function VaultEntryForm({
  title,
  submitLabel,
  isBusy,
  entry,
  pin,
  onCancel,
  onSubmit,
}: VaultEntryFormProps) {
  const [input, setInput] = useState<VaultEntryInput>(EMPTY_INPUT);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!entry) {
        setInput(EMPTY_INPUT);
        return;
      }

      let password = "";

      if (pin) {
        try {
          password = await decryptPassword(entry.password_encrypted, pin);
        } catch {
          password = "";
        }
      }

      if (!cancelled) {
        setInput({
          name: entry.name,
          login: entry.login,
          password,
          url: entry.url || "",
          notes: entry.notes || "",
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [entry, pin]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.name.trim() || !input.login.trim() || !input.password.trim()) {
      return;
    }

    onSubmit({
      name: input.name,
      login: input.login,
      password: input.password,
      url: input.url,
      notes: input.notes,
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Vault entry</div>
          <h3 className="mt-1 text-2xl font-medium text-white">{title}</h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Name</span>
            <input
              type="text"
              value={input.name}
              onChange={(event) => setInput((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
              placeholder="Netflix"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Login</span>
            <input
              type="text"
              value={input.login}
              onChange={(event) => setInput((current) => ({ ...current, login: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
              placeholder="email or username"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Password</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={input.password}
              onChange={(event) => setInput((current) => ({ ...current, password: event.target.value }))}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((current) => !current)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">URL</span>
          <input
            type="text"
            value={input.url}
            onChange={(event) => setInput((current) => ({ ...current, url: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Notes</span>
          <textarea
            value={input.notes}
            onChange={(event) => setInput((current) => ({ ...current, notes: event.target.value }))}
            rows={6}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
            placeholder="Optional"
          />
        </label>

        <button
          type="submit"
          disabled={isBusy || !input.name.trim() || !input.login.trim() || !input.password.trim()}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}