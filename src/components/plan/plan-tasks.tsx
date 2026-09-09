"use client";

import { useState } from "react";
import { PriorityGroup } from "./priority-group";
import { TaskForm } from "@/components/tasks/task-form";
import { ConfirmDialog } from "@/components/app/modal";
import { taskStore, type TaskRecord } from "@/lib/store/entities";
import type { Priority } from "@/lib/sample/data";

/** The three priority buckets on Plan My Day, backed by the shared task store. */
export function PlanTasks() {
  const tasks = taskStore.useItems();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | undefined>();
  const [deleting, setDeleting] = useState<TaskRecord | undefined>();

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <>
      {(["must", "should", "could"] as Priority[]).map((p) => (
        <PriorityGroup
          key={p}
          priority={p}
          tasks={tasks.filter((t) => t.priority === p)}
          onAdd={openAdd}
          onToggle={(id) => {
            const t = tasks.find((x) => x.id === id);
            if (t) taskStore.update(id, { done: !t.done });
          }}
          onEdit={(t) => {
            setEditing(t);
            setFormOpen(true);
          }}
          onDelete={setDeleting}
        />
      ))}

      <TaskForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(t) => (editing ? taskStore.update(t.id, t) : taskStore.add(t))}
        task={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        onConfirm={() => deleting && taskStore.remove(deleting.id)}
        title="Delete task?"
        body={`"${deleting?.title ?? ""}" will be removed. This can't be undone.`}
      />
    </>
  );
}
