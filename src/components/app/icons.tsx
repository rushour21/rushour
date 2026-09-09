/**
 * Inline icons, stroked at 1.75 so they sit at the same visual weight as the
 * medium label beside them. Drawn here rather than pulled from a library: the
 * set is small, and shipping an icon package for eleven glyphs is not a trade
 * worth making.
 */
type P = { className?: string };
const base = "w-[18px] h-[18px]";
const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Svg = ({ children, className }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" className={className ?? base} aria-hidden="true" {...s}>
    {children}
  </svg>
);

export const IconHome = (p: P) => (
  <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5.5h4V21h3.5a1 1 0 0 0 1-1V9.5" /></Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>
);
export const IconTarget = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></Svg>
);
export const IconBars = (p: P) => (
  <Svg {...p}><path d="M5 20V11" /><path d="M12 20V4" /><path d="M19 20v-6" /></Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p}><path d="M4 20h16" /><path d="m5.5 15.5 4-4.5 3.5 3 5.5-6.5" /></Svg>
);
export const IconNote = (p: P) => (
  <Svg {...p}><path d="M6 3.5h8.5L19 8v12.5H6z" /><path d="M14 3.5V8h5" /><path d="M9 13h6M9 16.5h4" /></Svg>
);
export const IconCalendar = (p: P) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M3.5 10h17M8.5 3.5V6.5M15.5 3.5V6.5" /></Svg>
);
export const IconSpark = (p: P) => (
  <Svg {...p}><path d="M12 3.5 13.9 9l5.6 2-5.6 2-1.9 5.5L10.1 13 4.5 11l5.6-2z" /></Svg>
);
export const IconBook = (p: P) => (
  <Svg {...p}><path d="M4 5.5A2 2 0 0 1 6 3.5h13v14H6a2 2 0 0 0-2 2z" /><path d="M4 19.5a2 2 0 0 1 2-2h13v3H6a2 2 0 0 1-2-1z" /></Svg>
);
export const IconGear = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.3-3l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10.3 3v-.2a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1.2z" /></Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Svg>
);
export const IconBell = (p: P) => (
  <Svg {...p}><path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5z" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></Svg>
);
export const IconChevron = (p: P) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
);
export const IconArrow = (p: P) => (
  <Svg {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></Svg>
);
export const IconDots = (p: P) => (
  <Svg {...p}><circle cx="12" cy="5.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none" /></Svg>
);
export const IconFlame = (p: P) => (
  <Svg {...p}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.4 1-3.4S9.5 10 10 11c.5-3.5 2-6.5 2-8z" /></Svg>
);
export const IconLaptop = (p: P) => (
  <Svg {...p}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2.5 19.5h19" /></Svg>
);
export const IconHeart = (p: P) => (
  <Svg {...p}><path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20z" /></Svg>
);
export const IconLeaf = (p: P) => (
  <Svg {...p}><path d="M5 19c0-8 6-13 14-13 0 8-5 13-13 13H5z" /><path d="M5 19c2-4 5-7 9-9" /></Svg>
);
export const IconSun = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" /></Svg>
);
export const IconPlan = (p: P) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M3.5 10h17M8.5 3.5V6.5M15.5 3.5V6.5" /><path d="m9 15 2 2 4-4" /></Svg>
);
export const IconSuitcase = (p: P) => (
  <Svg {...p}><rect x="3" y="7.5" width="18" height="12" rx="3" /><path d="M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7" /><path d="M3 12.5h18" /></Svg>
);
export const IconRadar = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><path d="M12 12 18 6" /></Svg>
);
export const IconBolt = (p: P) => (
  <Svg {...p}><path d="M13.5 3 6 13.5h5l-.5 7.5L18 10.5h-5z" /></Svg>
);
export const IconBulb = (p: P) => (
  <Svg {...p}><path d="M9.5 18h5M10 21h4" /><path d="M12 3a6 6 0 0 1 3.5 10.9V15h-7v-1.1A6 6 0 0 1 12 3z" /></Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconPlay = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M10.5 9.2 15 12l-4.5 2.8z" fill="currentColor" /></Svg>
);
export const IconBookmark = (p: P) => (
  <Svg {...p}><path d="M6.5 4h11v16.5l-5.5-4-5.5 4z" /></Svg>
);
export const IconUsers = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" /><path d="M16 6.2a3.2 3.2 0 0 1 0 6.1M17.5 19.5a5.5 5.5 0 0 0-2-4.2" /></Svg>
);
export const IconFork = (p: P) => (
  <Svg {...p}><path d="M7 3v7a2.5 2.5 0 0 0 5 0V3M9.5 12.5V21" /><path d="M17 3c-1.5 1.5-2 3-2 5.5s.7 3 2 3.2V21" /></Svg>
);
export const IconDumbbell = (p: P) => (
  <Svg {...p}><path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" /></Svg>
);
export const IconChevronLeft = (p: P) => (
  <Svg {...p}><path d="m14 6-6 6 6 6" /></Svg>
);
export const IconChevronRight = (p: P) => (
  <Svg {...p}><path d="m10 6 6 6-6 6" /></Svg>
);
export const IconInfo = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none" /></Svg>
);
