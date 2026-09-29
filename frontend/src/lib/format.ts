// Форматирање на време, пари и датуми
import type { Lang } from "./types";

// 2295 секунди -> "38:15"
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatPrice(amount: number, lang: Lang): string {
  return `${amount.toLocaleString(lang === "mk" ? "mk-MK" : "en-US")} ${lang === "mk" ? "ден." : "MKD"}`;
}

export function formatDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return date.toLocaleDateString(lang === "mk" ? "mk-MK" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  });
}

// Date -> "2026-10-01" (локално време, без UTC поместување)
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Ја зема вредноста на полето на тековниот јазик: pick(room, "name", "mk") -> room.name_mk
export function pick<T extends object>(obj: T, field: string, lang: Lang): string {
  return (obj as Record<string, string>)[`${field}_${lang}`] ?? "";
}
