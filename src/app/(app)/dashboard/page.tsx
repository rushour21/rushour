import Link from "next/link";
import { Hero } from "@/components/dash/hero";
import { StatCard } from "@/components/dash/stat-cards";
import { Panel } from "@/components/dash/panel";
import { TaskList } from "@/components/dash/task-list";
import { GoalList } from "@/components/dash/goal-list";
import { DateNav } from "@/components/app/rail";
import { WeekBars } from "@/components/dash/week-bars";
import { Donut, Legend } from "@/components/app/bits";
import {
  IconArrow,
  IconCheck,
  IconClock,
  IconFlame,
  IconHeart,
  IconLaptop,
  IconLeaf,
  IconTarget,
  IconBook,
} from "@/components/app/icons";
import {
  FOCUS_SPLIT,
  GOALS,
  hm,
  PLAN_BLOCKS,
  TASKS,
  WEEK_BARS,
} from "@/lib/sample/data";

export default function DashboardPage() {
  const done = TASKS.filter((t) => t.done).length;
  const focusMin = FOCUS_SPLIT.reduce((n, f) => n + f.value, 0);

  const goalIcons = {
    g1: <IconLaptop />,
    g2: <IconHeart />,
    g3: <IconBook />,
  } as Record<string, React.ReactNode>;

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5 pt-1">
      <Hero firstName="Rushabh" cta={{ label: "Plan my day", href: "/plan" }} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<IconCheck />}
          value={`${done} / ${TASKS.length}`}
          label="Tasks completed"
          pct={Math.round((done / TASKS.length) * 100)}
          tone="mint"
        />
        <StatCard
          icon={<IconTarget />}
          value="2 / 4"
          label="Goals in progress"
          pct={50}
          tone="violet"
        />
        <StatCard
          icon={<IconFlame />}
          value="6 days"
          label="Current streak"
          pct={60}
          tone="amber"
        />
        <StatCard
          icon={<IconClock />}
          value={hm(focusMin)}
          label="Focus time today"
          pct={Math.round((focusMin / 360) * 100)}
          tone="sky"
        />
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <Panel title="Today's Tasks" action={{ label: "View all", href: "/tasks" }}>
          <TaskList
            tasks={TASKS.slice(0, 5).map((t) => ({
              id: t.id,
              title: t.title,
              time: t.due,
              category: t.category,
              done: t.done,
            }))}
          />
        </Panel>

        <Panel title="Your Goals" action={{ label: "View all", href: "/goals" }}>
          <GoalList goals={GOALS.map((g) => ({ ...g, icon: goalIcons[g.id] }))} />
        </Panel>

        <div className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
          <DateNav date={new Date()} />
          <Panel title="Up next">
            <ul className="flex flex-col">
              {PLAN_BLOCKS.slice(0, 5).map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 py-2.5 border-b border-line last:border-b-0"
                >
                  <span className="text-[12.5px] text-ink-soft tnum w-[62px] shrink-0">
                    {b.time}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: BLOCK_DOT[b.kind] }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 min-w-0 truncate text-[14px] font-medium">
                    {b.title}
                  </span>
                  <span className="text-[12.5px] text-ink-soft tnum shrink-0">
                    {hm(b.minutes)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <Panel title="Focus Time">
          <div className="flex items-center gap-5">
            <Donut
              segments={FOCUS_SPLIT}
              centerValue={hm(focusMin)}
              centerLabel="of 6h"
              size={132}
            />
            <Legend
              items={FOCUS_SPLIT.map((f) => ({
                label: f.label,
                value: hm(f.value),
                color: f.color,
              }))}
            />
          </div>
        </Panel>

        <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#e6f7ee] to-[#d5f0e2] p-6 min-h-[190px] grid place-items-center text-center">
          <div className="relative z-10">
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-white/70 text-mint mb-3">
              <IconLeaf />
            </span>
            <p className="text-[18px] font-extrabold tracking-[-0.02em]">
              You&rsquo;re doing great!
            </p>
            <p className="mt-1.5 text-[13.5px] text-ink-soft max-w-[26ch] mx-auto">
              Consistency today creates the life you want tomorrow.
            </p>
          </div>
          <svg viewBox="0 0 300 70" className="absolute bottom-0 inset-x-0 w-full" aria-hidden="true">
            <path d="M0 48 60 30 120 46 190 24 250 42 300 28V70H0z" fill="#8fd8b0" opacity="0.45" />
            <path d="M0 60 70 46 140 60 210 42 300 56V70H0z" fill="#6cc79a" opacity="0.5" />
          </svg>
        </section>

        <Panel title="This Week" action={{ label: "View all", href: "/analytics" }}>
          <div className="flex items-end gap-4">
            <div className="flex-1 min-w-0 h-[130px]">
              <WeekBars data={WEEK_BARS} />
            </div>

            <ul className="flex flex-col gap-3 shrink-0">
              <WeekStat tone="mint" icon={<IconCheck />} value="18" label="tasks completed" />
              <WeekStat tone="sky" icon={<IconClock />} value="6h 30m" label="focus time" />
              <WeekStat tone="violet" icon={<IconTarget />} value="3" label="goals updated" />
            </ul>
          </div>
        </Panel>
      </div>

      <Link
        href="/plan"
        className="self-start inline-flex items-center gap-2 text-[14px] font-semibold text-brand hover:opacity-80"
      >
        Plan tomorrow
        <IconArrow className="w-4 h-4" />
      </Link>
    </div>
  );
}

const BLOCK_DOT: Record<string, string> = {
  deep: "#3b82f6",
  meeting: "#8b5cf6",
  break: "#94a3b8",
  health: "#16a34a",
  admin: "#f59e0b",
};

function WeekStat({
  tone,
  icon,
  value,
  label,
}: {
  tone: "mint" | "sky" | "violet";
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const chip = {
    mint: "bg-mint-soft text-mint",
    sky: "bg-sky-soft text-sky",
    violet: "bg-violet-soft text-violet",
  }[tone];

  return (
    <li className="flex items-center gap-2.5">
      <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${chip}`}>
        <span className="scale-[0.8]">{icon}</span>
      </span>
      <span className="text-[13px]">
        <b className="font-bold tnum">{value}</b>{" "}
        <span className="text-ink-soft">{label}</span>
      </span>
    </li>
  );
}
