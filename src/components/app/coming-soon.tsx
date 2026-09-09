import Link from "next/link";
import { PageHead } from "./bits";
import { IconArrow } from "./icons";

export function ComingSoon({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-[720px] mx-auto pt-1">
      <PageHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="rounded-2xl border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-[14.5px] text-ink-soft">This screen is next up.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-brand hover:opacity-80"
        >
          Back to dashboard
          <IconArrow className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
