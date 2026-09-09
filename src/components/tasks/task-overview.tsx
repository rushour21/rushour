"use client";

import { Donut, Legend } from "@/components/app/bits";
import { taskStore } from "@/lib/store/entities";

/** Reads the live task list so the ring reflects adds and deletes immediately. */
export function TaskOverview() {
  const tasks = taskStore.useItems();

  const counts = {
    must: tasks.filter((t) => t.priority === "must" && !t.done).length,
    should: tasks.filter((t) => t.priority === "should" && !t.done).length,
    could: tasks.filter((t) => t.priority === "could" && !t.done).length,
    done: tasks.filter((t) => t.done).length,
  };

  const segments = [
    { label: "Must", value: counts.must, color: "#f43f5e" },
    { label: "Should", value: counts.should, color: "#f59e0b" },
    { label: "Nice to do", value: counts.could, color: "#16a34a" },
    { label: "Completed", value: counts.done, color: "#cbd5e1" },
  ];

  return (
    <div className="flex items-center gap-5">
      <Donut
        segments={segments}
        centerValue={String(tasks.length)}
        centerLabel="Total Tasks"
        size={128}
      />
      <Legend items={segments} />
    </div>
  );
}
