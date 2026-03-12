"use client";

import { FormEvent, useState } from "react";

type VaultCreatePinProps = {
  isBusy?: boolean;
  onSubmit: (pin: string) => void;
};

export default function VaultCreatePin({ isBusy, onSubmit }: VaultCreatePinProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!/^\d{4}$/.test(pin)) {
      setLocalError("PIN must contain exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setLocalError("PIN confirmation does not match.");
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
          <div className="text-5xl leading-none">🗝️</div>
          <h3 className="mt-4 text-xl font-medium text-white">Create PIN</h3>
          <p className="mt-2 text-sm text-white/55">This PIN protects access to your Vault.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Enter PIN</span>
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

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Confirm PIN</span>
            <input
              inputMode="numeric"
              maxLength={4}
              type="password"
              value={confirmPin}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, "").slice(0, 4);
                setConfirmPin(nextValue);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.45em] text-white outline-none transition focus:border-white/20"
              placeholder="••••"
            />
          </label>
        </div>

        {localError ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {localError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isBusy || pin.length !== 4 || confirmPin.length !== 4}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Saving..." : "Create PIN"}
        </button>
      </form>
    </div>
  );
}