"use client";

import { useSyncExternalStore } from "react";

/**
 * A single client-side profile record (not a list, so it doesn't fit the
 * createLocalStore collection shape). Same pattern otherwise: cached against
 * the raw string it came from, so reads stay pure and referentially stable.
 */
export interface Profile {
  name: string;
  email: string;
  location: string;
  timezone: string;
  bio: string;
  goalTags: string[];
  interestTags: string[];
  resumeText: string;
  resumeFileName: string | null;
  /** Fixed daily commitments in hours, set once during onboarding (or later
   *  in Settings) - null until set, so Plan's capacity card knows to fall
   *  back to a stated assumption instead of showing a fake zero. */
  sleepTargetH: number | null;
  workH: number | null;
  commuteH: number | null;
  mealsH: number | null;
  lifeH: number | null;
  updatedAt: number | null;
}

const KEY = "rushour.profile";
const EVENT = "rushour:store:profile";
const EMPTY: Profile = {
  name: "",
  email: "",
  location: "",
  timezone: "",
  bio: "",
  goalTags: [],
  interestTags: [],
  resumeText: "",
  resumeFileName: null,
  sleepTargetH: null,
  workH: null,
  commuteH: null,
  mealsH: null,
  lifeH: null,
  updatedAt: null,
};

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

function write(next: Profile) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  cacheRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
}

export const profileStore = {
  useProfile: (): Profile => useSyncExternalStore(subscribe, read, () => EMPTY),
  /** Merges into the existing record - never drops fields it wasn't given. */
  update: (patch: Partial<Profile>) => {
    write({ ...read(), ...patch, updatedAt: Date.now() });
  },
  setResume: (resumeText: string, resumeFileName: string | null) => {
    write({ ...read(), resumeText, resumeFileName, updatedAt: Date.now() });
  },
  clearResume: () => {
    write({ ...read(), resumeText: "", resumeFileName: null, updatedAt: Date.now() });
  },
};
