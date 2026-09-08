import Link from "next/link";
import { Card, Pill } from "@/components/ui";

/**
 * The day's state, above everything else on the page.
 *
 * The spec's rule was "land on clock-in, never a dashboard". This is the
 * resolution: Home answers "what now" before it answers "how am I doing", so
 * the next action is never buried under statistics.
 */
export function DayState({
  today,
  firstName,
}: {
  today: { state: "NONE" | "OPEN" | "PLANNING" | "CLOSED" | "AUTO_CLOSED"; outcome: string };
  firstName: string;
}) {
  const copy = {
    NONE: {
      pill: null,
      title: `Ready when you are, ${firstName}.`,
      body: "Three questions and a finish time, then today has a shape.",
      cta: "Clock in",
    },
    PLANNING: {
      pill: "Clocked in",
      title: "Today needs a shape.",
      body: "One outcome and the tasks under it, checked against the time you actually have.",
      cta: "Finish planning",
    },
    OPEN: {
      pill: "In progress",
      title: today.outcome || "Today is under way.",
      body: "Pick up where you left off.",
      cta: "Open today",
    },
    CLOSED: {
      pill: "Day closed",
      title: today.outcome || "Today is closed.",
      body: "Sealed. Pick it back up if you get another stretch.",
      cta: "See the day",
    },
    AUTO_CLOSED: {
      pill: "Closed automatically",
      title: today.outcome || "Yesterday closed on its own.",
      body: "It is not counted when working out how long your work takes.",
      cta: "See the day",
    },
  }[today.state];

  return (
    <Card tone={today.state === "NONE" ? "plain" : "plain"} className="p-5">
      {copy.pill && (
        <div className="mb-3">
          <Pill tone={today.state === "OPEN" || today.state === "PLANNING" ? "accent" : "neutral"}>
            {copy.pill}
          </Pill>
        </div>
      )}
      <h1 className="font-display text-[1.6rem] font-700 tracking-[-0.02em] leading-[1.15] text-balance">
        {copy.title}
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft max-w-[44ch]">{copy.body}</p>
      <Link
        href="/today"
        className="inline-block mt-4 font-display text-sm font-600 px-5 py-3 rounded-[3px] bg-accent text-white"
      >
        {copy.cta}
      </Link>
    </Card>
  );
}
