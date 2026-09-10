import { DateNav, QuoteCard } from "@/components/app/rail";
import { Select } from "@/components/app/bits";
import { TasksView } from "@/components/tasks/tasks-view";
import { TaskOverview } from "@/components/tasks/task-overview";

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

        <QuoteCard text="Consistency today creates a better you tomorrow." />
      </aside>
    </div>
  );
}
