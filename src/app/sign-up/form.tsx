"use client";

import { useActionState } from "react";
import { signUpAction } from "@/lib/actions/auth";
import { Button, ErrorNote, Field, Label } from "@/components/ui";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, undefined);

  // Read the timezone as the form is submitted. Doing it in an effect would set
  // state during render; a lazy initialiser would resolve the server's zone
  // during SSR and then mismatch on hydration.
  function submit(formData: FormData) {
    formData.set(
      "timezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    );
    return action(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Field id="name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Field id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Field
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="mt-1.5 text-[13px] text-ink-faint">At least 8 characters.</p>
      </div>
      <ErrorNote>{state?.error}</ErrorNote>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
