import { QuoteCard } from "@/components/app/rail";
import { GoalsView } from "@/components/goals/goals-view";
import { GoalsSidebar } from "@/components/goals/goals-sidebar";

export default function GoalsPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 pt-1">
      <div className="min-w-0">
        <GoalsView />
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <GoalsSidebar />
        <QuoteCard text="Small steps. Bigger tomorrows." />
      </aside>
    </div>
  );
}
