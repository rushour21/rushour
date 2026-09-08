import { requireUser } from "@/lib/actions/context";
import { aiEnabled } from "@/lib/ai/client";
import { DirectionForm } from "./form";

export default async function DirectionPage() {
  const ctx = await requireUser();

  return (
    <main className="min-h-dvh px-6 py-14">
      <div className="max-w-[38rem] mx-auto">
        <p className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-ink-faint mb-3">
          Step 2 of 3 · Direction
        </p>
        <h1 className="font-display text-[2rem] font-700 tracking-[-0.02em] leading-[1.1] mb-3">
          What are you trying to improve?
        </h1>
        <p className="text-ink-soft mb-8 text-[15px] max-w-[46ch]">
          Write it however it comes out, {ctx.user.name.split(" ")[0]}. The next
          screen makes you choose only two to work on now — everything else is
          filed, not lost.
        </p>
        <DirectionForm aiAvailable={aiEnabled()} />
      </div>
    </main>
  );
}
