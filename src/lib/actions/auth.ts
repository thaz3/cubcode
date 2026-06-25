"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { clearParentUnlockCookie } from "@/lib/parent-pin";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function signupAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      family: {
        create: {},
      },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/cub",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/cub",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await clearParentUnlockCookie();
  await signOut({ redirectTo: "/" });
}
