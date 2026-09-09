import Link from "next/link";
import { IconArrow } from "@/components/app/icons";

/**
 * The greeting banner. The sunrise is drawn rather than loaded: it scales to
 * any width, costs no request, and takes its palette from the same tokens as
 * the rest of the page.
 */
export function Hero({ firstName, cta }: { firstName: string; cta: { label: string; href: string } }) {
  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[#dbe7ff] via-[#e4ecff] to-[#f5ece6]" />
      <Sunrise />

      <div className="relative px-6 sm:px-9 py-8 sm:py-10 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold tracking-[0.18em] uppercase text-[#5b6b95] mb-3">
            Good morning ☀️
          </p>
          <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.025em] leading-[1.1] text-[#101a35] text-balance">
            Let&rsquo;s make it a great day, {firstName}!
          </h1>
          <p className="mt-2 text-[15px] text-[#4a5a80]">
            &ldquo;Discipline today, a better you tomorrow.&rdquo;
          </p>

          <Link
            href={cta.href}
            className="mt-6 inline-flex items-center gap-2.5 h-12 px-6 rounded-full bg-[#111c38] text-white font-semibold text-[15px] hover:bg-[#1b2a4e] transition-colors"
          >
            {cta.label}
            <IconArrow className="w-[18px] h-[18px]" />
          </Link>
        </div>

        <blockquote className="hidden lg:block max-w-[190px] border-l-2 border-[#b9c8ea] pl-4">
          <p className="text-[14px] italic leading-relaxed text-[#4a5a80]">
            &ldquo;A little progress every day adds up to big results.&rdquo;
          </p>
        </blockquote>
      </div>
    </section>
  );
}

function Sunrise() {
  return (
    <svg
      viewBox="0 0 900 260"
      preserveAspectRatio="xMaxYMax slice"
      className="absolute inset-y-0 right-0 h-full w-[62%] pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff6e0" />
          <stop offset="70%" stopColor="#ffe9b8" />
          <stop offset="100%" stopColor="#ffe0a0" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <circle cx="600" cy="150" r="86" fill="url(#sun)" />
      <path d="M330 200 430 138 500 172 585 118 660 165 760 112 900 168V260H330z" fill="#a8bde8" opacity="0.5" />
      <path d="M300 228 420 176 520 208 620 160 720 196 830 158 900 186V260H300z" fill="#8ba6df" opacity="0.55" />
      <path
        d="M470 260c30-40 92-58 126-34s18 34 74 34z"
        fill="#f2f6ff"
        opacity="0.5"
      />
    </svg>
  );
}
