import type { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet" | "danger";
}) {
  const base =
    "font-display text-sm font-600 px-4 py-2.5 rounded-[3px] transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-accent text-white hover:opacity-90",
    quiet: "border border-rule-strong text-ink hover:bg-surface-2",
    danger: "border border-over text-over hover:bg-over-soft",
  }[variant];

  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[10.5px] tracking-[0.11em] uppercase text-ink-faint block mb-1.5"
    >
      {children}
    </label>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-surface border border-rule rounded-[3px] px-3 py-2.5 text-ink
        font-body text-[15px] placeholder:text-ink-faint focus:border-accent outline-none ${props.className ?? ""}`}
    />
  );
}

export function Card({
  children,
  className = "",
  tone = "plain",
}: {
  children: ReactNode;
  className?: string;
  tone?: "plain" | "over" | "ok" | "hold";
}) {
  const tones = {
    plain: "border-rule",
    over: "border-over/40 bg-over-soft",
    ok: "border-ok/40 bg-ok-soft",
    hold: "border-hold/40 bg-hold-soft",
  }[tone];
  return (
    <div className={`bg-surface border rounded-[4px] ${tones} ${className}`}>{children}</div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-ink-faint">
      {children}
    </p>
  );
}

/** Severity is carried by shape and colour together, never colour alone. */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "over" | "ok" | "hold";
}) {
  const tones = {
    neutral: "bg-surface-2 text-ink-soft",
    accent: "bg-accent-soft text-accent",
    over: "bg-over-soft text-over",
    ok: "bg-ok-soft text-ok",
    hold: "bg-hold-soft text-hold",
  }[tone];
  return (
    <span
      className={`font-mono text-[10px] font-700 tracking-[0.09em] uppercase px-2 py-1 rounded-[3px] ${tones}`}
    >
      {children}
    </span>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="text-[14px] text-over bg-over-soft border border-over/30 rounded-[3px] px-3 py-2"
    >
      {children}
    </p>
  );
}
