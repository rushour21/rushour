import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/client";
import { SessionModel, User } from "@/lib/db/models";
import { DAY_ROLLOVER_HOUR, localDate, localHour } from "@/lib/time";
import { SUSPECT_SEGMENT_MIN } from "@/lib/limits";

/**
 * Auto-close (REQ-023). Hourly.
 *
 * Closes any session still open past 04:00 local the following day. Unlogged
 * time is never credited, and the session is marked unreviewed so it is
 * excluded from calibration and from the completion-rate metric - a forgotten
 * clock-out must not distort what the system believes about the person.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDb();

  const open = await SessionModel.find({ state: "OPEN" });
  const now = new Date();
  let closed = 0;

  for (const session of open) {
    const user = await User.findById(session.userId).select("timezone").lean();
    const tz = (user as unknown as { timezone?: string } | null)?.timezone ?? "UTC";

    const today = localDate(tz, now);
    const pastRollover = today > session.localDate && localHour(tz, now) >= DAY_ROLLOVER_HOUR;
    if (!pastRollover) continue;

    for (const seg of session.segments) {
      if (seg.endedAt) continue;
      const anchor = seg.lastHeartbeat ?? seg.startedAt;
      const elapsed = (now.getTime() - seg.startedAt.getTime()) / 60_000;
      seg.endedAt = anchor;
      seg.suspect = elapsed > SUSPECT_SEGMENT_MIN;
    }

    session.state = "AUTO_CLOSED";
    session.closedBy = "auto";
    session.clockOutAt = now;
    session.reviewed = false;
    await session.save();
    closed += 1;
  }

  return NextResponse.json({ ok: true, closed, checked: open.length });
}
