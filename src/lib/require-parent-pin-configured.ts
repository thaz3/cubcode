import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import { requireFamilyForUser, requireUserId } from "@/lib/session";

export async function requireParentPinConfigured(): Promise<{
  ok: true;
} | { ok: false; error: string }> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  if (!family.parentPinHash) {
    return {
      ok: false,
      error: `Set a parent PIN before changing household or ${SMALL_REMINDERS_LABEL} settings.`,
    };
  }

  return { ok: true };
}
