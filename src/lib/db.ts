import { statSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
};

function getPrismaSchemaVersion(): string {
  const schemaPath = join(process.cwd(), "prisma/schema.prisma");
  const clientPath = join(process.cwd(), "src/generated/prisma/client.ts");
  return `${statSync(schemaPath).mtimeMs}:${statSync(clientPath).mtimeMs}`;
}

function resolveConnectionString(connectionString: string): string {
  if (!connectionString.startsWith("prisma+postgres://")) {
    return connectionString;
  }

  const apiKey = new URL(connectionString).searchParams.get("api_key");
  if (!apiKey) {
    throw new Error(
      "DATABASE_URL uses prisma+postgres:// but is missing api_key. Use the TCP postgres:// URL from `npx prisma dev ls` for the app.",
    );
  }

  const payload = JSON.parse(
    Buffer.from(apiKey.split(".")[1] ?? "", "base64url").toString("utf8"),
  ) as { databaseUrl?: string };

  if (!payload.databaseUrl) {
    throw new Error(
      "Could not resolve DATABASE_URL from prisma+postgres api_key. Use the TCP postgres:// URL from `npx prisma dev ls`.",
    );
  }

  return payload.databaseUrl;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({
    connectionString: resolveConnectionString(connectionString),
  });
  return new PrismaClient({ adapter });
}

const schemaVersion = getPrismaSchemaVersion();

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prismaSchemaVersion !== schemaVersion
) {
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.prismaSchemaVersion = schemaVersion;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaSchemaVersion = schemaVersion;
}
