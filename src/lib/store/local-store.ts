"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny persisted collection store.
 *
 * Deliberately not a state library: the app needs add/remove/update on a few
 * lists that survive a reload, and nothing more. It follows the same
 * external-store pattern already used for the clock-in control, so reads stay
 * pure during render instead of being pushed in from an effect.
 *
 * The snapshot cache is the important part. `useSyncExternalStore` requires
 * getSnapshot to return the *same reference* until something actually
 * changes; parsing JSON on every call hands back a fresh array each time and
 * spins React into an infinite render loop. So the parsed value is cached
 * against the raw string it came from, and only reparsed when that differs.
 */
export interface LocalStore<T> {
  useItems: () => T[];
  add: (item: T) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<T>) => void;
  replace: (items: T[]) => void;
  reset: () => void;
}

export function createLocalStore<T extends { id: string }>(
  key: string,
  seed: T[],
): LocalStore<T> {
  const EVENT = `rushour:store:${key}`;
  const EMPTY: T[] = seed;

  let cacheRaw: string | null | undefined;
  let cacheParsed: T[] = seed;

  function read(): T[] {
    if (typeof window === "undefined") return seed;

    const raw = window.localStorage.getItem(key);
    if (raw === cacheRaw) return cacheParsed;

    cacheRaw = raw;
    try {
      cacheParsed = raw ? (JSON.parse(raw) as T[]) : seed;
    } catch {
      cacheParsed = seed;
    }
    return cacheParsed;
  }

  function write(items: T[]) {
    window.localStorage.setItem(key, JSON.stringify(items));
    cacheRaw = undefined; // force a reparse on the next read
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

  return {
    useItems: () => useSyncExternalStore(subscribe, read, () => EMPTY),
    add: (item) => write([item, ...read()]),
    remove: (id) => write(read().filter((i) => i.id !== id)),
    update: (id, patch) =>
      write(read().map((i) => (i.id === id ? { ...i, ...patch } : i))),
    replace: (items) => write(items),
    reset: () => {
      window.localStorage.removeItem(key);
      cacheRaw = undefined;
      window.dispatchEvent(new Event(EVENT));
    },
  };
}

/** Stable-enough ids for client-created records. */
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
