import { DateNav, QuoteCard } from "@/components/app/rail";
import { Select } from "@/components/app/bits";
import { TasksView } from "@/components/tasks/tasks-view";
import { TaskOverview } from "@/components/tasks/task-overview";
import {
  IconArrow,
  IconBook,
  IconHeart,
  IconLaptop,
  IconPlus,
  IconSuitcase,
  IconUsers,
} from "@/components/app/icons";
import { PROJECTS } from "@/lib/sample/data";

const PROJECT_ICON: Record<string, React.ReactNode> = {
  Portfolio: <IconLaptop />,
  "Job Search": <IconSuitcase />,
  Learning: <IconBook />,
  Health: <IconHeart />,
  Personal: <IconUsers />,
};
const PROJECT_TONE: Record<string, string> = {
  sky: "bg-sky-soft text-sky",
  rose: "bg-rose-soft text-rose",
  violet: "bg-violet-soft text-violet",
  mint: "bg-mint-soft text-mint",
};

export default function TasksPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 pt-1">
      <div className="min-w-0">
        <TasksView />
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <DateNav date={new Date()} />

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[15px] font-bold">Task Overview</h2>
            <Select label="This Week" />
          </div>
          <TaskOverview />
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <h2 className="text-[15px] font-bold">Projects</h2>
            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
              View all
              <IconArrow className="w-4 h-4" />
            </button>
          </div>

          <ul className="flex flex-col">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <button className="w-full flex items-center gap-3 py-2.5 text-left group">
                  <span
                    className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${PROJECT_TONE[p.tone]}`}
                  >
                    <span className="scale-[0.75]">{PROJECT_ICON[p.name]}</span>
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[14px] font-medium group-hover:text-brand transition-colors">
                    {p.name}
                  </span>
                  <span className="text-[13px] font-semibold text-ink-soft tnum shrink-0">
                    {p.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button className="mt-3 w-full h-11 rounded-xl bg-brand-soft text-brand font-semibold text-[14px] inline-flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <IconPlus className="w-[18px] h-[18px]" />
            Create Project
          </button>
        </section>

        <QuoteCard text="Consistency today creates a better you tomorrow." />
      </aside>
    </div>
  );
}
