"use client";

import { useSyncExternalStore } from "react";

/**
 * The in-progress quiz for today: which question ids are in it, in what
 * order, and how far the user got. Persisted so leaving mid-quiz (answered
 * 2 of 10, say) and coming back resumes at question 3 instead of
 * regenerating a fresh batch from the AI.
 */
export interface ActiveQuizSession {
  date: string;
  order: string[];
  index: number;
}

const KEY = "rushour.quiz.session";
const EVENT = "rushour:store:quiz-session";

let cacheRaw: string | null | undefined;
let cacheParsed: ActiveQuizSession | null = null;

function read(): ActiveQuizSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheParsed;

  cacheRaw = raw;
  try {
    cacheParsed = raw ? (JSON.parse(raw) as ActiveQuizSession) : null;
  } catch {
    cacheParsed = null;
  }
  return cacheParsed;
}

function write(next: ActiveQuizSession | null) {
  if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
  else window.localStorage.removeItem(KEY);
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

export const quizSessionStore = {
  useSession: (): ActiveQuizSession | null =>
    useSyncExternalStore(subscribe, read, () => null),
  save: (session: ActiveQuizSession) => write(session),
  setIndex: (index: number) => {
    const current = read();
    if (current) write({ ...current, index });
  },
  clear: () => write(null),
};
