import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/app-url";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashPasswordResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("base64url");
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db.$transaction([
    db.passwordResetToken.deleteMany({
      where: { userId, usedAt: null },
    }),
    db.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  return rawToken;
}

export function buildPasswordResetUrl(rawToken: string): string {
  const url = new URL("/reset-password", getAppBaseUrl());
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function findValidPasswordResetToken(rawToken: string) {
  const tokenHash = hashPasswordResetToken(rawToken);

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record;
}
