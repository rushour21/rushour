import { DateNav, QuoteCard } from "@/components/app/rail";
import { Button } from "@/components/app/bits";
import { PriorityGroup } from "@/components/plan/priority-group";
import { Timeline } from "@/components/plan/timeline";
import {
  IconBolt,
  IconBookmark,
  IconBulb,
  IconCheck,
  IconClock,
  IconHeart,
  IconInfo,
  IconPlay,
  IconPlus,
  IconSpark,
  IconTarget,
  IconArrow,
} from "@/components/app/icons";
import { CAPACITY, DAY_INSIGHTS, hm, OUTCOME, PLAN_BLOCKS, TASKS } from "@/lib/sample/data";

export default function PlanPage() {
  const pct = Math.round((CAPACITY.plannedMin / CAPACITY.availableMin) * 100);
  const over = CAPACITY.plannedMin > CAPACITY.availableMin;

  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 pt-1">
      <div className="min-w-0 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <DateNavInline />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] sm:text-[38px] font-extrabold tracking-[-0.035em] leading-[1.05]">
              Plan your day
            </h1>
            <p className="mt-1.5 text-[15.5px] text-ink-soft">
              Make today realistic, not overwhelming.
            </p>
          </div>
          <blockquote className="hidden md:block text-right text-[13.5px] italic text-ink-soft leading-relaxed max-w-[210px]">
            &ldquo;A well planned day leads to a better tomorrow.&rdquo;
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Outcome */}
          <section className="rounded-2xl border border-line bg-gradient-to-br from-[#fff1f2] to-[#fff7ed] p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="flex items-center gap-2 text-[14px] font-bold">
                <span className="text-rose">
                  <IconTarget />
                </span>
                Today&rsquo;s main outcome
              </p>
              <button className="text-[13px] font-semibold text-brand hover:opacity-80">
                Edit
              </button>
            </div>
            <h2 className="text-[19px] font-extrabold tracking-[-0.02em] leading-snug">
              {OUTCOME.title}
            </h2>
            <p className="mt-1.5 text-[14px] text-ink-soft leading-relaxed">{OUTCOME.detail}</p>
          </section>

          {/* Capacity */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="flex items-center gap-2 text-[14px] font-bold">
                <span className="text-amber">
                  <IconBolt />
                </span>
                Your capacity
                <span className="text-ink-faint" title="Time between clocking in and your planned finish, less a buffer.">
                  <IconInfo className="w-4 h-4" />
                </span>
              </p>
              <button className="text-[13px] font-semibold text-brand hover:opacity-80">
                Adjust
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[12.5px] text-ink-soft mb-0.5">Available</p>
                <p className="text-[22px] font-extrabold tnum tracking-[-0.02em]">
                  {hm(CAPACITY.availableMin)}
                </p>
              </div>
              <div>
                <p className="text-[12.5px] text-ink-soft mb-0.5">Planned</p>
                <p className="text-[22px] font-extrabold tnum tracking-[-0.02em]">
                  {hm(CAPACITY.plannedMin)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                <span
                  className={`block h-full rounded-full ${over ? "bg-rose" : "bg-mint"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </span>
              <span className="text-[13px] font-bold tnum text-ink-soft">{pct}%</span>
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <PriorityGroup priority="must" tasks={TASKS.filter((t) => t.priority === "must")} />
            <PriorityGroup priority="should" tasks={TASKS.filter((t) => t.priority === "should")} />
            <PriorityGroup priority="could" tasks={TASKS.filter((t) => t.priority === "could")} />
          </div>

          <section className="rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] min-w-0">
            <div className="flex items-center justify-between gap-3 px-5 pt-4.5 pb-3">
              <h2 className="text-[16px] font-bold">Your plan</h2>
              <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand-soft text-brand text-[13px] font-semibold hover:opacity-80 transition-opacity">
                <IconSpark className="w-4 h-4" />
                Auto schedule
              </button>
            </div>
            <div className="px-5 pb-5">
              <Timeline blocks={PLAN_BLOCKS} />
            </div>
          </section>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button className="flex-1 min-w-[240px] h-14 text-[16px] rounded-2xl">
            <IconPlay className="w-5 h-5" />
            Start My Day
            <IconArrow className="w-[18px] h-[18px]" />
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl px-6">
            <IconBookmark className="w-[18px] h-[18px]" />
            Save Plan
          </Button>
        </div>
      </div>

      {/* Right rail */}
      <aside className="flex flex-col gap-4 min-w-0">
        <DateNav date={new Date()} />

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="flex items-center gap-2 text-[15px] font-bold mb-3.5">
            <span className="text-amber">
              <IconBulb />
            </span>
            Day insights
          </p>
          <ul className="flex flex-col gap-3">
            {DAY_INSIGHTS.map((i) => (
              <li key={i.id} className="flex gap-2.5">
                <span className={`w-6 h-6 rounded-lg grid place-items-center shrink-0 ${INSIGHT_TONE[i.tone]}`}>
                  <span className="scale-[0.62]">{INSIGHT_ICON[i.tone]}</span>
                </span>
                <p className="text-[13.5px] leading-snug text-ink-soft pt-0.5">{i.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-[#efeaff] to-[#e6ecff] border border-violet/20 p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-bold text-violet mb-2">
            <IconSpark className="w-[18px] h-[18px]" />
            Need help prioritizing?
          </p>
          <p className="text-[13.5px] text-ink-soft leading-relaxed mb-4">
            You&rsquo;ve added 7h 15m of tasks but only have {hm(CAPACITY.availableMin)} available.
          </p>
          <Button className="w-full">
            Prioritize for me
            <IconArrow className="w-[18px] h-[18px]" />
          </Button>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-[15px] font-bold mb-3">Quick actions</p>
          <ul className="flex flex-col">
            {[
              { icon: <IconPlus />, label: "Add task" },
              { icon: <IconClock />, label: "Time block" },
              { icon: <IconHeart />, label: "Break" },
              { icon: <IconCheck />, label: "Focus mode" },
            ].map((a) => (
              <li key={a.label}>
                <button className="w-full flex items-center gap-3 py-2.5 text-[14px] font-medium text-ink hover:text-brand transition-colors border-b border-line last:border-b-0">
                  <span className="text-ink-soft">{a.icon}</span>
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <QuoteCard text="A well planned day leads to a better tomorrow." />
      </aside>
    </div>
  );
}

const INSIGHT_TONE = {
  mint: "bg-mint-soft text-mint",
  sky: "bg-sky-soft text-sky",
  rose: "bg-rose-soft text-rose",
  amber: "bg-amber-soft text-amber",
};
const INSIGHT_ICON = {
  mint: <IconCheck />,
  sky: <IconTarget />,
  rose: <IconHeart />,
  amber: <IconBulb />,
};

function DateNavInline() {
  const today = new Date();
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-ink-soft">
        <IconBookmark className="w-[18px] h-[18px]" />
      </span>
      <p className="text-[15px] font-bold" suppressHydrationWarning>
        {today.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <button
        className="h-9 px-4 rounded-xl bg-surface-2 text-[13px] font-semibold hover:bg-surface-3 transition-colors"
        type="button"
      >
        Today
      </button>
    </div>
  );
}
