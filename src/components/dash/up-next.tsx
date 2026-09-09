"use client";

import { CATEGORY_CHIP, hmLong, PRIORITY_META } from "@/lib/sample/data";
import { taskStore } from "@/lib/store/entities";

const ORDER = { must: 0, should: 1, could: 2 } as const;

/**
 * The next few outstanding tasks by priority. Replaces a fake scheduled
 * timeline (9:00 AM, 11:00 AM...) that implied a calendar this app doesn't
 * have - no task carries a real scheduled time, so showing one would be
 * inventing it.
 */
export function UpNext() {
  const tasks = taskStore
    .useItems()
    .filter((t) => !t.done)
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority])
    .slice(0, 5);

  if (tasks.length === 0) {
    return (
      <p className="text-[13.5px] text-ink-soft py-4 text-center">
        Nothing outstanding. Add a task to see it here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="flex items-center gap-3 py-2.5 border-b border-line last:border-b-0"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_META[t.priority].ring.replace("border-", "bg-")}`}
            aria-hidden="true"
          />
          <span className="flex-1 min-w-0 truncate text-[14px] font-medium">{t.title}</span>
          <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${CATEGORY_CHIP[t.category]}`}>
            {t.category}
          </span>
          <span className="text-[12.5px] text-ink-soft tnum shrink-0">{hmLong(t.minutes)}</span>
        </li>
      ))}
    </ul>
  );
}
