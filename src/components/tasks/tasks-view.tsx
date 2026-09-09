"use client";

import { useMemo, useState } from "react";
import { PriorityGroup } from "@/components/plan/priority-group";
import { TaskForm } from "./task-form";
import { ConfirmDialog } from "@/components/app/modal";
import { Button, Select, TabPills } from "@/components/app/bits";
import { IconPlus, IconSearch } from "@/components/app/icons";
import { taskStore, type TaskRecord } from "@/lib/store/entities";
import type { Priority } from "@/lib/sample/data";

const TABS = ["All Tasks", "Today", "Upcoming", "Someday", "Completed"] as const;

/**
 * The editable task surface. Owns the add/edit/delete state and reads the
 * list from the persisted store, so every mutation shows up immediately here
 * and on any other mounted view of the same store.
 */
export function TasksView() {
  const tasks = taskStore.useItems();

  const [tab, setTab] = useState<string>(TABS[0]);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | undefined>();
  const [deleting, setDeleting] = useState<TaskRecord | undefined>();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (tab === "Completed") return t.done;
      if (tab === "Today") return !t.done && t.due === "Today";
      if (tab === "Upcoming") return !t.done && (t.due === "Tomorrow" || t.due === "This week");
      if (tab === "Someday") return !t.done && t.due === "Someday";
      return true;
    });
  }, [tasks, tab, query]);

  const byPriority = (p: Priority) => visible.filter((t) => t.priority === p);

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(task: TaskRecord) {
    setEditing(task);
    setFormOpen(true);
  }

  function handleSubmit(task: TaskRecord) {
    if (editing) taskStore.update(task.id, task);
    else taskStore.add(task);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-ink-faint">
            My tasks
          </p>
          <h1 className="mt-2 text-[28px] sm:text-[32px] font-extrabold tracking-[-0.03em] leading-[1.1] text-balance">
            Turn your plans into progress
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">
            Organize, prioritize and get things done.
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="w-[18px] h-[18px]" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <TabPills tabs={[...TABS]} value={tab} onChange={setTab} />
        <div className="flex gap-2">
          <Select label="Filter" />
          <Select label="Sort: Priority" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <label className="relative flex-1 min-w-[240px]">
          <span className="sr-only">Search tasks</span>
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <IconSearch className="w-[18px] h-[18px]" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface border border-line text-[14px] placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
          />
        </label>
        <Select label="Project" />
        <Select label="Priority" />
        <Select label="Tag" />
        <Select label="Status" />
      </div>

      <div className="flex flex-col gap-4">
        {(["must", "should", "could"] as Priority[]).map((p) => (
          <PriorityGroup
            key={p}
            priority={p}
            tasks={byPriority(p)}
            showBlurb
            onAdd={openAdd}
            onToggle={(id) => {
              const t = tasks.find((x) => x.id === id);
              if (t) taskStore.update(id, { done: !t.done });
            }}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ))}
      </div>

      <TaskForm
        // Remounts per target so the fields reinitialise instead of holding
        // the previous task's values.
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
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
