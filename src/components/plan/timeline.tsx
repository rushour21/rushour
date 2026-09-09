import {
  IconDumbbell,
  IconFork,
  IconLaptop,
  IconNote,
  IconUsers,
} from "@/components/app/icons";
import { hm, type Block } from "@/lib/sample/data";

const KIND = {
  deep: { tint: "bg-sky-soft", icon: <IconLaptop />, ink: "text-sky" },
  meeting: { tint: "bg-violet-soft", icon: <IconUsers />, ink: "text-violet" },
  break: { tint: "bg-surface-2", icon: <IconFork />, ink: "text-ink-soft" },
  health: { tint: "bg-mint-soft", icon: <IconDumbbell />, ink: "text-mint" },
  admin: { tint: "bg-surface-2", icon: <IconNote />, ink: "text-ink-soft" },
} as const;

/**
 * The scheduled day. Times sit outside the blocks on a rule, so the blocks
 * themselves stay one clean column and the eye can run down either the clock
 * or the work without the two interleaving.
 */
export function Timeline({ blocks }: { blocks: Block[] }) {
  return (
    <ol className="relative flex flex-col gap-2.5 pl-[76px]">
      <span className="absolute left-[68px] inset-y-1 w-px bg-line" aria-hidden="true" />

      {blocks.map((b) => {
        const k = KIND[b.kind];
        return (
          <li key={b.id} className="relative">
            <span className="absolute -left-[76px] top-3.5 text-[12.5px] text-ink-soft tnum w-[60px] text-right">
              {b.time}
            </span>

            <div className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${k.tint}`}>
              <span className={`shrink-0 ${k.ink}`}>{k.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold truncate">{b.title}</p>
                {b.detail && (
                  <p className="text-[12.5px] text-ink-soft truncate">{b.detail}</p>
                )}
              </div>
              <span className="text-[12.5px] font-semibold text-ink-soft tnum shrink-0">
                {hm(b.minutes)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
