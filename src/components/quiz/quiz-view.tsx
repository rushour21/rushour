"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { profileStore } from "@/lib/store/profile";
import { quizStore, newQuizId, type QuizRecord } from "@/lib/store/quiz";
import { quizSessionStore } from "@/lib/store/quiz-session";
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

/**
 * The daily quiz: up to 10 questions, wrong-answered ones from previous
 * days retried first, new ones generated at the current difficulty and
 * grounded in the resume, correct answers retired permanently, difficulty
 * only ever moving one step per answer.
 *
 * The generated batch and the user's place in it are both persisted
 * (quizStore for the questions, quizSessionStore for the order/index) so
 * leaving mid-quiz and coming back resumes at the same question instead of
 * generating a new batch from the AI.
 */
export function QuizView() {
  const profile = profileStore.useProfile();
  const history = quizStore.useItems();
  const activeSession = quizSessionStore.useSession();

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => localDateKey(new Date()), []);
  const difficulty = useMemo(() => currentDifficulty(history), [history]);
  const retries = useMemo(() => dueForRetry(history, today), [history, today]);

  const todayAnswered = history.filter((q) => q.correct !== null && localDateKey(new Date(q.askedAt)) === today);
  const alreadyDoneToday = todayAnswered.length >= MAX_QUESTIONS_PER_DAY;

  const started = activeSession !== null && activeSession.date === today;
  const byId = useMemo(() => new Map(history.map((q) => [q.id, q])), [history]);
  const queue = useMemo(
    () =>
      started
        ? activeSession!.order.map((id) => byId.get(id)).filter((q): q is QuizRecord => q !== undefined)
        : [],
    [started, activeSession, byId],
  );
  const index = activeSession?.index ?? 0;

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
          // Persist the freshly generated questions immediately, so the
          // batch survives a reload instead of being regenerated.
          generated.forEach((q) => quizStore.add(q));
        }
      }

      const order = [...retrySlice, ...generated].slice(0, MAX_QUESTIONS_PER_DAY).map((q) => q.id);
      if (order.length === 0) {
        setError("Nothing to ask right now.");
        return;
      }

      quizSessionStore.save({ date: today, order, index: 0 });
      setSelected(null);
      setRevealed(false);
    });
  }

  function handleSubmit() {
    if (selected === null) return;
    const current = queue[index];
    const correct = selected === current.correctIndex;
    const askedAt = Date.now();

    quizStore.update(current.id, { answeredIndex: selected, correct, askedAt });
    setRevealed(true);
  }

  function handleNext() {
    setSelected(null);
    setRevealed(false);
    quizSessionStore.setIndex(index + 1);
  }

  function handleFinishQuiz() {
    quizSessionStore.clear();
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

  if (!started) {
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

  const current = queue[index];
  const isLast = index === queue.length - 1;
  const finished = index >= queue.length;

  if (finished) {
    const correctCount = queue.filter((q) => q.correct).length;
    return (
      <div className="max-w-[560px] mx-auto pt-1">
        <Header />
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-ink-faint mb-2">
            Quiz complete
          </p>
          <p className="text-[32px] font-extrabold tnum tracking-[-0.02em] mb-1">
            {correctCount} / {queue.length}
          </p>
          <p className="text-[14px] text-ink-soft mb-5">
            {correctCount === queue.length
              ? "Every one right - all retired."
              : "Wrong ones will come back on another day."}
          </p>
          <Button onClick={handleFinishQuiz}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[560px] mx-auto pt-1">
      <Header />
      <div className="mt-6 flex items-center justify-between gap-3 mb-3">
        <span className="text-[12.5px] font-semibold text-ink-soft tnum">
          Question {index + 1} of {queue.length}
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
            <Button onClick={handleSubmit} disabled={selected === null}>
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext}>
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
