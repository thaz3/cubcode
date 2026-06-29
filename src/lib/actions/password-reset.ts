"use server";

import bcrypt from "bcryptjs";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import {
  createPasswordResetToken,
  findValidPasswordResetToken,
} from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

const PASSWORD_RESET_SENT_MESSAGE =
  "If an account exists for that email, we sent a reset link. Check your inbox and spam folder.";

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    try {
      const rawToken = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail({ email: user.email, rawToken });
    } catch (error) {
      console.error("[cub-password-reset] Failed to send reset email:", error);
      if (process.env.NODE_ENV === "development") {
        return {
          success: `${PASSWORD_RESET_SENT_MESSAGE} (Dev: also check the server terminal for the link if SMTP is not set.)`,
        };
      }
      return {
        error:
          "We could not send a reset email right now. Try again later or contact support.",
      };
    }
  }

  return { success: PASSWORD_RESET_SENT_MESSAGE };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const record = await findValidPasswordResetToken(parsed.data.token);
  if (!record) {
    return {
      error: "This reset link is invalid or expired. Request a new one from the log in page.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.passwordResetToken.deleteMany({
      where: {
        userId: record.userId,
        usedAt: null,
        id: { not: record.id },
      },
    }),
  ]);

  return {
    success: "Password updated. You can log in with your new password.",
  };
}
