import { Button, Donut, PageHead, TabPills } from "@/components/app/bits";
import { BarRow } from "@/components/charts/spark";
import { QuoteCard } from "@/components/app/rail";
import { IconArrow, IconPlus } from "@/components/app/icons";

const INTERVIEWS = [
  { id: "i1", role: "Frontend Developer", company: "Google", when: "Mon, 15 Sep · 3:00 PM" },
  { id: "i2", role: "Backend Engineer", company: "Amazon", when: "Thu, 18 Sep · 11:00 AM" },
  { id: "i3", role: "Full Stack Developer", company: "Startup1", when: "Wed, 24 Sep · 2:00 PM" },
];

const SKILLS = [
  { label: "Node.js", pct: 80, tone: "sky" as const },
  { label: "System Design", pct: 45, tone: "amber" as const },
  { label: "AI/LLM", pct: 30, tone: "violet" as const },
];

const APPLICATIONS = [
  { id: "a1", company: "Google", role: "Software Engineer", status: "Interview", applied: "5 Sep 2026" },
  { id: "a2", company: "Amazon", role: "Backend Developer", status: "Applied", applied: "2 Sep 2026" },
  { id: "a3", company: "Microsoft", role: "Full Stack Developer", status: "Rejected", applied: "28 Aug 2026" },
  { id: "a4", company: "Netflix", role: "Software Engineer", status: "Applied", applied: "25 Aug 2026" },
];

const STATUS_TONE: Record<string, string> = {
  Interview: "bg-amber-soft text-amber",
  Applied: "bg-sky-soft text-sky",
  Rejected: "bg-rose-soft text-rose",
  Offer: "bg-mint-soft text-mint",
};

export default function CareerPage() {
  return (
    <div className="max-w-[1400px] mx-auto pt-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHead
          eyebrow="Career"
          title="Invest in your future."
          subtitle="Track your job search, skills, and career growth."
        />
        <Button>
          <IconPlus className="w-[18px] h-[18px]" />
          Add Application
        </Button>
      </div>

      <TabPills tabs={["Overview", "Job Applications", "Skills", "Learning", "Resume"]} />

      <div className="mt-5 grid lg:grid-cols-3 gap-4 items-start">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold mb-4">Application Progress</h2>
          <div className="flex items-center gap-4">
            <Donut
              segments={[
                { label: "Applied", value: 6, color: "#3b82f6" },
                { label: "Interview", value: 3, color: "#f59e0b" },
                { label: "Offer", value: 1, color: "#16a34a" },
                { label: "Rejected", value: 2, color: "#f43f5e" },
              ]}
              centerValue="12"
              centerLabel="Total"
              size={116}
            />
            <ul className="flex flex-col gap-2 text-[13px] min-w-0">
              <li><b className="tnum">6</b> <span className="text-ink-soft">Applied</span></li>
              <li><b className="tnum">3</b> <span className="text-ink-soft">Interview</span></li>
              <li><b className="tnum">1</b> <span className="text-ink-soft">Offer</span></li>
              <li><b className="tnum">2</b> <span className="text-ink-soft">Rejected</span></li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <h2 className="text-[16px] font-bold">Upcoming Interviews</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {INTERVIEWS.map((i) => (
              <li key={i.id} className="flex gap-3">
                <span className="w-9 h-9 rounded-xl grid place-items-center bg-sky-soft text-sky shrink-0 text-[13px] font-bold">
                  {i.company[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold truncate">{i.role}</p>
                  <p className="text-[12px] text-ink-soft truncate">{i.company}</p>
                  <p className="text-[11.5px] text-ink-faint mt-0.5">{i.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[16px] font-bold">Skills Progress</h2>
            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
              See all
              <IconArrow className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {SKILLS.map((s) => (
              <BarRow key={s.label} label={s.label} pct={s.pct} tone={s.tone} />
            ))}
          </div>
          <button className="mt-4 w-full h-10 rounded-xl bg-brand-soft text-brand font-semibold text-[13.5px] hover:opacity-80 transition-opacity">
            Manage Skills
          </button>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 px-5 pt-4.5 pb-3">
          <h2 className="text-[16px] font-bold">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead>
              <tr className="text-left text-[12px] font-semibold text-ink-soft border-y border-line bg-surface-2/50">
                <th className="px-5 py-2.5">Company</th>
                <th className="px-3 py-2.5">Position</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-5 py-2.5">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {APPLICATIONS.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-semibold">{a.company}</td>
                  <td className="px-3 py-3 text-ink-soft">{a.role}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${STATUS_TONE[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 tnum text-ink-soft">{a.applied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 max-w-[420px]">
        <QuoteCard text="Opportunities don't happen, you create them." />
      </div>
    </div>
  );
}
