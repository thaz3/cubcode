import type { NextConfig } from "next";

/**
 * Next.js 16 blocks cross-origin dev requests by default.
 * Required when testing on iPad/phone via LAN IP (e.g. http://192.168.1.5:3000).
 * Set ALLOWED_DEV_ORIGINS=http://192.168.1.5:3000 in .env.local
 */
function parseAllowedDevOrigins(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins(),
};

export default nextConfig;
