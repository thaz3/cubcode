/**
 * Admin-only beta data deletion by parent email.
 *
 * Dry run (default — logs what would be deleted):
 *   npm run admin:delete-family -- --email parent@example.com
 *
 * Actually delete (requires matching --confirm):
 *   npm run admin:delete-family -- --email parent@example.com --confirm parent@example.com
 */
import "dotenv/config";
import {
  deleteFamilyByParentEmail,
  FamilyDeletionError,
  formatFamilyDeletionPreview,
} from "../src/lib/admin/family-deletion";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function main() {
  const email = readArg("--email");
  const confirmEmail = readArg("--confirm");

  if (!email) {
    console.error("Missing required flag: --email parent@example.com");
    console.error("");
    console.error("Dry run:");
    console.error("  npm run admin:delete-family -- --email parent@example.com");
    console.error("");
    console.error("Delete after review:");
    console.error(
      "  npm run admin:delete-family -- --email parent@example.com --confirm parent@example.com",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const dryRun = !confirmEmail;

  try {
    const result = await deleteFamilyByParentEmail({
      email,
      confirmEmail: confirmEmail ?? email,
      dryRun,
    });

    console.log(formatFamilyDeletionPreview(result.preview));
    console.log("");

    if (result.dryRun) {
      console.log("Dry run only — nothing was deleted.");
      console.log(
        "To delete, rerun with --confirm matching the parent email exactly.",
      );
      return;
    }

    console.log("Deletion complete.");
    console.log(`Removed account: ${result.preview.email}`);
  } catch (error) {
    if (error instanceof FamilyDeletionError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  } finally {
    const { db } = await import("../src/lib/db");
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
