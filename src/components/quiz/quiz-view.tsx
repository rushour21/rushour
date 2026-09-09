"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { profileStore } from "@/lib/store/profile";
import { quizStore, newQuizId, type QuizRecord } from "@/lib/store/quiz";
import { requestQuizQuestions } from "@/lib/actions/quiz";
import {
  currentDifficulty,
  dueForRetry,
  MAX_QUESTIONS_PER_DAY,
  retiredQuestions,
} from "@/lib/quiz/engine";
import { Button } from "@/components/app/bits";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { IconArrow, IconBook } from "@/components/app/icons";

type Session = { queue: QuizRecord[]; index: number; started: boolean };

/**
 * The daily quiz: up to 10 questions, wrong-answered ones from previous
 * days retried first, new ones generated at the current difficulty and
 * grounded in the resume, correct answers retired permanently, difficulty
 * only ever moving one step per answer.
 */
export function QuizView() {
  const profile = profileStore.useProfile();
  const history = quizStore.useItems();

  const [session, setSession] = useState<Session>({ queue: [], index: 0, started: false });
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => localDateKey(new Date()), []);
  const difficulty = useMemo(() => currentDifficulty(history), [history]);
  const retries = useMemo(() => dueForRetry(history, today), [history, today]);

  const todayAnswered = history.filter((q) => q.correct !== null && localDateKey(new Date(q.askedAt)) === today);
  const alreadyDoneToday = todayAnswered.length >= MAX_QUESTIONS_PER_DAY;

  async function startQuiz() {
    setError(null);
    start(async () => {
      const retrySlice = retries.slice(0, Math.min(3, MAX_QUESTIONS_PER_DAY));
      const need = MAX_QUESTIONS_PER_DAY - retrySlice.length;

      let generated: QuizRecord[] = [];
      if (need > 0) {
        const exclude = [...retiredQuestions(history)];
        const res = await requestQuizQuestions(profile.resumeText, difficulty, need, exclude);
        if ("error" in res) {
          setError(
            res.error === "no-ai"
              ? "No AI model is configured, so new questions can't be generated right now."
              : res.error === "generation-failed"
                ? "Couldn't generate questions just now. Try again in a moment."
                : res.error,
          );
          if (retrySlice.length === 0) return;
        } else {
          generated = res.questions.map((q) => ({
            id: newQuizId(),
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty,
            topic: q.topic,
            askedAt: Date.now(),
            answeredIndex: null,
            correct: null,
          }));
        }
      }

      const queue = [...retrySlice, ...generated].slice(0, MAX_QUESTIONS_PER_DAY);
      if (queue.length === 0) {
        setError("Nothing to ask right now.");
        return;
      }

      setSession({ queue, index: 0, started: true });
      setSelected(null);
      setRevealed(false);
    });
  }

  function submit() {
    if (selected === null) return;
    const current = session.queue[session.index];
    const correct = selected === current.correctIndex;

    const answered: QuizRecord = {
      ...current,
      answeredIndex: selected,
      correct,
      askedAt: Date.now(),
    };

    // A retried question already exists in the store; a freshly generated
    // one doesn't yet - add vs update accordingly.
    if (history.some((h) => h.id === answered.id)) {
      quizStore.update(answered.id, answered);
    } else {
      quizStore.add(answered);
    }

    setSession((s) => ({ ...s, queue: s.queue.map((q, i) => (i === s.index ? answered : q)) }));
    setRevealed(true);
  }

  function next() {
    setSelected(null);
    setRevealed(false);
    setSession((s) => ({ ...s, index: s.index + 1 }));
  }

  if (!profile.resumeText) {
    return (
      <div className="max-w-[560px] mx-auto pt-1">
        <Header />
        <div className="mt-6">
          <p className="text-[14.5px] text-ink-soft mb-4">
            The quiz is grounded in your resume, so it only asks about what you
            actually know. Add one to start.
          </p>
          <ResumeUpload />
        </div>
      </div>
    );
  }

  if (!session.started) {
    const doneToday = todayAnswered.filter((q) => q.correct).length;
    return (
      <div className="max-w-[560px] mx-auto pt-1">
        <Header />
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4 mb-4">
            <Stat label="Difficulty" value={`${difficulty} / 5`} />
            <Stat label="Due for retry" value={String(retries.length)} />
            <Stat label="Retired" value={String(retiredQuestions(history).size)} />
          </div>

          {alreadyDoneToday ? (
            <p className="text-[14.5px] text-ink-soft">
              You&rsquo;ve done today&rsquo;s {MAX_QUESTIONS_PER_DAY} questions ({doneToday} correct). Come back tomorrow.
            </p>
          ) : (
            <>
              <p className="text-[14.5px] text-ink-soft mb-5">
                Up to {MAX_QUESTIONS_PER_DAY} questions, grounded in your resume. Correct
                answers are retired for good; wrong ones can come back.
              </p>
              {error && <p className="text-[13px] text-rose mb-4">{error}</p>}
              <Button onClick={startQuiz} disabled={loading}>
                {loading ? "Preparing…" : "Start today's quiz"}
              </Button>
            </>
          )}
        </div>

        {history.length > 0 && <HistoryList history={history} />}
      </div>
    );
  }

  const current = session.queue[session.index];
  const isLast = session.index === session.queue.length - 1;
  const finished = session.index >= session.queue.length;

  if (finished) {
    const correctCount = session.queue.filter((q) => q.correct).length;
    return (
      <div className="max-w-[560px] mx-auto pt-1">
        <Header />
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-ink-faint mb-2">
            Quiz complete
          </p>
          <p className="text-[32px] font-extrabold tnum tracking-[-0.02em] mb-1">
            {correctCount} / {session.queue.length}
          </p>
          <p className="text-[14px] text-ink-soft mb-5">
            {correctCount === session.queue.length
              ? "Every one right - all retired."
              : "Wrong ones will come back on another day."}
          </p>
          <Button onClick={() => setSession({ queue: [], index: 0, started: false })}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[560px] mx-auto pt-1">
      <Header />
      <div className="mt-6 flex items-center justify-between gap-3 mb-3">
        <span className="text-[12.5px] font-semibold text-ink-soft tnum">
          Question {session.index + 1} of {session.queue.length}
        </span>
        <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-brand-soft text-brand">
          Level {current.difficulty}
        </span>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <p className="text-[16px] font-bold leading-snug mb-5">{current.question}</p>

        <div className="flex flex-col gap-2.5">
          {current.options.map((opt, i) => {
            const isCorrect = i === current.correctIndex;
            const isPicked = i === selected;
            const tone = !revealed
              ? isPicked
                ? "border-brand bg-brand-soft"
                : "border-line hover:border-line-strong"
              : isCorrect
                ? "border-mint bg-mint-soft"
                : isPicked
                  ? "border-rose bg-rose-soft"
                  : "border-line opacity-60";

            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={`text-left px-4 py-3 rounded-xl border text-[14.5px] font-medium transition-colors ${tone}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <p className="mt-4 text-[13.5px] text-ink-soft leading-relaxed border-t border-line pt-4">
            {current.explanation}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          {!revealed ? (
            <Button onClick={submit} disabled={selected === null}>
              Submit
            </Button>
          ) : (
            <Button onClick={next}>
              {isLast ? "Finish" : "Next question"}
              <IconArrow className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-ink-faint">
        Daily quiz
      </p>
      <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.02em] leading-[1.1]">
        Stay interview-ready.
      </h1>
      <Link href="/settings" className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-brand">
        <IconBook className="w-3.5 h-3.5" />
        Update resume in Settings
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-ink-faint">{label}</p>
      <p className="text-[18px] font-extrabold tnum">{value}</p>
    </div>
  );
}

function HistoryList({ history }: { history: QuizRecord[] }) {
  const answered = [...history]
    .filter((q) => q.correct !== null)
    .sort((a, b) => b.askedAt - a.askedAt)
    .slice(0, 8);

  if (answered.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-ink-faint mb-2">
        Recent questions
      </p>
      <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
        {answered.map((q) => (
          <div key={q.id} className="px-4 py-3 flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${q.correct ? "bg-mint" : "bg-rose"}`}
              aria-hidden="true"
            />
            <p className="flex-1 min-w-0 text-[13.5px] truncate">{q.question}</p>
            <span className="text-[11px] font-semibold text-ink-faint shrink-0">
              L{q.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
