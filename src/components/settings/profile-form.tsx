"use client";

import { useState } from "react";
import { profileStore } from "@/lib/store/profile";

const GOAL_TAGS = ["Career", "Health", "Learning", "Productivity"];
const GOAL_TAG_CHIP: Record<string, string> = {
  Career: "bg-sky-soft text-sky",
  Health: "bg-mint-soft text-mint",
  Learning: "bg-amber-soft text-amber",
  Productivity: "bg-violet-soft text-violet",
};
const INTEREST_TAGS = ["AI/ML", "Web Development", "Startups", "Reading", "Design", "Finance"];

/**
 * The Profile section of Settings. Backed by profileStore, the same one the
 * quiz reads for grounding - so filling this in here is not decorative, it
 * changes what the rest of the app knows about you.
 *
 * Fields start empty rather than pre-filled with a stranger's name: dummy
 * data would just be a different kind of wrong from "not built yet."
 */
export function ProfileForm() {
  const profile = profileStore.useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [bio, setBio] = useState(profile.bio);
  const [goalTags, setGoalTags] = useState<string[]>(profile.goalTags);
  const [interestTags, setInterestTags] = useState<string[]>(profile.interestTags);
  const [saved, setSaved] = useState(false);

  function detectTimezone() {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  }

  function toggle(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  }

  function save() {
    profileStore.update({ name, email, location, timezone, bio, goalTags, interestTags });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = name.trim()
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-4 mb-6">
        <span className="w-16 h-16 rounded-full bg-brand-soft text-brand grid place-items-center text-[20px] font-bold shrink-0">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-bold truncate">{name.trim() || "Add your name"}</p>
          <p className="text-[13px] text-ink-soft truncate">{email.trim() || "Add your email"}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Full Name" value={name} onChange={setName} placeholder="Your name" />
        <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <TextField label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
        <div>
          <p className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Timezone</p>
          <div className="flex gap-2">
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Not set"
              className="flex-1 min-w-0 text-[14px] rounded-xl border border-line bg-surface px-3.5 py-2.5 outline-none focus:border-brand transition-colors"
            />
            <button
              type="button"
              onClick={detectTimezone}
              className="shrink-0 px-3 rounded-xl border border-line text-[12.5px] font-semibold text-ink-soft hover:bg-surface-2 transition-colors"
            >
              Detect
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Bio</p>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A line about what you're working toward."
          className="w-full text-[14px] rounded-xl border border-line bg-surface px-3.5 py-3 outline-none focus:border-brand transition-colors resize-y"
        />
      </div>

      <div className="mt-5">
        <p className="text-[12.5px] font-semibold text-ink-soft mb-2">Goals</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_TAGS.map((t) => {
            const active = goalTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(goalTags, setGoalTags, t)}
                className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  active ? GOAL_TAG_CHIP[t] : "bg-surface-2 text-ink-faint hover:text-ink-soft"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[12.5px] font-semibold text-ink-soft mb-2">Interests</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map((t) => {
            const active = interestTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(interestTags, setInterestTags, t)}
                className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  active ? "bg-brand-soft text-brand" : "bg-surface-2 text-ink-faint hover:text-ink-soft"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-end gap-3">
        {saved && <span className="text-[13px] font-semibold text-mint">Saved</span>}
        <button
          type="button"
          onClick={save}
          className="h-11 px-6 rounded-xl bg-brand text-white font-semibold text-[14.5px] hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-soft mb-1.5">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[14px] rounded-xl border border-line bg-surface px-3.5 py-2.5 outline-none focus:border-brand transition-colors"
      />
    </div>
  );
}
