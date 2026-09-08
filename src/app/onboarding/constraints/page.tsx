import { requireUser } from "@/lib/actions/context";
import { ConstraintsForm } from "./form";

export default async function ConstraintsPage() {
  const ctx = await requireUser();

  return (
    <main className="min-h-dvh px-6 py-14">
      <div className="max-w-[38rem] mx-auto">
        <p className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-ink-faint mb-3">
          Step 3 of 3 · Constraints
        </p>
        <h1 className="font-display text-[2rem] font-700 tracking-[-0.02em] leading-[1.1] mb-3">
          What is already spoken for?
        </h1>
        <p className="text-ink-soft mb-8 text-[15px] max-w-[46ch]">
          Everything left after this is what you actually have to plan with. Be
          honest rather than optimistic — an inflated number here produces plans
          you cannot finish.
        </p>
        <ConstraintsForm profile={ctx.user.profile} timezone={ctx.user.timezone} />
      </div>
    </main>
  );
}
