/**
 * Every timestamp is stored UTC; every daily-scoped document also carries a
 * `localDate` string in the user's timezone. "Did I do it today?" is a calendar
 * question, and UTC ranges break across DST and travel.
 */

/** "2026-09-08" in the given IANA timezone. */
export function localDate(tz: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** Local wall-clock hour (0-23) in the given timezone. */
export function localHour(tz: string, at: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    }).format(at),
  );
}

/** "17:30" local. */
export function localTime(tz: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
}

/**
 * The session date for a clock-in (REQ-020). Clocking in between midnight and
 * 04:00 belongs to the previous day - someone working past midnight has not
 * started a new day.
 */
export const DAY_ROLLOVER_HOUR = 4;

export function sessionDate(tz: string, at: Date = new Date()): string {
  if (localHour(tz, at) < DAY_ROLLOVER_HOUR) {
    return localDate(tz, new Date(at.getTime() - 24 * 3600_000));
  }
  return localDate(tz, at);
}

/** Days between two "YYYY-MM-DD" strings. */
export function daysBetween(a: string, b: string): number {
  const d1 = Date.parse(`${a}T00:00:00Z`);
  const d2 = Date.parse(`${b}T00:00:00Z`);
  return Math.round((d2 - d1) / 86_400_000);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** ISO week key, "2026-W37". */
export function isoWeek(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** The 7 local dates of the ISO week containing `date`, Monday first. */
export function weekDates(date: string): string[] {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  const monday = addDays(date, 1 - day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Builds a Date for "HH:MM" today in the user's timezone, from a reference instant. */
export function atLocalTime(tz: string, hhmm: string, from: Date = new Date()): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const current = localTime(tz, from);
  const [ch, cm] = current.split(":").map(Number);
  const deltaMin = (h * 60 + m) - (ch * 60 + cm);
  return new Date(from.getTime() + deltaMin * 60_000);
}
