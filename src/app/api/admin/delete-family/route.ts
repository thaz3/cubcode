import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminAuthError, assertAdminAuthorized } from "@/lib/admin/admin-auth";
import {
  deleteFamilyByParentEmail,
  FamilyDeletionError,
  formatFamilyDeletionPreview,
} from "@/lib/admin/family-deletion";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.email(),
  confirmEmail: z.email().optional(),
  dryRun: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    assertAdminAuthorized(request.headers.get("authorization"));

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, confirmEmail, dryRun = true } = parsed.data;

    if (!dryRun && !confirmEmail) {
      return NextResponse.json(
        {
          error:
            "confirmEmail is required when dryRun is false. It must match email exactly.",
        },
        { status: 400 },
      );
    }

    const result = await deleteFamilyByParentEmail({
      email,
      confirmEmail: confirmEmail ?? email,
      dryRun,
    });

    return NextResponse.json({
      dryRun: result.dryRun,
      deleted: result.deleted,
      preview: result.preview,
      log: formatFamilyDeletionPreview(result.preview),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof FamilyDeletionError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Admin delete-family failed:", error);
    return NextResponse.json(
      { error: "Unexpected error while processing deletion request." },
      { status: 500 },
    );
  }
}
