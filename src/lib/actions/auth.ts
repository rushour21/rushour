"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { connectDb } from "@/lib/db/client";
import { User } from "@/lib/db/models";

const signUpSchema = z.object({
  name: z.string().min(1, "Enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  timezone: z.string().default("UTC"),
});

export type FormState = { error?: string } | undefined;

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await connectDb();
  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) {
    return { error: "That email is already registered. Sign in instead." };
  }

  await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
    timezone: parsed.data.timezone,
    onboarding: { identity: true, direction: false, constraints: false },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/onboarding/direction");
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { error: "That email and password do not match an account." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
