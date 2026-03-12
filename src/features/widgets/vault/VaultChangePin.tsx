"use client";

import { FormEvent, useState } from "react";

type VaultChangePinProps = {
  isBusy?: boolean;
  onCancel: () => void;
  onSubmit: (currentPin: string, newPin: string) => void;
};

export default function VaultChangePin({ isBusy, onCancel, onSubmit }: VaultChangePinProps) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin) || !/^\d{4}$/.test(confirmPin)) {
      setLocalError("All PIN fields must contain exactly 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setLocalError("New PIN confirmation does not match.");
      return;
    }

    onSubmit(currentPin, newPin);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Security</div>
          <h3 className="mt-1 text-2xl font-medium text-white">Change PIN</h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Current PIN</span>
            <input
              inputMode="numeric"
              maxLength={4}
              type="password"
              value={currentPin}
              onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl tracking-[0.45em] text-white outline-none transition focus:border-white/20"
              placeholder="••••"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">New PIN</span>
            <input
              inputMode="numeric"
              maxLength={4}
              type="password"
              value={newPin}
              onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl tracking-[0.45em] text-white outline-none transition focus:border-white/20"
              placeholder="••••"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">Confirm new PIN</span>
            <input
              inputMode="numeric"
              maxLength={4}
              type="password"
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl tracking-[0.45em] text-white outline-none transition focus:border-white/20"
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
          disabled={isBusy}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Updating..." : "Update PIN"}
        </button>
      </form>
    </div>
  );
}