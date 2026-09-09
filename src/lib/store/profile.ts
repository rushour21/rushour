"use client";

import { useSyncExternalStore } from "react";

/**
 * A single client-side profile record (not a list, so it doesn't fit the
 * createLocalStore collection shape). Same pattern otherwise: cached against
 * the raw string it came from, so reads stay pure and referentially stable.
 */
export interface Profile {
  resumeText: string;
  resumeFileName: string | null;
  updatedAt: number | null;
}

const KEY = "rushour.profile";
const EVENT = "rushour:store:profile";
const EMPTY: Profile = { resumeText: "", resumeFileName: null, updatedAt: null };

let cacheRaw: string | null | undefined;
let cacheParsed: Profile = EMPTY;

function read(): Profile {
  if (typeof window === "undefined") return EMPTY;

  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheParsed;

  cacheRaw = raw;
  try {
    cacheParsed = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cacheParsed = EMPTY;
  }
  return cacheParsed;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export const profileStore = {
  useProfile: (): Profile => useSyncExternalStore(subscribe, read, () => EMPTY),
  setResume: (resumeText: string, resumeFileName: string | null) => {
    const next: Profile = { resumeText, resumeFileName, updatedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    cacheRaw = undefined;
    window.dispatchEvent(new Event(EVENT));
  },
  clearResume: () => {
    window.localStorage.removeItem(KEY);
    cacheRaw = undefined;
    window.dispatchEvent(new Event(EVENT));
  },
};
