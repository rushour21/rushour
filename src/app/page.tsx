import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/today");

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[34rem]">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-6">
          Personal execution system
        </p>
        <h1 className="font-display text-[clamp(2.8rem,9vw,4rem)] font-700 leading-[0.98] tracking-[-0.03em] mb-5">
          Rushour
        </h1>
        <p className="text-[1.15rem] leading-[1.5] text-ink-soft mb-10 max-w-[38ch]">
          It will not help you plan more. It works out what actually fits in your
          day, holds you to it, then learns how much you can really do.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="font-display text-sm font-600 px-5 py-3 rounded-[3px] bg-accent text-white"
          >
            Start
          </Link>
          <Link
            href="/sign-in"
            className="font-display text-sm font-600 px-5 py-3 rounded-[3px] border border-rule-strong"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
