"use client";

import { useActionState } from "react";
import { signInAction } from "@/lib/actions/auth";
import { Button, ErrorNote, Field, Label } from "@/components/ui";

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
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
          autoComplete="current-password"
        />
      </div>
      <ErrorNote>{state?.error}</ErrorNote>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
