import { HabitsView } from "@/components/habits/habits-view";
import { HabitsSidebar } from "@/components/habits/habits-sidebar";
import { WeeklyProgress } from "@/components/habits/weekly-progress";
import { CompletionHistory } from "@/components/habits/completion-history";

export default function HabitsPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 pt-1">
      <div className="min-w-0">
        <HabitsView />

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <WeeklyProgress />
            <CompletionHistory />
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <HabitsSidebar />
      </aside>
    </div>
  );
}
