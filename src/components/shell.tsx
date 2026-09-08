import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/today", label: "Today" },
  { href: "/goals", label: "Goals" },
  { href: "/review", label: "Review" },
] as const;

export function AppShell({
  children,
  name,
  active,
}: {
  children: ReactNode;
  name: string;
  active: "home" | "today" | "goals" | "review";
}) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-surface">
        <div className="max-w-[46rem] mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/home"
            className="font-display font-700 text-[15px] tracking-[-0.01em]"
          >
            Rushour
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.label.toLowerCase() === active ? "page" : undefined}
                className={`font-mono text-[11px] tracking-[0.09em] uppercase px-3 py-2 rounded-[3px] ${
                  item.label.toLowerCase() === active
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-[46rem] mx-auto px-5 py-8 pb-20">{children}</main>
      <span className="sr-only">Signed in as {name}</span>
    </div>
  );
}
