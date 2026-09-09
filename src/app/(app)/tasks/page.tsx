import { DateNav, QuoteCard } from "@/components/app/rail";
import { Button, Donut, Legend, PageHead, Select, TabPills } from "@/components/app/bits";
import { PriorityGroup } from "@/components/plan/priority-group";
import {
  IconArrow,
  IconBook,
  IconHeart,
  IconLaptop,
  IconPlus,
  IconSearch,
  IconSuitcase,
  IconUsers,
} from "@/components/app/icons";
import { PROJECTS, TASKS } from "@/lib/sample/data";

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
  const completed = TASKS.filter((t) => t.done).length;
  const counts = {
    must: TASKS.filter((t) => t.priority === "must" && !t.done).length,
    should: TASKS.filter((t) => t.priority === "should" && !t.done).length,
    could: TASKS.filter((t) => t.priority === "could" && !t.done).length,
  };

  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 pt-1">
      <div className="min-w-0">
        <PageHead
          eyebrow="My tasks"
          title="Turn your plans into progress"
          subtitle="Organize, prioritize and get things done."
          action={
            <Button>
              <IconPlus className="w-[18px] h-[18px]" />
              Add Task
            </Button>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <TabPills tabs={["All Tasks", "Today", "Upcoming", "Someday", "Completed"]} />
          <div className="flex gap-2">
            <Select label="Filter" />
            <Select label="Sort: Priority" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <label className="relative flex-1 min-w-[240px]">
            <span className="sr-only">Search tasks</span>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
              <IconSearch className="w-[18px] h-[18px]" />
            </span>
            <input
              type="search"
              placeholder="Search tasks..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface border border-line text-[14px] placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </label>
          <Select label="Project" />
          <Select label="Priority" />
          <Select label="Tag" />
          <Select label="Status" />
        </div>

        <div className="flex flex-col gap-4">
          <PriorityGroup priority="must" tasks={TASKS.filter((t) => t.priority === "must")} showBlurb />
          <PriorityGroup priority="should" tasks={TASKS.filter((t) => t.priority === "should")} showBlurb />
          <PriorityGroup priority="could" tasks={TASKS.filter((t) => t.priority === "could")} showBlurb />
        </div>
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <DateNav date={new Date()} />

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[15px] font-bold">Task Overview</h2>
            <Select label="This Week" />
          </div>
          <div className="flex items-center gap-5">
            <Donut
              segments={[
                { label: "Must", value: counts.must, color: "#f43f5e" },
                { label: "Should", value: counts.should, color: "#f59e0b" },
                { label: "Nice to do", value: counts.could, color: "#16a34a" },
                { label: "Completed", value: completed, color: "#cbd5e1" },
              ]}
              centerValue={String(TASKS.length + 4)}
              centerLabel="Total Tasks"
              size={128}
            />
            <Legend
              items={[
                { label: "Must", value: counts.must, color: "#f43f5e" },
                { label: "Should", value: counts.should + 1, color: "#f59e0b" },
                { label: "Nice to do", value: counts.could + 1, color: "#16a34a" },
                { label: "Completed", value: completed + 1, color: "#cbd5e1" },
              ]}
            />
          </div>
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
