"use client";

import { VaultEntryRow } from "./VaultApp";

type VaultListProps = {
  entries: VaultEntryRow[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onSelectEntry: (entry: VaultEntryRow) => void;
};

export default function VaultList({
  entries,
  search,
  onSearchChange,
  onCreate,
  onSelectEntry,
}: VaultListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="sr-only">Search</span>
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search passwords..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
        >
          New entry
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.03]">
        {entries.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center">
            <div>
              <div className="text-4xl leading-none">🗂️</div>
              <div className="mt-4 text-base font-medium text-white">No entries yet</div>
              <p className="mt-2 text-sm text-white/50">
                Create your first secure entry to start using Vault.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry(entry)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{entry.name}</div>
                  <div className="mt-1 truncate text-xs text-white/45">{entry.login}</div>
                </div>

                <div className="ml-4 shrink-0 text-xs text-white/35">Open</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}