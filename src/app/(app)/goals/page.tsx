import { QuoteCard } from "@/components/app/rail";
import { Button, Donut, Legend, PageHead, TabPills } from "@/components/app/bits";
import { GoalCard } from "@/components/goals/goal-card";
import {
  IconArrow,
  IconBook,
  IconHeart,
  IconLaptop,
  IconPlus,
  IconSpark,
  IconSuitcase,
  IconTarget,
} from "@/components/app/icons";
import { MONTH_FOCUS, YEAR_GOALS } from "@/lib/sample/goals";

const GOAL_ICON: Record<string, React.ReactNode> = {
  y1: <IconLaptop />,
  y2: <IconHeart />,
  y3: <IconBook />,
  y4: <IconSuitcase />,
};

export default function GoalsPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 pt-1">
      <div className="min-w-0">
        <PageHead
          eyebrow="Goals"
          title="Turn your ambitions into a clear path."
          subtitle="Set meaningful goals, break them down, and make consistent progress."
          action={
            <Button>
              <IconPlus className="w-[18px] h-[18px]" />
              Create Goal
            </Button>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <TabPills
            tabs={["All Goals", "Active", "Completed", "Personal", "Career", "Health", "Learning"]}
          />
          <blockquote className="hidden lg:block text-right text-[13px] italic text-ink-soft leading-relaxed max-w-[200px]">
            &ldquo;A goal without a plan is just a wish.&rdquo;
            <cite className="block not-italic text-[12px] text-ink-faint mt-1">
              — Antoine de Saint-Exupéry
            </cite>
          </blockquote>
        </div>

        <div className="flex flex-col gap-4">
          {YEAR_GOALS.map((g) => (
            <GoalCard key={g.id} goal={g} icon={GOAL_ICON[g.id]} />
          ))}
        </div>

        <section className="mt-7">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-[-0.02em]">
                This Month&rsquo;s Focus
              </h2>
              <p className="text-[13.5px] text-ink-soft mt-0.5">
                Key milestones you&rsquo;re working on in September.
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80 shrink-0">
              View all
              <IconArrow className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {MONTH_FOCUS.map((m, i) => (
              <div
                key={m.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${FOCUS_TONE[m.tone].chip}`}
                  >
                    <span className="scale-[0.8]">{[<IconLaptop key="a" />, <IconHeart key="b" />, <IconBook key="c" />][i]}</span>
                  </span>
                  <p className="text-[14px] font-bold leading-snug min-w-0">{m.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <span
                      className={`block h-full rounded-full ${FOCUS_TONE[m.tone].bar}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </span>
                  <span className="text-[12px] font-bold tnum text-ink-soft">{m.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-bold mb-4">Overall Progress</h2>
          <div className="flex items-center gap-4">
            <Donut
              segments={[
                { label: "On track", value: 3, color: "#16a34a" },
                { label: "At risk", value: 1, color: "#f59e0b" },
                { label: "Behind", value: 1, color: "#f43f5e" },
                { label: "Completed", value: 1, color: "#cbd5e1" },
              ]}
              centerValue="58%"
              centerLabel="Goal completion"
              size={124}
            />
            <Legend
              items={[
                { label: "On track", value: 3, color: "#16a34a" },
                { label: "At risk", value: 1, color: "#f59e0b" },
                { label: "Behind", value: 1, color: "#f43f5e" },
                { label: "Completed", value: 1, color: "#cbd5e1" },
              ]}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold">Active Goals</p>
            <p className="text-[32px] font-extrabold tnum leading-none mt-2">4</p>
            <p className="text-[13px] text-ink-soft mt-1.5">Out of 6 total goals</p>
          </div>
          <span className="w-11 h-11 rounded-xl grid place-items-center bg-sky-soft text-sky shrink-0">
            <IconTarget />
          </span>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold">Milestones Completed</p>
              <p className="text-[32px] font-extrabold tnum leading-none mt-2">10 / 20</p>
            </div>
            <span className="w-11 h-11 rounded-xl grid place-items-center bg-violet-soft text-violet shrink-0">
              <IconTarget />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <span className="block h-full rounded-full bg-mint" style={{ width: "50%" }} />
            </span>
            <span className="text-[12px] font-bold tnum text-ink-soft">50%</span>
          </div>
        </section>

        <section className="rounded-2xl border border-rose/25 bg-rose-soft p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-bold text-rose mb-2.5">
            <IconTarget className="w-[18px] h-[18px]" />
            Goal at Risk
          </p>
          <p className="text-[15px] font-bold">System Design Skills</p>
          <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">
            You planned 8 sessions but completed 3. You&rsquo;re behind schedule.
          </p>
          <button className="mt-4 w-full h-11 rounded-xl bg-surface text-rose font-semibold text-[14px] inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            View Plan
            <IconArrow className="w-4 h-4" />
          </button>
        </section>

        <section className="rounded-2xl border border-brand/20 bg-brand-soft p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-bold text-brand mb-2.5">
            <IconSpark className="w-[18px] h-[18px]" />
            AI Suggestion
          </p>
          <p className="text-[13.5px] text-ink-soft leading-relaxed">
            Based on your progress, consider breaking down &lsquo;System Design Skills&rsquo; into
            smaller weekly milestones.
          </p>
          <Button className="mt-4 w-full">
            Generate Plan
            <IconArrow className="w-[18px] h-[18px]" />
          </Button>
        </section>

        <QuoteCard text="Small steps. Bigger tomorrows." />
      </aside>
    </div>
  );
}

const FOCUS_TONE = {
  mint: { chip: "bg-mint-soft text-mint", bar: "bg-mint" },
  amber: { chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  violet: { chip: "bg-violet-soft text-violet", bar: "bg-violet" },
};
