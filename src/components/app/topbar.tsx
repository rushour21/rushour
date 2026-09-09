"use client";

import { useSyncExternalStore } from "react";
import { IconBell, IconChevron, IconSearch } from "./icons";

/**
 * The top bar. Search is the only control that does real work at this stage;
 * the weather slot is deliberately empty until there is a location to ask
 * about, rather than showing a plausible-looking invented reading.
 */
export function Topbar({
  name,
  onOpenNav,
  unread = 0,
}: {
  name: string;
  onOpenNav?: () => void;
  unread?: number;
}) {
  // Read from the browser rather than setting state in an effect. The server
  // snapshot is the Mac hint, so the first paint matches the common case and
  // the shortcut label settles without a flash for everyone else.
  const mac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true,
  );

  return (
    <header className="h-[72px] shrink-0 flex items-center gap-3 px-4 sm:px-6 bg-ground/85 backdrop-blur-md sticky top-0 z-30">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="lg:hidden w-10 h-10 grid place-items-center rounded-xl bg-surface border border-line text-ink-soft"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <label className="flex-1 max-w-[480px] relative">
        <span className="sr-only">Search tasks, goals and notes</span>
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          <IconSearch />
        </span>
        <input
          type="search"
          placeholder="Search anything..."
          className="w-full h-11 pl-11 pr-16 rounded-xl bg-surface border border-line text-[14.5px] placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-faint bg-surface-2 border border-line rounded-md px-1.5 py-0.5 pointer-events-none">
          {mac ? "⌘" : "Ctrl"} K
        </kbd>
      </label>

      <div className="flex-1" />

      <button
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative w-10 h-10 grid place-items-center rounded-xl text-ink-soft hover:bg-surface transition-colors"
      >
        <IconBell />
        {unread > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose ring-2 ring-ground" />
        )}
      </button>

      <button
        type="button"
        className="flex items-center gap-2.5 pl-1.5 pr-2.5 h-11 rounded-xl hover:bg-surface transition-colors"
      >
        <Avatar name={name} />
        <span className="hidden sm:block text-[14.5px] font-semibold">{name.split(" ")[0]}</span>
        <span className="text-ink-faint">
          <IconChevron className="w-4 h-4" />
        </span>
      </button>
    </header>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className="w-9 h-9 rounded-full grid place-items-center bg-brand-soft text-brand font-bold text-[13px] shrink-0">
      {initials}
    </span>
  );
}
