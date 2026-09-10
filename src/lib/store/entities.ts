"use client";

import { createLocalStore } from "./local-store";
import { type Category, type Priority } from "@/lib/sample/data";
import { type Goal } from "@/lib/sample/goals";
import { type Habit } from "@/lib/sample/habits";

/**
 * The app's editable collections. They start empty - nothing is seeded -
 * so a first visit shows exactly what the user has actually entered.
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

export const taskStore = createLocalStore<TaskRecord>("rushour.tasks", []);

export const goalStore = createLocalStore<Goal>("rushour.goals", []);

export const habitStore = createLocalStore<Habit>("rushour.habits", []);
