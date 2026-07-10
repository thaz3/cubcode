"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import {
  createParentPinResetToken,
  findValidParentPinResetToken,
} from "@/lib/parent-pin-reset";
import { sendParentPinResetEmail } from "@/lib/parent-pin-reset-email";
import { hashParentPin, setParentUnlockCookie } from "@/lib/parent-pin";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { resetParentPinSchema } from "@/lib/validations/parent-pin";

const PIN_RESET_SENT_MESSAGE =
  "We sent a PIN reset link. Check your inbox and spam folder.";

export async function requestParentPinResetAction(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  if (!family.parentPinHash) {
    return { error: "No parent PIN is set for this family." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    return { error: "Account not found." };
  }

  try {
    const rawToken = await createParentPinResetToken(userId, family.id);
    await sendParentPinResetEmail({ email: user.email, rawToken });
  } catch (error) {
    console.error("[cub-parent-pin-reset] Failed to send reset email:", error);
    if (process.env.NODE_ENV === "development") {
      return {
        success: `${PIN_RESET_SENT_MESSAGE} (Dev: also check the server terminal for the link if SMTP is not set.)`,
      };
    }
    return {
      error:
        "We could not send a reset email right now. Try again later or contact support.",
    };
  }

  return { success: PIN_RESET_SENT_MESSAGE };
}

export async function resetParentPinAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetParentPinSchema.safeParse({
    token: formData.get("token"),
    newPin: formData.get("newPin"),
    confirmPin: formData.get("confirmPin"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const record = await findValidParentPinResetToken(parsed.data.token);
  if (!record) {
    return {
      error:
        "This reset link is invalid or expired. Request a new one from the parent PIN screen.",
    };
  }

  const parentPinHash = await hashParentPin(parsed.data.newPin);

  await db.$transaction([
    db.family.update({
      where: { id: record.familyId },
      data: { parentPinHash },
    }),
    db.parentPinResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.parentPinResetToken.deleteMany({
      where: {
        userId: record.userId,
        usedAt: null,
        id: { not: record.id },
      },
    }),
  ]);

  await setParentUnlockCookie(record.userId, record.familyId);

  revalidatePath("/parent/unlock");
  revalidatePath("/dashboard/family/settings");

  redirect("/dashboard");
}
