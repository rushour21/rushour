"use client";

import { StatCard } from "./stat-cards";
import { IconCheck } from "@/components/app/icons";
import { taskStore } from "@/lib/store/entities";

/** The "Tasks completed" stat card, reading the live store so it updates the
 *  moment a task is added, finished, or deleted anywhere in the app. */
export function TaskStat() {
  const tasks = taskStore.useItems();
  const done = tasks.filter((t) => t.done).length;
  const total = Math.max(tasks.length, 1);

  return (
    <StatCard
      icon={<IconCheck />}
      value={`${done} / ${tasks.length}`}
      label="Tasks completed"
      pct={Math.round((done / total) * 100)}
      tone="mint"
    />
  );
}
