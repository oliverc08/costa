"use client";

import { useSyncExternalStore } from "react";

/**
 * Everything a person saves in the app lives only in this browser's localStorage:
 * no account, nothing on the server. Shared family phones are common, so the
 * privacy sheet can wipe it all.
 */
export interface Reminder {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
}

export interface PlanStep {
  id: string;
  text: string;
  done: boolean;
}

export interface CheckupSnapshot {
  /** English, no personal details; shared with a helper only if the person opts in. */
  summary: string;
  savedAt: string;
}

export interface DeviceData {
  reminders: Reminder[];
  steps: PlanStep[];
  checkup: CheckupSnapshot | null;
  /** Last city / ZIP used on Help — stays on device only. */
  area: string | null;
}

const KEY = "costa_device_v1";
export const CHAT_STORAGE_KEY = "costa_chat_v1";
const EMPTY: DeviceData = { reminders: [], steps: [], checkup: null, area: null };

let cache: DeviceData | null = null;
const listeners = new Set<() => void>();

function read(): DeviceData {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<DeviceData>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: DeviceData) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or disabled (private mode): keep the in-memory copy for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDevice(): DeviceData {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function addReminder(title: string, date: string) {
  const d = read();
  if (d.reminders.some((r) => r.title === title && r.date === date)) return;
  write({ ...d, reminders: [...d.reminders, { id: newId(), title, date }].sort((a, b) => a.date.localeCompare(b.date)) });
}

export function removeReminder(id: string) {
  const d = read();
  write({ ...d, reminders: d.reminders.filter((r) => r.id !== id) });
}

export function addSteps(texts: string[]) {
  const d = read();
  const existing = new Set(d.steps.map((s) => s.text));
  const added = texts.filter((t) => !existing.has(t)).map((text) => ({ id: newId(), text, done: false }));
  write({ ...d, steps: [...d.steps, ...added] });
}

export function toggleStep(id: string) {
  const d = read();
  write({ ...d, steps: d.steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) });
}

export function removeStep(id: string) {
  const d = read();
  write({ ...d, steps: d.steps.filter((s) => s.id !== id) });
}

export function saveCheckup(summary: string) {
  write({ ...read(), checkup: { summary, savedAt: new Date().toISOString() } });
}

export function saveArea(area: string) {
  const trimmed = area.trim().slice(0, 80);
  write({ ...read(), area: trimmed || null });
}

export function getSavedArea(): string | null {
  return read().area;
}

export async function clearDeviceData() {
  write(EMPTY);
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // ignore
  }
  await fetch("/api/session", { method: "DELETE" }).catch(() => null);
}

/** Days from today (local time) to a YYYY-MM-DD date. */
export function daysFromToday(date: string, now = new Date()): number {
  const [y, m, d] = date.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

function icsEscape(s: string) {
  return s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

/** An all-day calendar event with alarms 3 days and 1 day before. Opens in the phone's calendar app. */
export function reminderIcs(r: Reminder, description: string): string {
  const day = r.date.replace(/-/g, "");
  const [y, m, d] = r.date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Costa//Benefits reminders//EN",
    "BEGIN:VEVENT",
    `UID:${r.id}@costa`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${icsEscape(r.title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P3D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(r.title)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(r.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcs(r: Reminder, description: string) {
  const blob = new Blob([reminderIcs(r, description)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "costa-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
