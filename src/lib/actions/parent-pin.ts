"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";
import {
  clearParentUnlockCookie,
  hashParentPin,
  safeParentReturnTo,
  setParentUnlockCookie,
  verifyParentPin,
} from "@/lib/parent-pin";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { db } from "@/lib/db";
import {
  removeParentPinSchema,
  setParentPinSchema,
  verifyParentPinSchema,
} from "@/lib/validations/parent-pin";

export async function verifyParentPinAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = verifyParentPinSchema.safeParse({
    pin: formData.get("pin"),
    returnTo: formData.get("returnTo")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid PIN." };
  }

  if (!family.parentPinHash) {
    redirect(
      `/parent/unlock?returnTo=${encodeURIComponent(safeParentReturnTo(parsed.data.returnTo))}`,
    );
  }

  const valid = await verifyParentPin(parsed.data.pin, family.parentPinHash);
  if (!valid) {
    return { error: "Wrong PIN. Try again." };
  }

  await setParentUnlockCookie(userId, family.id);
  redirect(safeParentReturnTo(parsed.data.returnTo));
}

export async function setParentPinAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = setParentPinSchema.safeParse({
    newPin: formData.get("newPin"),
    confirmPin: formData.get("confirmPin"),
    currentPin: formData.get("currentPin")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid PIN." };
  }

  if (family.parentPinHash) {
    if (!parsed.data.currentPin) {
      return { error: "Enter your current PIN to change it." };
    }
    const currentValid = await verifyParentPin(
      parsed.data.currentPin,
      family.parentPinHash,
    );
    if (!currentValid) {
      return { error: "Current PIN is wrong." };
    }
  }

  const isFirstPin = !family.parentPinHash;
  const parentPinHash = await hashParentPin(parsed.data.newPin);

  await db.family.update({
    where: { id: family.id },
    data: { parentPinHash },
  });

  await setParentUnlockCookie(userId, family.id);

  revalidatePath("/dashboard/family/settings");
  revalidatePath("/parent/unlock");

  const returnTo = formData.get("returnTo")?.toString();
  if (isFirstPin && returnTo) {
    redirect(safeParentReturnTo(returnTo));
  }

  return {
    success: isFirstPin
      ? "Parent PIN set. Cub view will now ask for this PIN to open the parent area."
      : "Parent PIN updated.",
  };
}

/** Called when Cub view mounts — ends parent unlock without affecting prefetch/RSC. */
export async function clearParentUnlockOnCubViewAction(): Promise<void> {
  await clearParentUnlockCookie();
}

export async function removeParentPinAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  if (!family.parentPinHash) {
    return { error: "No parent PIN is set." };
  }

  const parsed = removeParentPinSchema.safeParse({
    currentPin: formData.get("currentPin"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid PIN." };
  }

  const valid = await verifyParentPin(parsed.data.currentPin, family.parentPinHash);
  if (!valid) {
    return { error: "Current PIN is wrong." };
  }

  await db.family.update({
    where: { id: family.id },
    data: { parentPinHash: null },
  });

  await clearParentUnlockCookie();

  revalidatePath("/dashboard/family/settings");

  return { success: "Parent PIN removed." };
}
