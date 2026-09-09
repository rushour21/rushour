"use client";

import { useEffect, useRef } from "react";
import { IconPlus } from "./icons";

/**
 * A dialog for the add/edit forms.
 *
 * Uses the native <dialog> element rather than a hand-rolled overlay: it gives
 * focus trapping, Escape-to-close and inert background content for free, which
 * are the parts a custom implementation usually gets wrong.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicks land on the dialog itself only when they hit the backdrop -
        // the panel below stops propagation for its own area.
        if (e.target === ref.current) onClose();
      }}
      className="backdrop:bg-ink/40 bg-transparent p-0 m-auto max-w-[calc(100vw-2rem)]"
    >
      <div
        className="w-[440px] max-w-full bg-surface border border-line rounded-2xl shadow-[var(--shadow-lift)] text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="min-w-0">
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">{title}</h2>
            {description && (
              <p className="mt-1 text-[13px] text-ink-soft">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 grid place-items-center rounded-lg text-ink-faint hover:bg-surface-2 hover:text-ink transition-colors shrink-0"
          >
            <IconPlus className="w-4 h-4 rotate-45" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </dialog>
  );
}

/** A destructive confirm, kept separate so the copy names what is being lost. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[14px] text-ink-soft leading-relaxed">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-xl border border-line text-[14px] font-semibold hover:bg-surface-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="h-10 px-4 rounded-xl bg-rose text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
