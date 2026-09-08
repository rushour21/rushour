import Link from "next/link";
import { SignUpForm } from "./form";

export default function SignUpPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[26rem]">
        <h1 className="font-display text-3xl font-700 tracking-[-0.02em] mb-2">
          Start
        </h1>
        <p className="text-ink-soft mb-8 text-[15px]">
          Three short steps, then you clock in.
        </p>
        <SignUpForm />
        <p className="mt-6 text-[14px] text-ink-soft">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
