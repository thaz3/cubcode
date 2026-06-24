import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

export const PARENT_UNLOCK_COOKIE = "cub_parent_unlock";
const UNLOCK_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours on a shared device

function pinSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for parent PIN unlock.");
  }
  return secret;
}

export async function hashParentPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyParentPin(
  pin: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(pin, hash);
}

export function createParentUnlockToken(
  userId: string,
  familyId: string,
): string {
  const exp = Date.now() + UNLOCK_TTL_MS;
  const payload = `${userId}:${familyId}:${exp}`;
  const sig = crypto
    .createHmac("sha256", pinSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyParentUnlockToken(
  token: string,
  userId: string,
  familyId: string,
): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;

    const sig = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);
    const parts = payload.split(":");
    if (parts.length !== 3) return false;

    const [uid, fid, expStr] = parts;
    if (uid !== userId || fid !== familyId) return false;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;

    const expected = crypto
      .createHmac("sha256", pinSecret())
      .update(payload)
      .digest("hex");
    return sig === expected;
  } catch {
    return false;
  }
}

export async function setParentUnlockCookie(
  userId: string,
  familyId: string,
): Promise<void> {
  const token = createParentUnlockToken(userId, familyId);
  const cookieStore = await cookies();
  cookieStore.set(PARENT_UNLOCK_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UNLOCK_TTL_MS / 1000,
  });
}

export async function clearParentUnlockCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PARENT_UNLOCK_COOKIE);
}

export async function isParentAreaUnlocked(
  userId: string,
  familyId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARENT_UNLOCK_COOKIE)?.value;
  if (!token) return false;
  return verifyParentUnlockToken(token, userId, familyId);
}

/** Only allow internal dashboard redirects after PIN unlock. */
export function safeParentReturnTo(value: string | null | undefined): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/dashboard")) return "/dashboard";
  if (value.includes("//") || value.includes("\\")) return "/dashboard";
  return value;
}
