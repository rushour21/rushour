"use client";

import { useState } from "react";
import { Modal } from "@/components/app/modal";
import { ChoiceRow, Field, FormActions, SelectInput, TextInput } from "@/components/app/form";
import { newId } from "@/lib/store/local-store";
import type { Habit } from "@/lib/sample/habits";

const ICONS = [
  { value: "sun", label: "Morning" },
  { value: "dumbbell", label: "Exercise" },
  { value: "laptop", label: "Work" },
  { value: "book", label: "Reading" },
  { value: "drop", label: "Water" },
  { value: "moon", label: "Sleep" },
];

const TONES: Habit["tone"][] = ["amber", "mint", "sky", "violet", "rose"];

const GOALS: { label: string; tone: Habit["goal"]["tone"] }[] = [
  { label: "Health", tone: "mint" },
  { label: "Career", tone: "sky" },
  { label: "Learning", tone: "amber" },
  { label: "Personal", tone: "violet" },
];

const FREQUENCIES = ["Daily", "4x per week", "3x per week", "Weekdays", "Weekends"];

export function HabitForm({
  open,
  onClose,
  onSubmit,
  habit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (habit: Habit) => void;
  habit?: Habit;
}) {
  const [name, setName] = useState(habit?.name ?? "");
  const [target, setTarget] = useState(habit?.target?.replace(/^Target:\s*/, "") ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? "sun");
  const [frequency, setFrequency] = useState(habit?.frequency ?? "Daily");
  const [goal, setGoal] = useState(habit?.goal.label ?? "Health");

  const editing = Boolean(habit);
  const valid = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const chosenGoal = GOALS.find((g) => g.label === goal) ?? GOALS[0];

    onSubmit({
      id: habit?.id ?? newId("habit"),
      name: name.trim(),
      target: target.trim() ? `Target: ${target.trim()}` : "No target set",
      icon,
      tone: habit?.tone ?? TONES[Math.floor(Math.random() * TONES.length)],
      done: habit?.done ?? false,
      value: habit?.value,
      frequency,
      streak: habit?.streak ?? 0,
      completion: habit?.completion ?? 0,
      goal: { label: chosenGoal.label, tone: chosenGoal.tone },
    });

    if (!editing) {
      setName("");
      setTarget("");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit habit" : "Add a habit"}
      description={editing ? undefined : "A repeated behaviour, with a target you can actually hit."}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Habit" htmlFor="habit-name">
          <TextInput
            id="habit-name"
            value={name}
            autoFocus
            placeholder="Wake up early"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Target" htmlFor="habit-target" hint="A time, a duration, or a count.">
          <TextInput
            id="habit-target"
            value={target}
            placeholder="6:30 AM"
            onChange={(e) => setTarget(e.target.value)}
          />
        </Field>

        <Field label="Icon">
          <ChoiceRow
            name="Icon"
            value={icon}
            onChange={setIcon}
            options={ICONS.map((i) => ({ value: i.value, label: i.label }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Frequency" htmlFor="habit-frequency">
            <SelectInput
              id="habit-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
            />
          </Field>

          <Field label="Linked goal" htmlFor="habit-goal">
            <SelectInput
              id="habit-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              options={GOALS.map((g) => ({ value: g.label, label: g.label }))}
            />
          </Field>
        </div>

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? "Save changes" : "Add habit"}
          disabled={!valid}
        />
      </form>
    </Modal>
  );
}
