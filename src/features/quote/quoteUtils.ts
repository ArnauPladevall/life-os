import type { QuoteTopic } from "./quotes";
import { QUOTES } from "./quotes";

export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function quoteOfTheDay(topic: QuoteTopic, d = new Date()) {
  const list = QUOTES[topic] ?? QUOTES.reflective;
  const seed = `${topic}:${dayKey(d)}`;
  const idx = hashString(seed) % list.length;
  return list[idx];
}