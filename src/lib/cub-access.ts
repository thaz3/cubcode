import { getFamilyForUser } from "@/lib/session";
import type { Cub } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

export async function requireCubForUser(
  cubId: string,
  userId: string,
): Promise<{ cub: Cub; familyId: string }> {
  const family = await getFamilyForUser(userId);
  if (!family) {
    notFound();
  }

  const cub = family.cubs.find((item) => item.id === cubId);
  if (!cub) {
    notFound();
  }

  return { cub, familyId: family.id };
}
