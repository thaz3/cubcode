import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/app-url";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashParentPinResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createParentPinResetToken(
  userId: string,
  familyId: string,
): Promise<string> {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("base64url");
  const tokenHash = hashParentPinResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db.$transaction([
    db.parentPinResetToken.deleteMany({
      where: { userId, usedAt: null },
    }),
    db.parentPinResetToken.create({
      data: {
        userId,
        familyId,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  return rawToken;
}

export function buildParentPinResetUrl(rawToken: string): string {
  const url = new URL("/reset-parent-pin", getAppBaseUrl());
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function findValidParentPinResetToken(rawToken: string) {
  const tokenHash = hashParentPinResetToken(rawToken);

  const record = await db.parentPinResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
      family: true,
    },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record;
}

export function maskEmailForDisplay(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
