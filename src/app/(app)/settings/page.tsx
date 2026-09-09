import { PageHead } from "@/components/app/bits";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ProfileForm } from "@/components/settings/profile-form";

const NAV = ["Profile", "Preferences", "Notifications", "Integrations", "Appearance", "Data & Privacy", "Billing", "Help & Support"];

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

        <div className="flex flex-col gap-5 min-w-0">
          <ProfileForm />
          <ResumeUpload />
        </div>
      </div>
    </div>
  );
}
