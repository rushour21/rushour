import { Button, Donut, Legend, PageHead, TabPills } from "@/components/app/bits";
import { QuoteCard } from "@/components/app/rail";
import {
  IconArrow,
  IconBook,
  IconClock,
  IconLaptop,
  IconPlay,
  IconShield,
  IconSuitcase,
} from "@/components/app/icons";

const SESSIONS = [
  { id: "s1", time: "9:00 AM", title: "Deep Work", detail: "Build authentication", len: "2h", tone: "sky" as const, icon: <IconLaptop /> },
  { id: "s2", time: "1:00 PM", title: "Learning", detail: "Read system design", len: "1h", tone: "amber" as const, icon: <IconBook /> },
  { id: "s3", time: "4:00 PM", title: "Career", detail: "Job applications", len: "45m", tone: "rose" as const, icon: <IconSuitcase /> },
];

const DISTRACTIONS = [
  { label: "Social Media", value: 5, color: "#f43f5e" },
  { label: "YouTube", value: 3, color: "#f59e0b" },
  { label: "News", value: 2, color: "#8b5cf6" },
  { label: "Others", value: 2, color: "#cbd5e1" },
];

const TONE = {
  sky: "bg-sky-soft text-sky",
  amber: "bg-amber-soft text-amber",
  rose: "bg-rose-soft text-rose",
};

export default function FocusPage() {
  return (
    <div className="max-w-[1400px] mx-auto pt-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHead
          eyebrow="Focus"
          title="Deep work. Real progress."
          subtitle="Track your focus, eliminate distractions, and get more done."
        />
        <Button>
          <IconPlay className="w-[18px] h-[18px]" />
          Start Focus Session
        </Button>
      </div>

      <TabPills tabs={["Today", "This Week", "This Month", "Focus Sessions"]} />

      <div className="mt-5 grid lg:grid-cols-2 gap-4 items-start">
        <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#eaf1ff] to-[#f4ecff] dark:from-[#16203a] dark:to-[#221a3a] p-8 grid place-items-center min-h-[300px]">
          <div className="relative z-10 text-center">
            <Ring />
            <button
              className="mt-6 w-14 h-14 rounded-full bg-brand text-white grid place-items-center mx-auto hover:opacity-90 transition-opacity"
              aria-label="Start focus timer"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 ml-0.5" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5 18 12 8 18.5z" />
              </svg>
            </button>
            <p className="mt-6 text-[13.5px] italic text-ink-soft max-w-[30ch] mx-auto">
              &ldquo;Focus is the bridge between goals and results.&rdquo;
            </p>
          </div>
          <svg viewBox="0 0 400 80" className="absolute bottom-0 inset-x-0 w-full" aria-hidden="true">
            <circle cx="320" cy="34" r="20" fill="#fbbf24" opacity="0.55" />
            <path d="M0 56 80 34 160 52 240 28 320 48 400 30V80H0z" fill="#a8bde8" opacity="0.35" />
          </svg>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-bold">Today&rsquo;s Focus</h2>
          <p className="mt-2 text-[28px] font-extrabold tnum tracking-[-0.025em] leading-none">
            4h 20m
          </p>
          <p className="text-[12.5px] text-ink-soft mt-1">of 6h goal today</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <span className="block h-full rounded-full bg-mint" style={{ width: "70%" }} />
            </span>
            <span className="text-[12px] font-semibold tnum text-ink-soft">70%</span>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            <MiniStat tone="mint" icon={<IconClock />} value="3" label="Focus Sessions completed" />
            <MiniStat tone="rose" icon={<IconShield />} value="12" label="Distractions blocked" />
            <MiniStat tone="sky" icon={<IconClock />} value="2h 10m" label="longest session" />
          </ul>
        </section>
      </div>

      <div className="mt-4 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-[16px] font-bold">Recent Sessions</h2>
            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
              See all
              <IconArrow className="w-4 h-4" />
            </button>
          </div>
          <ul className="flex flex-col">
            {SESSIONS.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3 border-b border-line last:border-b-0">
                <span className="text-[12.5px] text-ink-soft tnum w-[62px] shrink-0">{s.time}</span>
                <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${TONE[s.tone]}`}>
                  <span className="scale-[0.8]">{s.icon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold truncate">{s.title}</p>
                  <p className="text-[12.5px] text-ink-soft truncate">{s.detail}</p>
                </div>
                <span className="text-[13px] font-semibold tnum text-ink-soft shrink-0">{s.len}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold mb-4">Distraction Breakdown</h2>
          <div className="flex items-center gap-5">
            <Donut segments={DISTRACTIONS} centerValue="12" centerLabel="Total" size={124} />
            <Legend items={DISTRACTIONS} />
          </div>
        </section>
      </div>

      <div className="mt-4 max-w-[420px]">
        <QuoteCard text="Small steps. Bigger tomorrows." />
      </div>
    </div>
  );
}

function Ring() {
  const pct = 0.62;
  const r = 62;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[168px] h-[168px] mx-auto">
      <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--color-surface)" strokeWidth="10" />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[30px] font-extrabold tnum tracking-[-0.03em] leading-none">25:00</p>
          <p className="text-[12px] text-ink-soft mt-1.5">Focus Mode</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  tone,
  icon,
  value,
  label,
}: {
  tone: "mint" | "rose" | "sky";
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const chip = { mint: "bg-mint-soft text-mint", rose: "bg-rose-soft text-rose", sky: "bg-sky-soft text-sky" }[tone];
  return (
    <li className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${chip}`}>
        <span className="scale-[0.7]">{icon}</span>
      </span>
      <p className="text-[13.5px]">
        <b className="font-bold tnum">{value}</b>{" "}
        <span className="text-ink-soft">{label}</span>
      </p>
    </li>
  );
}
