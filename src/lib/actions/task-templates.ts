"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cubRewardFields } from "@/lib/cub-task-fields";
import {
  templateTaskFields,
} from "@/lib/template-task-fields";
import { db } from "@/lib/db";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import {
  taskTemplateSchema,
  validateTaskDefinition,
} from "@/lib/validations/task";
import { getDueFieldsFromFormData } from "@/lib/due-date-fields";
import { parseIsUrgentFromFormData } from "@/lib/task-assign-fields";
import { parseRecurrenceFromFormData } from "@/lib/task-recurrence";
import { syncGuardianNudgesForFamily } from "@/lib/guardian-nudges/sync";
import type { TaskRecurrence } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/auth";
import type { z } from "zod";

type ParsedTemplate = z.infer<typeof taskTemplateSchema>;

function revalidateTaskPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/library");
  revalidatePath("/dashboard/tasks/templates");
  revalidatePath("/dashboard/tasks/review");
}

function parseTemplateFormData(
  formData: FormData,
  options?: { existingProofType?: ParsedTemplate["proofType"] },
): { ok: true; data: ParsedTemplate } | { ok: false; error: string } {
  const parsed = taskTemplateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    subcategory: formData.get("subcategory") || undefined,
    growthCategory: formData.get("growthCategory") || undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const validationError = validateTaskDefinition(parsed.data, options);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  return { ok: true, data: parsed.data };
}

function templateSettingsData(parsed: ParsedTemplate, formData: FormData) {
  return {
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    subcategory:
      parsed.category === "FOCUS_BLOCK" ? null : parsed.subcategory ?? null,
    growthCategory:
      parsed.category === "FOCUS_BLOCK" ? parsed.growthCategory ?? null : null,
    proofType: parsed.proofType,
    proofPrompt: parsed.proofPrompt || null,
    proofChecklistItems: parsed.proofChecklistItems ?? undefined,
    recurrence: parseRecurrenceFromFormData(formData),
  };
}

export async function createTaskTemplateAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseTemplateFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await db.taskTemplate.create({
    data: {
      familyId: family.id,
      ...templateSettingsData(parsed.data, formData),
    },
  });

  revalidateTaskPaths();
  redirect("/dashboard/tasks/templates");
}

export async function updateTaskTemplateAction(
  templateId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const template = await db.taskTemplate.findFirst({
    where: { id: templateId, familyId: family.id },
  });

  if (!template) {
    return { error: "Template not found." };
  }

  const parsed = parseTemplateFormData(formData, {
    existingProofType: template.proofType,
  });
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await db.taskTemplate.update({
    where: { id: template.id },
    data: templateSettingsData(parsed.data, formData),
  });

  revalidateTaskPaths();
  return { success: "Template updated." };
}

export async function deactivateTaskTemplateAction(
  templateId: string,
): Promise<void> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const template = await db.taskTemplate.findFirst({
    where: { id: templateId, familyId: family.id },
  });

  if (!template) {
    throw new Error("Template not found.");
  }

  await db.taskTemplate.update({
    where: { id: template.id },
    data: { isActive: false },
  });

  revalidateTaskPaths();
  redirect("/dashboard/tasks/templates");
}

async function getCubInFamily(cubId: string, familyId: string) {
  return db.cub.findFirst({ where: { id: cubId, familyId } });
}

export async function createTaskFromTemplateAction(
  templateId: string,
  cubId?: string,
  dueAt?: Date | null,
  dueAtHasTime = false,
  recurrence?: TaskRecurrence,
  isUrgent = false,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const template = await db.taskTemplate.findFirst({
    where: { id: templateId, familyId: family.id, isActive: true },
  });

  if (!template) {
    return { error: "Template not found." };
  }

  let cub = null;
  if (cubId) {
    cub = await getCubInFamily(cubId, family.id);
    if (!cub) {
      return { error: "Cub not found." };
    }
  }

  await db.task.create({
    data: {
      familyId: family.id,
      templateId: template.id,
      title: template.title,
      description: template.description,
      ...templateTaskFields(template),
      ...(cub ? cubRewardFields(cub) : {}),
      status: cubId ? "CLAIMED" : "AVAILABLE",
      cubId: cubId ?? null,
      claimedAt: cubId ? new Date() : null,
      isUrgent: cubId ? isUrgent : false,
      dueAt: cubId ? dueAt ?? null : null,
      dueAtHasTime: cubId ? dueAtHasTime : false,
      recurrence: recurrence ?? template.recurrence,
    },
  });

  revalidateTaskPaths();
  if (cubId) {
    await syncGuardianNudgesForFamily(family.id);
    revalidatePath(`/dashboard/cubs/${cubId}/tasks`);
    revalidatePath(`/dashboard/cubs/${cubId}/tasks/completed`);
  }

  return { success: cubId ? "Task assigned to Cub." : "Task saved to library." };
}

export async function assignTemplateToCubAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const templateId = formData.get("templateId")?.toString();
  const cubId = formData.get("cubId")?.toString();

  if (!templateId || !cubId) {
    return { error: "Choose a template to assign." };
  }

  const dueFields = getDueFieldsFromFormData(formData);
  const recurrence = parseRecurrenceFromFormData(formData);
  return createTaskFromTemplateAction(
    templateId,
    cubId,
    dueFields?.dueAt ?? null,
    dueFields?.dueAtHasTime ?? false,
    recurrence,
    parseIsUrgentFromFormData(formData),
  );
}
