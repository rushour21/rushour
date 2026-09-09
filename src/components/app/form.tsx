"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-ink-faint">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-surface border border-line text-[14.5px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={`${inputClass} ${props.className ?? ""}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** A row of mutually exclusive choices - reads faster than a select for 3-5 options. */
export function ChoiceRow<T extends string>({
  value,
  onChange,
  options,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; tone?: string }[];
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-10 px-3.5 rounded-xl text-[13.5px] font-semibold border transition-colors ${
              active
                ? o.tone ?? "border-brand bg-brand-soft text-brand"
                : "border-line text-ink-soft hover:border-line-strong"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FormActions({
  onCancel,
  submitLabel,
  disabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 px-4 rounded-xl border border-line text-[14px] font-semibold hover:bg-surface-2 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="h-11 px-5 rounded-xl bg-brand text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>
    </div>
  );
}
