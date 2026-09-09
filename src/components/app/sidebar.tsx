"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBars,
  IconChart,
  IconCheck,
  IconClock,
  IconGear,
  IconHeart,
  IconHome,
  IconPlan,
  IconRadar,
  IconSuitcase,
  IconTarget,
} from "./icons";

const PRIMARY = [
  { href: "/dashboard", label: "Dashboard", Icon: IconHome },
  { href: "/plan", label: "Plan My Day", Icon: IconPlan },
  { href: "/tasks", label: "My Tasks", Icon: IconCheck },
  { href: "/goals", label: "Goals", Icon: IconTarget },
  { href: "/habits", label: "Habits", Icon: IconBars },
  { href: "/health", label: "Health", Icon: IconHeart },
  { href: "/focus", label: "Focus", Icon: IconClock },
  { href: "/analytics", label: "Analytics", Icon: IconChart },
  { href: "/career", label: "Career", Icon: IconSuitcase },
  { href: "/radar", label: "Radar", Icon: IconRadar },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="h-full flex flex-col bg-surface border-r border-line">
      <div className="px-5 h-[72px] flex items-center gap-2.5 shrink-0">
        <Logo />
        <span className="font-extrabold text-[19px] tracking-[-0.02em]">Rushour</span>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto scroll-slim" aria-label="Main">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] transition-colors ${
                  isActive(href)
                    ? "bg-brand-soft text-brand font-semibold"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink font-medium"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          ))}
        </ul>

      </nav>

      <div className="px-3 pb-3 shrink-0">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors ${
            isActive("/settings")
              ? "bg-brand-soft text-brand font-semibold"
              : "text-ink-soft hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <IconGear />
          Settings
        </Link>

        <PromoCard />
      </div>
    </div>
  );
}

function Logo() {
  // Sourced from /public/assets/logo.png.
  return (
    <Image
      src="/assets/logo.png"
      alt="Rushour"
      width={36}
      height={36}
      className="w-9 h-9 rounded-xl object-cover shrink-0"
      priority
    />
  );
}

/** The one piece of decoration in the shell, and it carries the product's line. */
function PromoCard() {
  return (
    <div className="mt-3 rounded-2xl overflow-hidden bg-gradient-to-b from-[#e9f0ff] to-[#dbeafe] p-4 relative">
      <p className="font-bold text-[15px] leading-snug text-[#1b2440] relative z-10">
        Small steps.
        <br />
        Bigger tomorrows.
      </p>
      <svg viewBox="0 0 200 70" className="absolute bottom-0 left-0 w-full" aria-hidden="true">
        <circle cx="150" cy="30" r="16" fill="#fbbf24" opacity="0.85" />
        <path d="M0 55 40 34 72 50 108 26 148 46 200 22V70H0z" fill="#a9c4f5" opacity="0.75" />
        <path d="M0 66 46 48 92 62 140 44 200 60V70H0z" fill="#7fa4ee" opacity="0.85" />
      </svg>
    </div>
  );
}
