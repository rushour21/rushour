"use client";

import { useState } from "react";
import { GoalCard } from "./goal-card";
import { GoalForm } from "./goal-form";
import { ConfirmDialog } from "@/components/app/modal";
import { Button, TabPills } from "@/components/app/bits";
import {
  IconBook,
  IconHeart,
  IconLaptop,
  IconPlus,
  IconSuitcase,
} from "@/components/app/icons";
import { goalStore } from "@/lib/store/entities";
import type { Goal } from "@/lib/sample/goals";

const ICONS = [<IconLaptop key="a" />, <IconHeart key="b" />, <IconBook key="c" />, <IconSuitcase key="d" />];

const TABS = ["All Goals", "Active", "Completed", "Personal", "Career", "Health", "Learning"];

export function GoalsView() {
  const goals = goalStore.useItems();

  const [tab, setTab] = useState(TABS[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>();
  const [deleting, setDeleting] = useState<Goal | undefined>();

  const visible = goals.filter((g) => {
    if (tab === "All Goals") return true;
    if (tab === "Active") return g.status !== "done";
    if (tab === "Completed") return g.status === "done";
    return g.tags.includes(tab);
  });

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-ink-faint">
            Goals
          </p>
          <h1 className="mt-2 text-[28px] sm:text-[32px] font-extrabold tracking-[-0.03em] leading-[1.1] text-balance">
            Turn your ambitions into a clear path.
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">
            Set meaningful goals, break them down, and make consistent progress.
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="w-[18px] h-[18px]" />
          Create Goal
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <TabPills tabs={TABS} value={tab} onChange={setTab} />
        <blockquote className="hidden lg:block text-right text-[13px] italic text-ink-soft leading-relaxed max-w-[200px]">
          &ldquo;A goal without a plan is just a wish.&rdquo;
          <cite className="block not-italic text-[12px] text-ink-faint mt-1">
            — Antoine de Saint-Exupéry
          </cite>
        </blockquote>
      </div>

      <div className="flex flex-col gap-4">
        {visible.length === 0 && (
          <p className="rounded-2xl border border-line bg-surface p-8 text-center text-[14px] text-ink-soft">
            No goals here yet.
          </p>
        )}
        {visible.map((g, i) => (
          <GoalCard
            key={g.id}
            goal={g}
            icon={ICONS[i % ICONS.length]}
            onEdit={() => {
              setEditing(g);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(g)}
          />
        ))}
      </div>

      <GoalForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(g) => (editing ? goalStore.update(g.id, g) : goalStore.add(g))}
        goal={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        onConfirm={() => deleting && goalStore.remove(deleting.id)}
        title="Delete goal?"
        body={`"${deleting?.title ?? ""}" and its milestones will be removed. This can't be undone.`}
      />
    </>
  );
}
