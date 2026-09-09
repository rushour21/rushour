import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrow } from "@/components/app/icons";

/** The card every dashboard section sits in: one header row, one body. */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-surface border border-line rounded-2xl shadow-[var(--shadow-card)] flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4.5 pb-3">
        <h2 className="text-[16px] font-bold tracking-[-0.01em]">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80 transition-opacity shrink-0"
          >
            {action.label}
            <IconArrow className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="px-5 pb-5 flex-1 min-h-0">{children}</div>
    </section>
  );
}

const CATEGORY_TONE: Record<string, string> = {
  Work: "bg-sky-soft text-sky",
  Health: "bg-mint-soft text-mint",
  Personal: "bg-violet-soft text-violet",
  Learning: "bg-amber-soft text-amber",
};

export function CategoryChip({ name }: { name: string }) {
  const tone = CATEGORY_TONE[name] ?? "bg-surface-2 text-ink-soft";
  return (
    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md shrink-0 ${tone}`}>
      {name}
    </span>
  );
}
