"use client";

import { useSyncExternalStore } from "react";

/**
 * Clock in/out state, shared by the topbar control and anything that needs
 * to read it (Dashboard's streak and today's-focus-time stats). Previously
 * trapped inside topbar.tsx as module-private state - moved here so it has
 * exactly one implementation instead of a second one reimplementing the same
 * localStorage shape from a different file.
 */

export const CLOCK_STORAGE_KEY = "clockInTime";
export const HISTORY_STORAGE_KEY = "clockHistory";
export const MAX_HISTORY = 20;
/** Fires in the same tab on clock in/out, so every mounted instance re-syncs -
 *  the browser's own "storage" event only reaches *other* tabs. */
export const CLOCK_EVENT = "rushour:clock-change";
export const REQUIRED_MS = 90 * 60 * 1000; // 1h 30m before clock-out unlocks

export interface ClockRecord {
  clockIn: number;
  clockOut: number;
}

/** A value that only exists in the browser, read the React-sanctioned way:
 *  through an external store rather than an effect that calls setState. */
export function useClockInTime(): number | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CLOCK_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CLOCK_EVENT, onChange);
      };
    },
    () => {
      const saved = localStorage.getItem(CLOCK_STORAGE_KEY);
      return saved ? Number(saved) : null;
    },
    () => null,
  );
}

const EMPTY_HISTORY: ClockRecord[] = [];
/** getSnapshot must return a referentially-stable value when nothing has
 *  changed, or useSyncExternalStore re-renders forever - JSON.parse on every
 *  call would hand back a new array each time even for identical content.
 *  This caches the parsed array against the raw string it came from. */
let historyCacheRaw: string | null | undefined;
let historyCacheParsed: ClockRecord[] = EMPTY_HISTORY;

function readHistorySnapshot(): ClockRecord[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (raw === historyCacheRaw) return historyCacheParsed;

  historyCacheRaw = raw;
  try {
    historyCacheParsed = raw ? (JSON.parse(raw) as ClockRecord[]) : EMPTY_HISTORY;
  } catch {
    historyCacheParsed = EMPTY_HISTORY;
  }
  return historyCacheParsed;
}

/** Every completed clock-in/out pair, newest first. Kept alongside the live
 *  in-progress state (which lives only in CLOCK_STORAGE_KEY) so a session
 *  that hasn't been clocked out yet never appears here as a fake record. */
export function useClockHistory(): ClockRecord[] {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CLOCK_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CLOCK_EVENT, onChange);
      };
    },
    readHistorySnapshot,
    () => EMPTY_HISTORY,
  );
}

export function recordSession(record: ClockRecord) {
  const history = [record, ...readHistorySnapshot()].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  historyCacheRaw = undefined; // force a re-read on the next snapshot
}

/** Ticks once a second via the same external-store pattern, so an elapsed-time
 *  read stays a pure function of props/state rather than a stray Date.now()
 *  call during render. */
export function useNow(active: boolean): number {
  return useSyncExternalStore(
    (onChange) => {
      if (!active) return () => {};
      const id = setInterval(onChange, 1000);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0,
  );
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}
