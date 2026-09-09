"use client";

import { useState } from "react";
import { Modal } from "@/components/app/modal";
import { ChoiceRow, Field, FormActions, SelectInput, TextInput } from "@/components/app/form";
import { newId } from "@/lib/store/local-store";
import type { TaskRecord } from "@/lib/store/entities";
import type { Category, Priority } from "@/lib/sample/data";

const PRIORITIES: { value: Priority; label: string; tone: string }[] = [
  { value: "must", label: "Must do", tone: "border-rose bg-rose-soft text-rose" },
  { value: "should", label: "Should do", tone: "border-amber bg-amber-soft text-amber" },
  { value: "could", label: "Nice to do", tone: "border-mint bg-mint-soft text-mint" },
];

const CATEGORIES: Category[] = ["Work", "Health", "Personal", "Learning", "Career"];

const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

/**
 * Add or edit a task. Passing `task` switches it to edit mode, so the same
 * form serves both rather than duplicating field layout and validation.
 */
export function TaskForm({
  open,
  onClose,
  onSubmit,
  task,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: TaskRecord) => void;
  task?: TaskRecord;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "should");
  const [category, setCategory] = useState<Category>(task?.category ?? "Work");
  const [minutes, setMinutes] = useState(task?.minutes ?? 30);
  const [due, setDue] = useState(task?.due ?? "Today");

  const editing = Boolean(task);
  const valid = title.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    onSubmit({
      id: task?.id ?? newId("task"),
      title: title.trim(),
      priority,
      category,
      minutes,
      due,
      done: task?.done ?? false,
      project: task?.project,
    });

    if (!editing) {
      setTitle("");
      setMinutes(30);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "Add a task"}
      description={
        editing ? undefined : "What needs to happen, and roughly how long it takes."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Task" htmlFor="task-title">
          <TextInput
            id="task-title"
            value={title}
            autoFocus
            placeholder="Finish authentication system"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Priority">
          <ChoiceRow
            name="Priority"
            value={priority}
            onChange={setPriority}
            options={PRIORITIES}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" htmlFor="task-category">
            <SelectInput
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </Field>

          <Field label="Estimate" htmlFor="task-minutes">
            <SelectInput
              id="task-minutes"
              value={String(minutes)}
              onChange={(e) => setMinutes(Number(e.target.value))}
              options={DURATIONS.map((d) => ({
                value: String(d),
                label: d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}` : `${d} min`,
              }))}
            />
          </Field>
        </div>

        <Field label="When" htmlFor="task-due">
          <SelectInput
            id="task-due"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            options={[
              { value: "Today", label: "Today" },
              { value: "Tomorrow", label: "Tomorrow" },
              { value: "This week", label: "This week" },
              { value: "Someday", label: "Someday" },
            ]}
          />
        </Field>

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? "Save changes" : "Add task"}
          disabled={!valid}
        />
      </form>
    </Modal>
  );
}
