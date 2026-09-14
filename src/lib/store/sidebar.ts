"use client";

import { useSyncExternalStore } from "react";

/** Whether the desktop sidebar is collapsed to icons-only. Persisted so the
 *  choice survives a reload; the mobile drawer never reads this - collapsing
 *  a drawer that's already an overlay wouldn't make sense. */
const KEY = "rushour.sidebar.collapsed";
const EVENT = "rushour:store:sidebar";

let cacheRaw: string | null | undefined;
let cacheParsed = false;

function read(): boolean {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheParsed;

  cacheRaw = raw;
  cacheParsed = raw === "1";
  return cacheParsed;
}

function write(next: boolean) {
  window.localStorage.setItem(KEY, next ? "1" : "0");
  cacheRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export const sidebarStore = {
  useCollapsed: (): boolean => useSyncExternalStore(subscribe, read, () => false),
  toggle: () => write(!read()),
};
