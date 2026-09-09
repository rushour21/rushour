import Link from "next/link";
import { Hero } from "@/components/dash/hero";
import { Panel } from "@/components/dash/panel";
import { TodayTasks } from "@/components/dash/today-tasks";
import { TaskStat } from "@/components/dash/task-stat";
import { GoalsPanel, GoalsStat } from "@/components/dash/goals-panel";
import { StreakStat } from "@/components/dash/streak-stat";
import { TodayFocusStat } from "@/components/dash/today-focus";
import { UpNext } from "@/components/dash/up-next";
import { WeekActivity } from "@/components/dash/week-activity";
import { DateNav } from "@/components/app/rail";
import { IconArrow, IconLeaf } from "@/components/app/icons";

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5 pt-1">
      <Hero firstName="there" cta={{ label: "Plan my day", href: "/plan" }} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <TaskStat />
        <GoalsStat />
        <StreakStat />
        <TodayFocusStat />
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <Panel title="Today's Tasks" action={{ label: "View all", href: "/tasks" }}>
          <TodayTasks />
        </Panel>

        <Panel title="Your Goals" action={{ label: "View all", href: "/goals" }}>
          <GoalsPanel />
        </Panel>

        <div className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
          <DateNav date={new Date()} />
          <Panel title="Up next">
            <UpNext />
          </Panel>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
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
          <WeekActivity />
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
