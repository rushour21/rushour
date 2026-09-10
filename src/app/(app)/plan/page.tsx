import { DateNav, QuoteCard } from "@/components/app/rail";
import { PlanTasks } from "@/components/plan/plan-tasks";
import { CapacityCard } from "@/components/plan/capacity-card";

export default function PlanPage() {
  return (
    <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 pt-1">
      <div className="min-w-0 flex flex-col gap-4">
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

        <CapacityCard />

        <PlanTasks />
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <DateNav date={new Date()} />
        <QuoteCard text="A well planned day leads to a better tomorrow." />
      </aside>
    </div>
  );
}
