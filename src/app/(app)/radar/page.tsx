import { PageHead, TabPills } from "@/components/app/bits";
import { QuoteCard } from "@/components/app/rail";
import { IconArrow, IconBookmark, IconLaptop, IconSearch } from "@/components/app/icons";

const TOPICS = [
  "AI Agents",
  "Remote Jobs",
  "System Design",
  "Next.js 15",
  "Startup Funding",
  "LLM Applications",
];

const FEED = [
  { id: "f1", title: "OpenAI releases new model with longer context", source: "Tech News", when: "2h ago" },
  { id: "f2", title: "5 high-paying remote AI jobs this week", source: "Jobs", when: "4h ago" },
  { id: "f3", title: "How to build LLM apps with function calling", source: "AI/ML", when: "1 day ago" },
  { id: "f4", title: "Top startups hiring in India (Sep 2026)", source: "Startups", when: "1 day ago" },
  { id: "f5", title: "System design resources for 2026", source: "Learning", when: "2 days ago" },
];

const SAVED = [
  "RAG best practices",
  "Stripe API subscriptions guide",
  "Meta Llama 3.1 released",
  "Senior Backend Engineer",
];

export default function RadarPage() {
  return (
    <div className="max-w-[1400px] mx-auto grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 pt-1">
      <div className="min-w-0">
        <PageHead
          eyebrow="Radar"
          title="Stay informed. Find opportunities."
          subtitle="Curated updates on jobs, tech, and more — tailored for you."
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <TabPills tabs={["For You", "Jobs", "Tech News", "AI/ML", "Startups", "Saved"]} />
          <label className="relative">
            <span className="sr-only">Search articles or jobs</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search articles, jobs..."
              className="h-10 w-[220px] pl-9 pr-3 rounded-xl bg-surface border border-line text-[13.5px] placeholder:text-ink-faint outline-none focus:border-brand"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3">
          {FEED.map((f) => (
            <article
              key={f.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <span className="w-14 h-14 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0">
                <IconLaptop />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold leading-snug">{f.title}</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  {f.source} · {f.when}
                </p>
              </div>
              <button
                aria-label={`Save ${f.title}`}
                className="text-ink-faint hover:text-brand shrink-0"
              >
                <IconBookmark className="w-[18px] h-[18px]" />
              </button>
            </article>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-4 min-w-0">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-bold mb-3.5">Trending Topics</h2>
          <ol className="flex flex-col gap-2.5">
            {TOPICS.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="w-5 text-[13px] font-bold text-ink-faint tnum shrink-0">
                  {i + 1}
                </span>
                <span className="text-[13.5px] font-medium truncate">{t}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[15px] font-bold mb-3.5">Saved Items</h2>
          <ul className="flex flex-col gap-2.5">
            {SAVED.map((s) => (
              <li key={s} className="flex items-center justify-between gap-2 text-[13.5px]">
                <span className="truncate">{s}</span>
                <span className="text-ink-faint shrink-0">
                  <IconBookmark className="w-4 h-4" />
                </span>
              </li>
            ))}
          </ul>
          <button className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:opacity-80">
            View all
            <IconArrow className="w-4 h-4" />
          </button>
        </section>

        <QuoteCard text="Knowledge today. Opportunities tomorrow." />
      </aside>
    </div>
  );
}
