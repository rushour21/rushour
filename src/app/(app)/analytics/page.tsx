import { PageHead, Select, TabPills } from "@/components/app/bits";
import { QuoteCard } from "@/components/app/rail";
import { BarRow, DeltaStat } from "@/components/charts/spark";
import { ComboChart } from "@/components/charts/combo";
import { IconBulb, IconTrophy } from "@/components/app/icons";

const TREND = [
  { tasks: 5, focus: 3.2 }, { tasks: 3, focus: 2.1 }, { tasks: 7, focus: 4.4 },
  { tasks: 4, focus: 3.0 }, { tasks: 8, focus: 5.1 }, { tasks: 6, focus: 3.8 },
  { tasks: 2, focus: 1.4 }, { tasks: 9, focus: 5.6 }, { tasks: 6, focus: 4.0 },
  { tasks: 4, focus: 2.6 }, { tasks: 7, focus: 4.8 }, { tasks: 5, focus: 3.4 },
  { tasks: 10, focus: 6.2 }, { tasks: 6, focus: 4.1 }, { tasks: 3, focus: 2.2 },
  { tasks: 8, focus: 5.0 }, { tasks: 5, focus: 3.6 }, { tasks: 7, focus: 4.5 },
  { tasks: 9, focus: 5.8 }, { tasks: 4, focus: 2.9 }, { tasks: 6, focus: 4.2 },
  { tasks: 11, focus: 6.4 }, { tasks: 5, focus: 3.3 }, { tasks: 7, focus: 4.6 },
  { tasks: 8, focus: 5.2 }, { tasks: 12, focus: 6.3 }, { tasks: 6, focus: 3.9 },
  { tasks: 4, focus: 2.8 }, { tasks: 9, focus: 5.4 }, { tasks: 7, focus: 4.7 },
];

const CATEGORIES = [
  { label: "Work", pct: 42, tone: "sky" as const },
  { label: "Learning", pct: 24, tone: "amber" as const },
  { label: "Health", pct: 18, tone: "mint" as const },
  { label: "Personal", pct: 16, tone: "violet" as const },
];

const IMPROVE = [
  "Sleep consistency",
  "More focus sessions",
  "Be consistent with reading",
  "Reduce social media time",
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-[1400px] mx-auto pt-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHead
          eyebrow="Analytics"
          title="See your progress, stay motivated."
          subtitle="Data-driven insights to help you improve."
        />
        <Select label="Last 30 Days" />
      </div>

      <TabPills tabs={["Overview", "Productivity", "Habits", "Health", "Focus", "Goals"]} />

      <div className="mt-5 grid grid-cols-2 xl:grid-cols-4 gap-4">
        <DeltaStat label="Productive Days" value="22 / 30" delta={12} />
        <DeltaStat label="Avg. Focus Time" value="4h 12m" delta={18} />
        <DeltaStat label="Tasks Completed" value="68" delta={24} />
        <DeltaStat label="Habit Consistency" value="72 %" delta={16} />
      </div>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-[16px] font-bold">Productivity Trend</h2>
          <div className="flex items-center gap-4 text-[12px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" aria-hidden="true" />
              Tasks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky" aria-hidden="true" />
              Focus Time
            </span>
          </div>
        </div>
        <ComboChart
          data={TREND}
          labels={["1 Sep", "5 Sep", "10 Sep", "15 Sep", "20 Sep", "25 Sep", "30 Sep"]}
        />
      </section>

      <div className="mt-4 grid lg:grid-cols-3 gap-4 items-start">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold mb-4">Top Categories</h2>
          <div className="flex flex-col gap-3">
            {CATEGORIES.map((c) => (
              <BarRow key={c.label} label={c.label} pct={c.pct} tone={c.tone} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-gradient-to-b from-[#fef4e2] to-[#fff9ee] dark:from-[#2a2011] dark:to-[#221a0e] p-5 text-center">
          <h2 className="text-[16px] font-bold mb-3">Best Day</h2>
          <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-surface text-amber mb-3">
            <IconTrophy />
          </span>
          <p className="text-[18px] font-extrabold tracking-[-0.02em]">Fri, 26 Sep</p>
          <p className="mt-2 text-[13px] text-ink-soft">12 tasks completed</p>
          <p className="text-[13px] text-ink-soft">6h 20m focus time</p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold mb-4">Improvement Areas</h2>
          <ul className="flex flex-col gap-3">
            {IMPROVE.map((i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-7 h-7 rounded-lg grid place-items-center bg-amber-soft text-amber shrink-0">
                  <IconBulb className="w-4 h-4" />
                </span>
                <p className="text-[13.5px] text-ink-soft leading-snug pt-1">{i}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 max-w-[420px]">
        <QuoteCard text="Small steps. Bigger tomorrows." />
      </div>
    </div>
  );
}
