"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LobbyWidget } from "@/features/lobby/types";
import { createClient } from "@/lib/supabase";
import VaultUnlock from "./VaultUnlock";
import VaultCreatePin from "./VaultCreatePin";
import VaultList from "./VaultList";
import VaultEntryDetail from "./VaultEntryDetail";
import VaultEntryForm from "./VaultEntryForm";
import VaultChangePin from "./VaultChangePin";

export type VaultEntryRow = {
  id: string;
  user_id: string;
  name: string;
  login: string;
  password_encrypted: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VaultSecurityRow = {
  user_id: string;
  pin_hash: string;
  updated_at: string;
};

export type VaultEntryInput = {
  name: string;
  login: string;
  password: string;
  url: string;
  notes: string;
};

type VaultView = "create-pin" | "unlock" | "list" | "detail" | "create" | "edit" | "change-pin";

type VaultAppProps = {
  widget: LobbyWidget;
};

const AUTO_LOCK_MS = 5 * 60 * 1000;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveKey(pin: string, saltBase64: string) {
  const pinMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToUint8Array(saltBase64),
      iterations: 100000,
      hash: "SHA-256",
    },
    pinMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPassword(password: string, pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, arrayBufferToBase64(salt.buffer));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode(password)
  );

  return JSON.stringify({
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encrypted),
  });
}

export async function decryptPassword(payload: string, pin: string) {
  const parsed = JSON.parse(payload) as {
    salt: string;
    iv: string;
    ciphertext: string;
  };

  const key = await deriveKey(pin, parsed.salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToUint8Array(parsed.iv),
    },
    key,
    base64ToUint8Array(parsed.ciphertext)
  );

  return new TextDecoder().decode(decrypted);
}

export default function VaultApp({ widget }: VaultAppProps) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [security, setSecurity] = useState<VaultSecurityRow | null>(null);
  const [entries, setEntries] = useState<VaultEntryRow[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntryRow | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<VaultView>("unlock");
  const [pin, setPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearFeedback = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const sortEntries = useCallback((rows: VaultEntryRow[]) => {
    return [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    clearFeedback();

    const authResponse = await supabase.auth.getUser();

    if (authResponse.error || !authResponse.data.user) {
      setError("Unable to load session.");
      setIsLoading(false);
      return;
    }

    const currentUserId = authResponse.data.user.id;
    setUserId(currentUserId);

    const [securityResponse, entriesResponse] = await Promise.all([
      supabase
        .from("vault_security")
        .select("user_id, pin_hash, updated_at")
        .eq("user_id", currentUserId)
        .maybeSingle(),
      supabase
        .from("vault_entries")
        .select("id, user_id, name, login, password_encrypted, url, notes, created_at, updated_at")
        .eq("user_id", currentUserId),
    ]);

    if (securityResponse.error) {
      setError(securityResponse.error.message);
      setIsLoading(false);
      return;
    }

    if (entriesResponse.error) {
      setError(entriesResponse.error.message);
      setIsLoading(false);
      return;
    }

    const securityRow = securityResponse.data as VaultSecurityRow | null;
    const entryRows = (entriesResponse.data as VaultEntryRow[]) || [];

    setSecurity(securityRow);
    setEntries(sortEntries(entryRows));
    setView(securityRow ? "unlock" : "create-pin");
    setIsLoading(false);
  }, [clearFeedback, sortEntries, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const lockVault = useCallback(() => {
    setPin(null);
    setSelectedEntry(null);
    setView(security ? "unlock" : "create-pin");
    setNotice("Vault locked.");
  }, [security]);

  const resetAutoLock = useCallback(() => {
    if (!pin) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      lockVault();
    }, AUTO_LOCK_MS);
  }, [lockVault, pin]);

  useEffect(() => {
    if (!pin) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      return;
    }

    const handleActivity = () => {
      resetAutoLock();
    };

    resetAutoLock();

    window.addEventListener("pointerdown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [pin, resetAutoLock]);

  const refreshEntries = useCallback(async () => {
    if (!userId) {
      return;
    }

    const response = await supabase
      .from("vault_entries")
      .select("id, user_id, name, login, password_encrypted, url, notes, created_at, updated_at")
      .eq("user_id", userId);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setEntries(sortEntries((response.data as VaultEntryRow[]) || []));
  }, [sortEntries, supabase, userId]);

  const handleCreatePin = useCallback(
    async (nextPin: string) => {
      if (!userId) {
        setError("Missing user session.");
        return;
      }

      setIsBusy(true);
      clearFeedback();

      const pinHash = await sha256Hex(nextPin);

      const response = await supabase.from("vault_security").upsert(
        {
          user_id: userId,
          pin_hash: pinHash,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      setIsBusy(false);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      setSecurity({
        user_id: userId,
        pin_hash: pinHash,
        updated_at: new Date().toISOString(),
      });
      setPin(nextPin);
      setView("list");
      setNotice("PIN created.");
      resetAutoLock();
    },
    [clearFeedback, resetAutoLock, supabase, userId]
  );

  const handleUnlock = useCallback(
    async (submittedPin: string) => {
      if (!security) {
        setError("No PIN configured.");
        return;
      }

      setIsBusy(true);
      clearFeedback();

      const pinHash = await sha256Hex(submittedPin);

      if (pinHash !== security.pin_hash) {
        setIsBusy(false);
        setError("Invalid PIN.");
        return;
      }

      setPin(submittedPin);
      setView("list");
      setSelectedEntry(null);
      setIsBusy(false);
      setNotice("Vault unlocked.");
      resetAutoLock();
    },
    [clearFeedback, resetAutoLock, security]
  );

  const handleCreateEntry = useCallback(
    async (input: VaultEntryInput) => {
      if (!userId || !pin) {
        setError("Vault is locked.");
        return;
      }

      setIsBusy(true);
      clearFeedback();

      const encrypted = await encryptPassword(input.password, pin);

      const response = await supabase.from("vault_entries").insert({
        user_id: userId,
        name: input.name.trim(),
        login: input.login.trim(),
        password_encrypted: encrypted,
        url: input.url.trim() || null,
        notes: input.notes.trim() || null,
      });

      setIsBusy(false);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      await refreshEntries();
      setView("list");
      setNotice("Entry created.");
      resetAutoLock();
    },
    [clearFeedback, pin, refreshEntries, resetAutoLock, supabase, userId]
  );

  const handleUpdateEntry = useCallback(
    async (entryId: string, input: VaultEntryInput) => {
      if (!pin) {
        setError("Vault is locked.");
        return;
      }

      setIsBusy(true);
      clearFeedback();

      const encrypted = await encryptPassword(input.password, pin);

      const response = await supabase
        .from("vault_entries")
        .update({
          name: input.name.trim(),
          login: input.login.trim(),
          password_encrypted: encrypted,
          url: input.url.trim() || null,
          notes: input.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      setIsBusy(false);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      await refreshEntries();

      const refreshed = entries.find((item) => item.id === entryId);

      if (refreshed) {
        setSelectedEntry({
          ...refreshed,
          name: input.name.trim(),
          login: input.login.trim(),
          password_encrypted: encrypted,
          url: input.url.trim() || null,
          notes: input.notes.trim() || null,
          updated_at: new Date().toISOString(),
        });
      }

      setView("detail");
      setNotice("Entry updated.");
      resetAutoLock();
    },
    [clearFeedback, entries, pin, refreshEntries, resetAutoLock, supabase]
  );

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      setIsBusy(true);
      clearFeedback();

      const response = await supabase.from("vault_entries").delete().eq("id", entryId);

      setIsBusy(false);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      await refreshEntries();
      setSelectedEntry(null);
      setView("list");
      setNotice("Entry deleted.");
      resetAutoLock();
    },
    [clearFeedback, refreshEntries, resetAutoLock, supabase]
  );

  const handleChangePin = useCallback(
    async (currentPin: string, nextPin: string) => {
      if (!userId || !security) {
        setError("Missing security configuration.");
        return;
      }

      setIsBusy(true);
      clearFeedback();

      const currentHash = await sha256Hex(currentPin);

      if (currentHash !== security.pin_hash) {
        setIsBusy(false);
        setError("Current PIN is incorrect.");
        return;
      }

      try {
        const updates = await Promise.all(
          entries.map(async (entry) => {
            const decrypted = await decryptPassword(entry.password_encrypted, currentPin);
            const encrypted = await encryptPassword(decrypted, nextPin);

            return supabase
              .from("vault_entries")
              .update({
                password_encrypted: encrypted,
                updated_at: new Date().toISOString(),
              })
              .eq("id", entry.id);
          })
        );

        const failedUpdate = updates.find((item) => item.error);

        if (failedUpdate?.error) {
          setIsBusy(false);
          setError(failedUpdate.error.message);
          return;
        }

        const nextHash = await sha256Hex(nextPin);

        const securityResponse = await supabase
          .from("vault_security")
          .update({
            pin_hash: nextHash,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        setIsBusy(false);

        if (securityResponse.error) {
          setError(securityResponse.error.message);
          return;
        }

        setSecurity({
          user_id: userId,
          pin_hash: nextHash,
          updated_at: new Date().toISOString(),
        });
        setPin(nextPin);
        await refreshEntries();
        setView("list");
        setNotice("PIN updated.");
        resetAutoLock();
      } catch {
        setIsBusy(false);
        setError("Unable to re-encrypt entries with the new PIN.");
      }
    },
    [clearFeedback, entries, refreshEntries, resetAutoLock, security, supabase, userId]
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return entries;
    }

    return entries.filter((entry) => {
      return (
        entry.name.toLowerCase().includes(query) ||
        entry.login.toLowerCase().includes(query) ||
        (entry.url || "").toLowerCase().includes(query) ||
        (entry.notes || "").toLowerCase().includes(query)
      );
    });
  }, [entries, search]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[28px] border border-white/10 bg-[#0a0a0a] text-sm text-white/60">
        Loading Vault...
      </div>
    );
  }

  return (
    <div
      data-widget-id={widget.id}
      className="flex h-full min-h-[420px] flex-col rounded-[28px] border border-white/10 bg-[#0a0a0a] text-white"
      onPointerDown={resetAutoLock}
      onKeyDown={resetAutoLock}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 pr-24">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Vault</div>
          <h2 className="mt-1 text-lg font-medium text-white">Secure password manager</h2>
        </div>

        <div className="flex items-center gap-2">
          {pin ? (
            <button
              type="button"
              onClick={lockVault}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Lock
            </button>
          ) : null}

          {pin && view === "list" ? (
            <button
              type="button"
              onClick={() => {
                clearFeedback();
                setView("change-pin");
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Change PIN
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mx-6 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 px-6 py-6">
        {view === "create-pin" ? (
          <VaultCreatePin isBusy={isBusy} onSubmit={handleCreatePin} />
        ) : null}

        {view === "unlock" ? (
          <VaultUnlock isBusy={isBusy} onSubmit={handleUnlock} />
        ) : null}

        {view === "list" ? (
          <VaultList
            entries={filteredEntries}
            search={search}
            onSearchChange={setSearch}
            onCreate={() => {
              clearFeedback();
              setView("create");
            }}
            onSelectEntry={(entry) => {
              clearFeedback();
              setSelectedEntry(entry);
              setView("detail");
              resetAutoLock();
            }}
          />
        ) : null}

        {view === "detail" && selectedEntry && pin ? (
          <VaultEntryDetail
            entry={selectedEntry}
            pin={pin}
            isBusy={isBusy}
            onBack={() => {
              clearFeedback();
              setView("list");
              setSelectedEntry(null);
            }}
            onEdit={() => {
              clearFeedback();
              setView("edit");
            }}
            onDelete={() => void handleDeleteEntry(selectedEntry.id)}
          />
        ) : null}

        {view === "create" ? (
          <VaultEntryForm
            title="Create entry"
            submitLabel="Save entry"
            isBusy={isBusy}
            onCancel={() => {
              clearFeedback();
              setView("list");
            }}
            onSubmit={(input) => void handleCreateEntry(input)}
          />
        ) : null}

        {view === "edit" && selectedEntry && pin ? (
          <VaultEntryForm
            title="Edit entry"
            submitLabel="Save changes"
            isBusy={isBusy}
            entry={selectedEntry}
            pin={pin}
            onCancel={() => {
              clearFeedback();
              setView("detail");
            }}
            onSubmit={(input) => void handleUpdateEntry(selectedEntry.id, input)}
          />
        ) : null}

        {view === "change-pin" ? (
          <VaultChangePin
            isBusy={isBusy}
            onCancel={() => {
              clearFeedback();
              setView("list");
            }}
            onSubmit={(currentPin, nextPin) => void handleChangePin(currentPin, nextPin)}
          />
        ) : null}
      </div>
    </div>
  );
}