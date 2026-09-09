"use client";

import { createLocalStore } from "./local-store";
import { TASKS, type Category, type Priority } from "@/lib/sample/data";
import { YEAR_GOALS, type Goal } from "@/lib/sample/goals";
import { HABITS, type Habit } from "@/lib/sample/habits";

/**
 * The app's editable collections, seeded from the sample data so a first
 * visit looks exactly as designed and anything the user adds persists on top.
 *
 * These shapes are the de-facto schema: each store maps one-to-one onto a
 * Mongo collection when this moves to the server, which is why ids are
 * strings and nothing here holds a Date object (JSON round-trips cleanly).
 */

export interface TaskRecord {
  id: string;
  title: string;
  minutes: number;
  priority: Priority;
  category: Category;
  project?: string;
  due: string;
  done: boolean;
  notes?: string;
}

export const taskStore = createLocalStore<TaskRecord>(
  "rushour.tasks",
  TASKS.map((t) => ({
    id: t.id,
    title: t.title,
    minutes: t.minutes,
    priority: t.priority,
    category: t.category,
    project: t.project,
    due: t.due,
    done: t.done,
  })),
);

export const goalStore = createLocalStore<Goal>("rushour.goals", YEAR_GOALS);

export const habitStore = createLocalStore<Habit>("rushour.habits", HABITS);
