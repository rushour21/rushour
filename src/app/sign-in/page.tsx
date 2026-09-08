import Link from "next/link";
import { SignInForm } from "./form";

export default function SignInPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[26rem]">
        <h1 className="font-display text-3xl font-700 tracking-[-0.02em] mb-8">
          Sign in
        </h1>
        <SignInForm />
        <p className="mt-6 text-[14px] text-ink-soft">
          No account yet?{" "}
          <Link href="/sign-up" className="text-accent">
            Start
          </Link>
        </p>
      </div>
    </main>
  );
}
