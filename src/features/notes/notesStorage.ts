"use client";

const KEY = "lifeos_quick_notes_v1";

export function loadNotes(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNotes(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // ignore
  }
}
