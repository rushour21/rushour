import { QuoteCard } from "@/components/app/rail";
import { PageHead, Select, TabPills } from "@/components/app/bits";
import { LineChart, Spark } from "@/components/charts/spark";
import { IconBulb, IconHeart, IconLeaf, IconMoon, IconTrendUp } from "@/components/app/icons";

const STATS = [
  { label: "Sleep", value: "7h 12m", unit: "avg", delta: 12, tone: "sky" as const, bars: [62, 78, 55, 84, 70, 90, 66] },
  { label: "Steps", value: "8,432", unit: "avg", delta: 8, tone: "mint" as const, bars: [45, 70, 60, 88, 52, 76, 64] },
  { label: "Active Time", value: "1h 24m", unit: "avg", delta: 15, tone: "rose" as const, bars: [30, 55, 42, 68, 38, 72, 50] },
  { label: "Mood", value: "4.2", unit: "/5", delta: 6, tone: "mint" as const, bars: [60, 72, 66, 80, 74, 86, 78] },
];

const INSIGHTS = [
  { id: "1", tone: "mint", text: "You slept 44 min more this week." },
  { id: "2", tone: "sky", text: "Your activity is up by 15%." },
  { id: "3", tone: "amber", text: "Your stress levels are lower." },
  { id: "4", tone: "violet", text: "Keep going! You're on track." },
];

export default function HealthPage() {
  return (
    <div className="max-w-[1400px] mx-auto pt-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHead
          eyebrow="Health"
          title="A healthier you, a happier tomorrow."
          subtitle="Track your physical and mental well-being."
        />
        <Select label="This Week" />
      </div>

      <TabPills tabs={["Overview", "Sleep", "Activity", "Nutrition", "Mood", "Stress"]} />

      <div className="mt-5 grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-surface border border-line rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-semibold text-ink-soft">{s.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold tnum tracking-[-0.02em] leading-none">
              {s.value}
              <span className="text-[12px] font-medium text-ink-faint ml-1">{s.unit}</span>
            </p>
            <p className="mt-1.5 text-[12px] font-semibold text-mint tnum">&uarr; {s.delta}%</p>
            <div className="mt-3">
              <Spark values={s.bars} tone={s.tone} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4 items-start">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold">Sleep Trend</h2>
          <p className="mt-1 text-[22px] font-extrabold tnum tracking-[-0.02em]">7h 12m</p>
          <p className="text-[12.5px] text-ink-soft mb-4">Average sleep this week</p>
          <LineChart
            values={[6.8, 7.4, 6.9, 7.8, 7.1, 7.9, 7.2]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            unit="h"
            height={150}
          />
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold mb-4">Health Insights</h2>
          <ul className="flex flex-col gap-3">
            {INSIGHTS.map((i, n) => (
              <li key={i.id} className="flex gap-3">
                <span className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${TONE[i.tone as keyof typeof TONE]}`}>
                  <span className="scale-[0.7]">
                    {[<IconMoon key="a" />, <IconTrendUp key="b" />, <IconLeaf key="c" />, <IconHeart key="d" />][n]}
                  </span>
                </span>
                <p className="text-[13.5px] text-ink-soft leading-snug pt-1.5">{i.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl bg-surface-2 p-3.5 flex gap-2.5">
            <span className="text-ink-faint shrink-0">
              <IconBulb className="w-[18px] h-[18px]" />
            </span>
            <p className="text-[12px] text-ink-soft leading-snug">
              Wellness information, not medical advice. Persistent symptoms are worth
              discussing with a clinician.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-4 max-w-[420px]">
        <QuoteCard text="Small steps. Bigger tomorrows." />
      </div>
    </div>
  );
}

const TONE = {
  mint: "bg-mint-soft text-mint",
  sky: "bg-sky-soft text-sky",
  amber: "bg-amber-soft text-amber",
  violet: "bg-violet-soft text-violet",
};
