"use client";

import { FormEvent, useState } from "react";

type VaultUnlockProps = {
  isBusy?: boolean;
  onSubmit: (pin: string) => void;
};

export default function VaultUnlock({ isBusy, onSubmit }: VaultUnlockProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return;
    }

    onSubmit(pin);
  };

  return (
    <div className="mx-auto flex h-full max-w-md items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="mb-6 text-center">
          <div className="text-5xl leading-none">🔐</div>
          <h3 className="mt-4 text-xl font-medium text-white">Unlock Vault</h3>
          <p className="mt-2 text-sm text-white/55">Enter your 4-digit PIN to access saved credentials.</p>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">PIN</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            type="password"
            value={pin}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(nextValue);
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.45em] text-white outline-none transition focus:border-white/20"
            placeholder="••••"
          />
        </label>

        <button
          type="submit"
          disabled={isBusy || pin.length !== 4}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}