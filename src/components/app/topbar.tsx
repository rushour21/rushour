"use client";

import { useState, useSyncExternalStore } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { IconBell, IconChevron, IconClock, IconGear, IconLogOut, IconSearch } from "./icons";

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

      <ClockInOut />

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

      <AccountMenu name={name} />
    </header>
  );
}

function AccountMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 pl-1.5 pr-2.5 h-11 rounded-xl hover:bg-surface transition-colors"
      >
        <Avatar name={name} />
        <span className="hidden sm:block text-[14.5px] font-semibold">{name.split(" ")[0]}</span>
        <span className="text-ink-faint">
          <IconChevron className="w-4 h-4" />
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            aria-label="Account"
            className="absolute z-50 top-full right-0 mt-2 w-56 bg-surface border border-line rounded-2xl shadow-[var(--shadow-lift)] p-1.5"
          >
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
              <Avatar name={name} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold truncate">{name}</p>
                <p className="text-[12px] text-ink-faint">Signed in</p>
              </div>
            </div>
            <hr className="border-line my-1" />
            <a
              href="/settings"
              role="menuitem"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              <IconGear className="w-4 h-4 text-ink-faint" />
              Settings
            </a>
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium text-rose hover:bg-rose-soft transition-colors"
              >
                <IconLogOut className="w-4 h-4" />
                Log out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
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

const CLOCK_STORAGE_KEY = "clockInTime";
const HISTORY_STORAGE_KEY = "clockHistory";
const MAX_HISTORY = 20;
/** Fires in the same tab on clock in/out, so every mounted instance re-syncs -
 *  the browser's own "storage" event only reaches *other* tabs. */
const CLOCK_EVENT = "rushour:clock-change";
const REQUIRED_MS = 90 * 60 * 1000; // 1h 30m before clock-out unlocks

interface ClockRecord {
  clockIn: number;
  clockOut: number;
}

/** A value that only exists in the browser, read the React-sanctioned way:
 *  through an external store rather than an effect that calls setState. That
 *  keeps the component pure during render, and gives the correct SSR snapshot
 *  (null) with no separate "mounted" flag needed. */
function useClockInTime(): number | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CLOCK_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CLOCK_EVENT, onChange);
      };
    },
    () => {
      const saved = localStorage.getItem(CLOCK_STORAGE_KEY);
      return saved ? Number(saved) : null;
    },
    () => null,
  );
}

const EMPTY_HISTORY: ClockRecord[] = [];
/** getSnapshot must return a referentially-stable value when nothing has
 *  changed, or useSyncExternalStore re-renders forever - JSON.parse on every
 *  call would hand back a new array each time even for identical content.
 *  This caches the parsed array against the raw string it came from. */
let historyCacheRaw: string | null | undefined;
let historyCacheParsed: ClockRecord[] = EMPTY_HISTORY;

function readHistorySnapshot(): ClockRecord[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (raw === historyCacheRaw) return historyCacheParsed;

  historyCacheRaw = raw;
  try {
    historyCacheParsed = raw ? (JSON.parse(raw) as ClockRecord[]) : EMPTY_HISTORY;
  } catch {
    historyCacheParsed = EMPTY_HISTORY;
  }
  return historyCacheParsed;
}

/** Every completed clock-in/out pair, newest first. Kept alongside the live
 *  in-progress state (which lives only in CLOCK_STORAGE_KEY) so a session
 *  that hasn't been clocked out yet never appears here as a fake record. */
function useClockHistory(): ClockRecord[] {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CLOCK_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CLOCK_EVENT, onChange);
      };
    },
    readHistorySnapshot,
    () => EMPTY_HISTORY,
  );
}

function recordSession(record: ClockRecord) {
  const history = [record, ...readHistorySnapshot()].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  historyCacheRaw = undefined; // force a re-read on the next snapshot
}

/** Ticks once a second via the same external-store pattern, so the elapsed
 *  read below is a pure function of props/state rather than a stray
 *  Date.now() call during render. */
function useNow(active: boolean): number {
  return useSyncExternalStore(
    (onChange) => {
      if (!active) return () => {};
      const id = setInterval(onChange, 1000);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0,
  );
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function ClockInOut() {
  const clockInTime = useClockInTime();
  const history = useClockHistory();
  const now = useNow(clockInTime !== null);
  const elapsed = clockInTime !== null ? Math.max(0, now - clockInTime) : 0;
  const canClockOut = elapsed >= REQUIRED_MS;
  const [historyOpen, setHistoryOpen] = useState(false);

  function handleClockIn() {
    localStorage.setItem(CLOCK_STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new Event(CLOCK_EVENT));
  }

  function handleClockOut() {
    if (!canClockOut) {
      window.alert("You must complete at least 1:30 hr before clocking out.");
      return;
    }
    if (window.confirm("Are you sure you want to clock out?") && clockInTime !== null) {
      recordSession({ clockIn: clockInTime, clockOut: Date.now() });
      localStorage.removeItem(CLOCK_STORAGE_KEY);
      window.dispatchEvent(new Event(CLOCK_EVENT));
    }
  }

  return (
    <div className="relative hidden sm:flex items-center gap-1.5 shrink-0">
      {clockInTime === null ? (
        <button
          onClick={handleClockIn}
          className="px-3 py-1.5 text-[13px] font-semibold rounded-xl bg-brand text-surface hover:bg-brand/90 transition-colors shadow-sm"
        >
          Clock In
        </button>
      ) : (
        <button
          onClick={handleClockOut}
          disabled={!canClockOut}
          title={
            !canClockOut
              ? `You must work at least 1:30 hr to clock out. Elapsed: ${formatElapsed(elapsed)}`
              : "Clock Out"
          }
          className={`px-3 py-1.5 text-[13px] font-semibold rounded-xl transition-colors shadow-sm ${
            canClockOut
              ? "bg-rose text-surface hover:bg-rose/90"
              : "bg-surface-2 text-ink-faint cursor-not-allowed border border-line"
          }`}
        >
          {canClockOut ? "Clock Out" : `Working (${formatElapsed(elapsed)})`}
        </button>
      )}

      <button
        type="button"
        onClick={() => setHistoryOpen((o) => !o)}
        aria-expanded={historyOpen}
        aria-haspopup="dialog"
        aria-label="Clock in/out history"
        className="w-8 h-8 grid place-items-center rounded-lg border border-line text-ink-soft hover:bg-surface-2 transition-colors"
      >
        <IconClock className="w-4 h-4" />
      </button>

      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setHistoryOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Clock in/out history"
            className="absolute z-50 top-full right-0 mt-2 w-72 bg-surface border border-line rounded-2xl shadow-[var(--shadow-lift)] p-3"
          >
            <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-ink-faint px-1 mb-2">
              Recent sessions
            </p>
            {history.length === 0 ? (
              <p className="text-[13px] text-ink-soft px-1 py-2">
                Nothing clocked out yet.
              </p>
            ) : (
              <ul className="flex flex-col max-h-64 overflow-y-auto scroll-slim">
                {history.map((r) => (
                  <li
                    key={r.clockIn}
                    className="flex items-center justify-between gap-3 px-1 py-2 border-b border-line last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{formatDay(r.clockIn)}</p>
                      <p className="text-[12px] text-ink-soft tnum">
                        {formatClock(r.clockIn)} &ndash; {formatClock(r.clockOut)}
                      </p>
                    </div>
                    <span className="text-[12px] font-semibold tnum text-ink-soft shrink-0">
                      {formatElapsed(r.clockOut - r.clockIn)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
