import { headers } from "next/headers";
import { getFamilyForUser } from "@/lib/session";
import {
  isParentAreaUnlocked,
  safeParentReturnTo,
} from "@/lib/parent-pin";
import { redirect } from "next/navigation";

export async function requireParentUnlock(userId: string): Promise<void> {
  const family = await getFamilyForUser(userId);
  if (!family?.parentPinHash) {
    return;
  }

  const unlocked = await isParentAreaUnlocked(userId, family.id);
  if (unlocked) {
    return;
  }

  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ??
    headersList.get("x-url") ??
    "/dashboard";
  const returnTo = safeParentReturnTo(pathname);

  redirect(
    `/parent/unlock?returnTo=${encodeURIComponent(returnTo)}`,
  );
}
