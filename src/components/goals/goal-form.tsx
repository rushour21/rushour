"use client";

import { useState } from "react";
import { Modal } from "@/components/app/modal";
import { ChoiceRow, Field, FormActions, SelectInput, TextInput } from "@/components/app/form";
import { newId } from "@/lib/store/local-store";
import type { Goal } from "@/lib/sample/goals";

const PRIORITIES = [
  { value: "High" as const, label: "High", tone: "border-rose bg-rose-soft text-rose" },
  { value: "Medium" as const, label: "Medium", tone: "border-amber bg-amber-soft text-amber" },
  { value: "Low" as const, label: "Low", tone: "border-mint bg-mint-soft text-mint" },
];

const TONES = ["sky", "rose", "amber", "violet"] as const;
const TAGS = ["Career", "Learning", "Health", "Personal"];

export function GoalForm({
  open,
  onClose,
  onSubmit,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (goal: Goal) => void;
  goal?: Goal;
}) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [detail, setDetail] = useState(goal?.detail ?? "");
  const [priority, setPriority] = useState<Goal["priority"]>(goal?.priority ?? "High");
  const [tag, setTag] = useState(goal?.tags[0] ?? "Career");

  const editing = Boolean(goal);
  const valid = title.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    onSubmit({
      id: goal?.id ?? newId("goal"),
      title: title.trim(),
      detail: detail.trim(),
      tags: [tag],
      priority,
      milestones: goal?.milestones ?? [],
      tone: goal?.tone ?? TONES[Math.floor(Math.random() * TONES.length)],
    });

    if (!editing) {
      setTitle("");
      setDetail("");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit goal" : "Create a goal"}
      description={editing ? undefined : "A year-level direction. Add milestones once it's created."}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Goal" htmlFor="goal-title">
          <TextInput
            id="goal-title"
            value={title}
            autoFocus
            placeholder="Become a stronger AI Engineer"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="What does it mean?" htmlFor="goal-detail">
          <TextInput
            id="goal-detail"
            value={detail}
            placeholder="Build deep expertise and land a great opportunity."
            onChange={(e) => setDetail(e.target.value)}
          />
        </Field>

        <Field label="Priority">
          <ChoiceRow name="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
        </Field>

        <Field label="Area" htmlFor="goal-tag">
          <SelectInput
            id="goal-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            options={TAGS.map((t) => ({ value: t, label: t }))}
          />
        </Field>

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? "Save changes" : "Create goal"}
          disabled={!valid}
        />
      </form>
    </Modal>
  );
}
