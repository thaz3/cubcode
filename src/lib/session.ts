import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getFamilyForUser(userId: string) {
  return db.family.findUnique({
    where: { ownerId: userId },
    include: {
      cubs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function requireFamilyForUser(userId: string) {
  const family = await getFamilyForUser(userId);
  if (!family) {
    throw new Error("Family not found");
  }
  return family;
}
