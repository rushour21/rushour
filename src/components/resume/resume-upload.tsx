"use client";

import { useRef, useState } from "react";
import { profileStore } from "@/lib/store/profile";
import { IconArrow, IconBook } from "@/components/app/icons";

/**
 * Upload a PDF (or plain text) resume, extract its text server-side, and
 * store the result in the profile store. The quiz reads resumeText from
 * there - nothing else needs to know this component exists.
 *
 * Text is editable after extraction: PDF extraction is not perfect, and the
 * user should be able to fix it up rather than live with whatever came out.
 */
export function ResumeUpload({
  compact = false,
  onSaved,
}: {
  compact?: boolean;
  onSaved?: () => void;
}) {
  const profile = profileStore.useProfile();
  const [draft, setDraft] = useState(profile.resumeText);
  const [fileName, setFileName] = useState(profile.resumeFileName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!profile.resumeText);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("resume", file);
      const res = await fetch("/api/resume/extract", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't read that file.");
        return;
      }
      setDraft(json.text);
      setFileName(file.name);
      setEditing(true);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    profileStore.setResume(draft.trim(), fileName);
    setEditing(false);
    onSaved?.();
  }

  const hasResume = Boolean(profile.resumeText);

  return (
    <div className={compact ? "" : "rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]"}>
      {!compact && (
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-9 h-9 rounded-xl grid place-items-center bg-brand-soft text-brand shrink-0">
            <IconBook className="w-[18px] h-[18px]" />
          </span>
          <div>
            <p className="text-[15px] font-bold">Resume</p>
            <p className="text-[12.5px] text-ink-soft">
              Grounds your daily quiz in what you actually know.
            </p>
          </div>
        </div>
      )}

      {!editing && hasResume ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold truncate">
              {profile.resumeFileName ?? "Resume text"}
            </p>
            <p className="text-[12px] text-ink-faint">
              {profile.resumeText.length.toLocaleString()} characters
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-[13px] font-semibold text-brand hover:opacity-80"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="h-10 px-4 rounded-xl border border-line text-[13.5px] font-semibold hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              {busy ? "Reading…" : "Upload PDF"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <span className="text-[12.5px] text-ink-faint">or paste it below</span>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={compact ? 5 : 8}
            placeholder="Paste your resume text here, or upload a PDF above."
            className="w-full rounded-xl bg-surface border border-line px-3.5 py-3 text-[13.5px] leading-relaxed outline-none focus:border-brand transition-colors resize-y"
          />

          {error && (
            <p className="text-[12.5px] text-rose">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            {hasResume && (
              <button
                type="button"
                onClick={() => {
                  setDraft(profile.resumeText);
                  setEditing(false);
                  setError(null);
                }}
                className="h-10 px-4 rounded-xl text-[13.5px] font-semibold text-ink-soft hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="h-10 px-4 rounded-xl bg-brand text-white text-[13.5px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              Save resume
              <IconArrow className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
