import { requireFamilyForUser, requireUserId } from "@/lib/session";

export async function requireParentPinConfigured(): Promise<{
  ok: true;
} | { ok: false; error: string }> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  if (!family.parentPinHash) {
    return {
      ok: false,
      error: "Set a parent PIN before changing household or Guardian Nudge settings.",
    };
  }

  return { ok: true };
}
