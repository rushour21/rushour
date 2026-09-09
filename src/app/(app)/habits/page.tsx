import { QuoteCard } from "@/components/app/rail";
import { Select } from "@/components/app/bits";
import { HabitsView } from "@/components/habits/habits-view";
import { WeekGrid } from "@/components/habits/week-grid";
import { BarSeries } from "@/components/charts/bar-series";
import {
  IconArrow,
  IconBulb,
  IconFlame,
  IconLeaf,
  IconMoon,
  IconPlus,
  IconTrendDown,
} from "@/components/app/icons";
import { COMPLETION_BARS, HABIT_INSIGHTS, WEEK_GRID } from "@/lib/sample/habits";

export default function HabitsPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 pt-1">
      <div className="min-w-0">
        <HabitsView />

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-[16px] font-bold">Weekly Progress</h2>
                <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
                  View Details
                  <IconArrow className="w-4 h-4" />
                </button>
              </div>
              <WeekGrid rows={WEEK_GRID} />
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-[16px] font-bold">Habit Completion Rate</h2>
                <Select label="This Month" />
              </div>
              <BarSeries
                values={COMPLETION_BARS}
                labels={["1 Sep", "8 Sep", "15 Sep", "22 Sep", "30 Sep"]}
                yTicks={["100%", "50%", "0%"]}
              />
            </section>
          </div>
        </div>

      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <QuoteCard text="“We are what we repeatedly do.” — Aristotle" />

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-bold mb-4">Habit Streaks</h2>
          <div className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl grid place-items-center bg-amber-soft text-amber shrink-0">
              <IconFlame />
            </span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[26px] font-extrabold tnum leading-none">3</p>
                <p className="text-[12px] text-ink-soft mt-1">Current Streak</p>
              </div>
              <div className="border-l border-line pl-3">
                <p className="text-[26px] font-extrabold tnum leading-none">12</p>
                <p className="text-[12px] text-ink-soft mt-1">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-mint-soft p-3.5 flex gap-2.5">
            <span className="text-mint shrink-0">
              <IconLeaf className="w-[18px] h-[18px]" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">You&rsquo;re on a 3-day streak!</p>
              <p className="text-[12.5px] text-ink-soft mt-0.5">
                Keep going. Consistency compounds.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <h2 className="text-[15px] font-bold">Insights</h2>
            <Select label="This Week" />
          </div>
          <ul className="flex flex-col gap-3">
            {HABIT_INSIGHTS.map((i) => (
              <li key={i.id} className={`flex gap-3 rounded-xl p-3 ${INSIGHT_BG[i.tone]}`}>
                <span className={`shrink-0 ${INSIGHT_INK[i.tone]}`}>
                  {i.icon === "down" ? <IconTrendDown className="w-[18px] h-[18px]" /> : i.icon === "moon" ? <IconMoon className="w-[18px] h-[18px]" /> : <IconBulb className="w-[18px] h-[18px]" />}
                </span>
                <p className="text-[13px] leading-snug text-ink-soft">{i.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex gap-3 mb-4">
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-brand-soft text-brand shrink-0">
              <IconPlus />
            </span>
            <div>
              <p className="text-[14.5px] font-bold">Create a New Habit</p>
              <p className="text-[12.5px] text-ink-soft mt-0.5 leading-snug">
                Start a new habit and make progress towards a better you.
              </p>
            </div>
          </div>
          <button className="w-full h-11 rounded-xl bg-brand-soft text-brand font-semibold text-[14px] inline-flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <IconPlus className="w-[18px] h-[18px]" />
            Create Habit
          </button>
        </section>

        <QuoteCard text="Discipline today. A brighter tomorrow." />
      </aside>
    </div>
  );
}

const INSIGHT_BG = {
  rose: "bg-rose-soft",
  violet: "bg-violet-soft",
  amber: "bg-amber-soft",
};
const INSIGHT_INK = {
  rose: "text-rose",
  violet: "text-violet",
  amber: "text-amber",
};
