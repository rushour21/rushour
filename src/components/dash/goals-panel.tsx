"use client";

import { GoalList } from "./goal-list";
import { StatCard } from "./stat-cards";
import { IconBook, IconHeart, IconLaptop, IconSuitcase, IconTarget } from "@/components/app/icons";
import { goalStore } from "@/lib/store/entities";

const ICONS = [<IconLaptop key="a" />, <IconHeart key="b" />, <IconBook key="c" />, <IconSuitcase key="d" />];

/** "Goals in progress" stat card, reading the live store instead of a fixed "2 / 4". */
export function GoalsStat() {
  const goals = goalStore.useItems();
  const active = goals.filter((g) => g.status !== "done");
  const total = Math.max(goals.length, 1);

  return (
    <StatCard
      icon={<IconTarget />}
      value={`${active.length} / ${goals.length}`}
      label="Goals in progress"
      pct={Math.round((active.length / total) * 100)}
      tone="violet"
    />
  );
}

/** The Dashboard "Your Goals" panel body, reading the same store as /goals. */
export function GoalsPanel() {
  const goals = goalStore.useItems().slice(0, 3);

  return (
    <GoalList
      goals={goals.map((g, i) => ({
        id: g.id,
        title: g.title,
        subtitle: g.detail,
        pct: g.pct,
        tone: g.tone,
        icon: ICONS[i % ICONS.length],
      }))}
    />
  );
}
