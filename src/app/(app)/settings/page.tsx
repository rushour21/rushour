import { PageHead } from "@/components/app/bits";
import { ResumeUpload } from "@/components/resume/resume-upload";

const NAV = ["Profile", "Preferences", "Notifications", "Integrations", "Appearance", "Data & Privacy", "Billing", "Help & Support"];

const TAGS: Record<string, string> = {
  Career: "bg-sky-soft text-sky",
  Health: "bg-mint-soft text-mint",
  Learning: "bg-amber-soft text-amber",
  Productivity: "bg-violet-soft text-violet",
};

export default function SettingsPage() {
  return (
    <div className="max-w-[1200px] mx-auto pt-1">
      <PageHead
        eyebrow="Settings"
        title="Customize your Rushour experience."
        subtitle="Manage your account, preferences, and integrations."
      />

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-5 items-start">
        <nav aria-label="Settings sections" className="rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow-card)]">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((n, i) => (
              <li key={n}>
                <button
                  aria-current={i === 0 ? "page" : undefined}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                    i === 0 ? "bg-brand-soft text-brand font-semibold" : "text-ink-soft hover:bg-surface-2"
                  }`}
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-full bg-brand-soft text-brand grid place-items-center text-[20px] font-bold shrink-0">
                RI
              </span>
              <div>
                <p className="text-[16px] font-bold">Rushabh Ingle</p>
                <p className="text-[13px] text-ink-soft">rushabh@gmail.com</p>
              </div>
            </div>
            <button className="h-10 px-4 rounded-xl border border-line text-[13.5px] font-semibold hover:bg-surface-2 transition-colors">
              Edit
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name" value="Rushabh Ingle" />
            <Field label="Email" value="rushabh@gmail.com" />
            <Field label="Location" value="Mumbai, India" />
            <Field label="Timezone" value="(GMT+5:30) India Standard Time" />
          </div>

          <div className="mt-5">
            <p className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Bio</p>
            <p className="text-[14px] rounded-xl border border-line bg-surface-2/40 px-3.5 py-3">
              Building a better me, one day at a time.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-[12.5px] font-semibold text-ink-soft mb-2">Goals</p>
            <div className="flex flex-wrap gap-2">
              {["Career", "Health", "Learning", "Productivity"].map((t) => (
                <span key={t} className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md ${TAGS[t]}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12.5px] font-semibold text-ink-soft mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {["AI/ML", "Web Development", "Startups", "Reading"].map((t) => (
                <span key={t} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button className="h-11 px-6 rounded-xl bg-brand text-white font-semibold text-[14.5px] hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </section>
      </div>

      <div className="mt-5">
        <ResumeUpload />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-soft mb-1.5">{label}</p>
      <p className="text-[14px] rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5">{value}</p>
    </div>
  );
}
