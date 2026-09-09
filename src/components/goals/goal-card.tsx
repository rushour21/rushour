import { IconArrow, IconBookmark, IconCheck, IconNote } from "@/components/app/icons";
import type { Goal } from "@/lib/sample/goals";

const TONE = {
  sky: { wash: "bg-sky-soft/45", chip: "bg-sky-soft text-sky", bar: "bg-sky" },
  rose: { wash: "bg-mint-soft/45", chip: "bg-rose-soft text-rose", bar: "bg-mint" },
  amber: { wash: "bg-amber-soft/45", chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  violet: { wash: "bg-violet-soft/45", chip: "bg-violet-soft text-violet", bar: "bg-violet" },
};

const TAG_CHIP: Record<string, string> = {
  Career: "bg-sky-soft text-sky",
  Learning: "bg-amber-soft text-amber",
  Health: "bg-mint-soft text-mint",
  Personal: "bg-violet-soft text-violet",
};

/**
 * A year goal: the goal itself on a tinted field, and its breakdown in a plain
 * panel beside it. Splitting them keeps the counts legible - milestones, tasks
 * and projects are navigation, not part of the goal's own statement.
 */
export function GoalCard({ goal, icon }: { goal: Goal; icon: React.ReactNode }) {
  const t = TONE[goal.tone];

  return (
    <article className="rounded-2xl border border-line bg-surface overflow-hidden shadow-[var(--shadow-card)] grid md:grid-cols-[minmax(0,1fr)_220px]">
      <div className={`p-5 ${t.wash}`}>
        <div className="flex gap-4">
          <span className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 bg-surface ${t.chip.split(" ")[1]}`}>
            {icon}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{goal.title}</h3>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-surface text-ink-soft shrink-0">
                Year Goal
              </span>
            </div>
            <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">{goal.detail}</p>

            <div className="mt-3.5 flex items-center gap-3">
              <span className="flex-1 h-2 rounded-full bg-surface/70 overflow-hidden">
                <span
                  className={`block h-full rounded-full ${t.bar}`}
                  style={{ width: `${goal.pct}%` }}
                />
              </span>
              <span className="text-[13px] font-bold tnum text-ink-soft shrink-0">{goal.pct}%</span>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2">
              {goal.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${TAG_CHIP[tag] ?? "bg-surface text-ink-soft"}`}
                >
                  {tag}
                </span>
              ))}
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                  goal.priority === "High"
                    ? "bg-rose-soft text-rose"
                    : "bg-amber-soft text-amber"
                }`}
              >
                Priority: {goal.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col justify-center gap-3.5 border-t md:border-t-0 md:border-l border-line">
        <Stat icon={<IconCheck />} value={`${goal.milestones[0]} / ${goal.milestones[1]}`} label="Milestones" />
        <Stat icon={<IconNote />} value={String(goal.tasks)} label="Tasks" href />
        <Stat icon={<IconBookmark />} value={String(goal.projects)} label={goal.projects === 1 ? "Project" : "Projects"} />
      </div>
    </article>
  );
}

function Stat({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  href?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-ink-faint shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold tnum leading-tight">{value}</p>
        <p className="text-[12px] text-ink-soft">{label}</p>
      </div>
      {href && (
        <span className="text-ink-faint shrink-0">
          <IconArrow className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
