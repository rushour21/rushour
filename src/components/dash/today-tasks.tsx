"use client";

import { TaskList } from "./task-list";
import { taskStore } from "@/lib/store/entities";

/** Dashboard's task snippet, reading the same store as My Tasks and Plan. */
export function TodayTasks() {
  const tasks = taskStore.useItems();

  return (
    <TaskList
      tasks={tasks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        time: t.due,
        category: t.category,
        done: t.done,
      }))}
      onToggle={(id) => {
        const t = tasks.find((x) => x.id === id);
        if (t) taskStore.update(id, { done: !t.done });
      }}
    />
  );
}
