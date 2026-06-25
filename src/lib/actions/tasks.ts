"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { assertTransition, isTaskEditable } from "@/lib/task-transitions";
import { cubRewardFields } from "@/lib/cub-task-fields";
import {
  getTaskChecklistItems,
  parseChecklistFromForm,
  validateSubmissionProof,
} from "@/lib/tasks";
import {
  assignTaskSchema,
  focusBlockSchema,
  startTaskSchema,
  submitTaskSchema,
  taskIdSchema,
  taskRewardFieldsSchema,
  availableTaskSchema,
  validateTaskDefinition,
} from "@/lib/validations/task";
import { categoryRewardFields } from "@/lib/template-task-fields";
import { logTaskFocusSession } from "@/lib/focus-session";
import { getAvailableGrowthCategoriesForCub } from "@/lib/focus-growth";
import { creditApprovedTaskRewards } from "@/lib/rewards";
import { getDueFieldsFromFormData } from "@/lib/due-date-fields";
import { parseIsUrgentFromFormData } from "@/lib/task-assign-fields";
import { parseRecurrenceFromFormData } from "@/lib/task-recurrence";
import { spawnNextRecurringTask } from "@/lib/task-recurrence-server";
import {
  resolveGuardianNudgesForTask,
  syncGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
import type { ActionState } from "@/lib/actions/auth";
import type { z } from "zod";

type ParsedCustomTask = z.infer<typeof availableTaskSchema>;

function parseCustomTaskFormData(
  formData: FormData,
): { ok: true; data: ParsedCustomTask } | { ok: false; error: string } {
  const parsed = availableTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    subcategory: formData.get("subcategory") || undefined,
    growthCategory: formData.get("growthCategory") || undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
    dueDate: formData.get("dueDate")?.toString(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const validationError = validateTaskDefinition(parsed.data);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  return { ok: true, data: parsed.data };
}

function customTaskDefinitionData(parsed: ParsedCustomTask) {
  return {
    title: parsed.title,
    description: parsed.description ?? null,
    category: parsed.category,
    subcategory:
      parsed.category === "FOCUS_BLOCK" ? null : parsed.subcategory ?? null,
    growthCategory:
      parsed.category === "FOCUS_BLOCK" ? parsed.growthCategory ?? null : null,
    proofType: parsed.proofType,
    proofPrompt: parsed.proofPrompt || null,
    proofChecklistItems: parsed.proofChecklistItems ?? undefined,
    ...categoryRewardFields(parsed.category, {
      subcategory: parsed.subcategory,
      growthCategory: parsed.growthCategory ?? null,
    }),
  };
}

export async function createCustomTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseCustomTaskFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const dueFields = getDueFieldsFromFormData(formData);

  await db.task.create({
    data: {
      familyId: family.id,
      status: "AVAILABLE",
      ...customTaskDefinitionData(parsed.data),
      dueAt: dueFields?.dueAt ?? parsed.data.dueDate ?? null,
      dueAtHasTime: dueFields?.dueAtHasTime ?? false,
    },
  });

  revalidateTaskPaths();
  return { success: "Task added to the library." };
}

export async function createAndAssignCustomTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const cubId = formData.get("cubId")?.toString();
  if (!cubId) {
    return { error: "Cub not found." };
  }

  const cub = family.cubs.find((c) => c.id === cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const parsed = parseCustomTaskFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const dueFields = getDueFieldsFromFormData(formData);
  const dueAt = dueFields?.dueAt ?? parsed.data.dueDate ?? null;

  await db.task.create({
    data: {
      familyId: family.id,
      status: "CLAIMED",
      cubId: cub.id,
      claimedAt: new Date(),
      isUrgent: parseIsUrgentFromFormData(formData),
      ...customTaskDefinitionData(parsed.data),
      ...cubRewardFields(cub),
      dueAt,
      dueAtHasTime: dueFields?.dueAtHasTime ?? false,
      recurrence: parseRecurrenceFromFormData(formData),
    },
  });

  await syncGuardianNudgesAfterTaskChange(family.id);

  revalidateTaskPaths(cub.id);
  return { success: `Task created and assigned to ${cub.displayName}.` };
}

function revalidateTaskPaths(cubId?: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/library");
  revalidatePath("/dashboard/tasks/review");
  revalidatePath("/dashboard/family/settings");
  if (cubId) {
    revalidatePath(`/dashboard/cubs/${cubId}/tasks`);
    revalidatePath(`/dashboard/cubs/${cubId}/tasks/completed`);
    revalidatePath(`/dashboard/cubs/${cubId}/progress`);
    revalidatePath(`/cub/${cubId}`);
    revalidatePath(`/cub/${cubId}/tasks`);
    revalidatePath(`/cub/${cubId}/progress`);
  }
}

async function syncGuardianNudgesAfterTaskChange(
  familyId: string,
  options?: {
    taskId?: string;
    resolveTypes?: Array<
      | "NOT_TOUCHED_AFTER_ASSIGN"
      | "NOT_STARTED_BEFORE_DUE"
      | "OVERDUE_NOT_STARTED"
      | "SUBMITTED_FOR_REVIEW"
    >;
  },
) {
  if (options?.taskId && options.resolveTypes?.length) {
    await resolveGuardianNudgesForTask(
      familyId,
      options.taskId,
      options.resolveTypes,
    );
  }
  await syncGuardianNudgesForFamily(familyId);
}

async function getFamilyTask(taskId: string, familyId: string) {
  return db.task.findFirst({
    where: { id: taskId, familyId },
    include: { cub: true },
  });
}

export async function assignTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = assignTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    cubId: formData.get("cubId"),
    dueDate: formData.get("dueDate")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const cub = family.cubs.find((c) => c.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const task = await getFamilyTask(parsed.data.taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "AVAILABLE") {
    return { error: "Only available tasks can be assigned." };
  }

  assertTransition(task.status, "CLAIMED");

  const dueFields = getDueFieldsFromFormData(formData);

  await db.task.update({
    where: { id: task.id },
    data: {
      status: "CLAIMED",
      cubId: parsed.data.cubId,
      claimedAt: new Date(),
      isUrgent: parseIsUrgentFromFormData(formData),
      dueAt: dueFields?.dueAt ?? parsed.data.dueDate,
      dueAtHasTime: dueFields?.dueAtHasTime ?? false,
      recurrence: parseRecurrenceFromFormData(formData),
      ...cubRewardFields(cub),
    },
  });

  await syncGuardianNudgesAfterTaskChange(family.id, { taskId: task.id });

  revalidateTaskPaths(parsed.data.cubId);
  return { success: "Task assigned." };
}

/** @deprecated Use assignTaskAction */
export const claimTaskAction = assignTaskAction;

export async function assignTaskToCubAction(
  taskId: string,
  cubId: string,
): Promise<ActionState> {
  const formData = new FormData();
  formData.set("taskId", taskId);
  formData.set("cubId", cubId);
  return assignTaskAction({}, formData);
}

export async function startTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = startTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    growthCategory: formData.get("growthCategory") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const task = await getFamilyTask(parsed.data.taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "CLAIMED" && task.status !== "SENT_BACK") {
    return { error: "Task must be assigned or sent back before starting." };
  }

  if (task.category === "FOCUS_BLOCK") {
    if (!task.cubId) {
      return { error: "Assign this focus block to a Cub first." };
    }

    const cub = family.cubs.find((item) => item.id === task.cubId);
    if (!cub) {
      return { error: "Cub not found." };
    }

    if (!parsed.data.growthCategory) {
      return { error: "Pick a growth area for this focus session." };
    }

    const available = await getAvailableGrowthCategoriesForCub(cub);
    if (!available.includes(parsed.data.growthCategory)) {
      return {
        error:
          "You already completed this growth area this week. Pick a different one.",
      };
    }
  }

  assertTransition(task.status, "IN_PROGRESS");

  await db.task.update({
    where: { id: task.id },
    data: {
      status: "IN_PROGRESS",
      startedAt: task.startedAt ?? new Date(),
      focusSessionStartedAt: new Date(),
      growthCategory:
        task.category === "FOCUS_BLOCK"
          ? parsed.data.growthCategory ?? null
          : task.growthCategory,
    },
  });

  await syncGuardianNudgesAfterTaskChange(family.id, {
    taskId: task.id,
    resolveTypes: [
      "NOT_TOUCHED_AFTER_ASSIGN",
      "NOT_STARTED_BEFORE_DUE",
      "OVERDUE_NOT_STARTED",
    ],
  });

  revalidateTaskPaths(task.cubId);
  return { success: "Instructions opened — request timer is running." };
}

export async function logFocusBlockAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = focusBlockSchema.safeParse({
    cubId: formData.get("cubId"),
    taskId: formData.get("taskId") || undefined,
    durationMinutes: formData.get("durationMinutes"),
    startedAt: formData.get("startedAt"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const cub = family.cubs.find((c) => c.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  let taskGrowthCategory = null;
  let taskId: string | undefined = parsed.data.taskId;
  if (taskId) {
    const task = await getFamilyTask(taskId, family.id);
    if (!task || task.cubId !== cub.id) {
      return { error: "Task not found for this Cub." };
    }

    taskGrowthCategory = task.growthCategory;

    if (task.status === "CLAIMED" || task.status === "SENT_BACK") {
      await db.task.update({
        where: { id: task.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: task.startedAt ?? new Date(),
          focusSessionStartedAt: new Date(),
        },
      });
    }
  } else {
    taskId = undefined;
  }

  await db.focusBlockLog.create({
    data: {
      cubId: cub.id,
      taskId,
      durationMinutes: parsed.data.durationMinutes,
      startedAt: new Date(parsed.data.startedAt),
      note: parsed.data.note,
      growthCategory: taskGrowthCategory,
    },
  });

  if (taskId) {
    await syncGuardianNudgesAfterTaskChange(family.id, {
      taskId,
      resolveTypes: [
        "NOT_TOUCHED_AFTER_ASSIGN",
        "NOT_STARTED_BEFORE_DUE",
        "OVERDUE_NOT_STARTED",
      ],
    });
  } else {
    await syncGuardianNudgesAfterTaskChange(family.id);
  }

  revalidateTaskPaths(cub.id);
  return { success: "Focus Block logged." };
}

export async function submitTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = submitTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    reflection: formData.get("reflection") || undefined,
    proofLink: formData.get("proofLink") || undefined,
    timeLoggedMinutes: formData.get("timeLoggedMinutes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const task = await getFamilyTask(parsed.data.taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "IN_PROGRESS") {
    return {
      error: "Start the task before submitting. Focus time is logged when you submit.",
    };
  }

  const checklistItems = getTaskChecklistItems(task);
  const checklistData = parseChecklistFromForm(formData, checklistItems);
  const proofError = validateSubmissionProof(
    task.proofType,
    {
      reflection: parsed.data.reflection,
      proofLink: parsed.data.proofLink,
      timeLoggedMinutes: parsed.data.timeLoggedMinutes,
      checklistData,
    },
    checklistItems,
    { category: task.category },
  );

  if (proofError) {
    return { error: proofError };
  }

  assertTransition("IN_PROGRESS", "SUBMITTED");

  const submittedAt = new Date();
  const attemptCount =
    (await db.focusBlockLog.count({ where: { taskId: task.id } })) + 1;
  const attemptLabel =
    attemptCount > 1 ? `Redo attempt ${attemptCount}` : "Task session";

  await db.$transaction(async (tx) => {
    await logTaskFocusSession(task, {
      endedAt: submittedAt,
      attemptLabel,
      client: tx,
    });

    await tx.task.update({
      where: { id: task.id },
      data: {
        status: "SUBMITTED",
        reflection: parsed.data.reflection,
        proofLink: parsed.data.proofLink,
        timeLoggedMinutes: parsed.data.timeLoggedMinutes,
        checklistData:
          task.proofType === "CHECKLIST" ? checklistData : undefined,
        submittedAt,
        reviewNote: null,
        focusSessionStartedAt: null,
      },
    });
  });

  await syncGuardianNudgesAfterTaskChange(family.id, {
    taskId: task.id,
    resolveTypes: [
      "NOT_TOUCHED_AFTER_ASSIGN",
      "NOT_STARTED_BEFORE_DUE",
      "OVERDUE_NOT_STARTED",
    ],
  });

  revalidateTaskPaths(task.cubId);
  return { success: "Task submitted for review. Focus time was logged automatically." };
}

export async function approveTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = taskIdSchema.safeParse({ taskId: formData.get("taskId") });
  if (!parsed.success) {
    return { error: "Invalid task." };
  }

  const reviewNote = formData.get("reviewNote")?.toString().trim() || undefined;

  const task = await db.task.findFirst({
    where: { id: parsed.data.taskId, familyId: family.id },
    include: { cub: true },
  });
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "SUBMITTED") {
    return { error: "Only submitted tasks can be approved." };
  }

  if (!task.cub) {
    return { error: "Assign this task to a Cub before approving." };
  }

  assertTransition(task.status, "APPROVED");

  const creditResult = await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: task.id },
      data: {
        status: "APPROVED",
        reviewNote,
        reviewedAt: new Date(),
        reviewedByUserId: userId,
      },
    });

    const result = await creditApprovedTaskRewards(task, userId, tx);

    await tx.task.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });

    await spawnNextRecurringTask(task, tx);

    return result;
  });

  await syncGuardianNudgesAfterTaskChange(family.id, {
    taskId: task.id,
    resolveTypes: ["SUBMITTED_FOR_REVIEW"],
  });

  revalidateTaskPaths(task.cubId);
  revalidatePath(`/dashboard/tasks/review/${task.id}`);
  revalidatePath(`/dashboard/cubs/${task.cubId}/progress`);
  revalidatePath("/dashboard");

  if (creditResult.penalizedForLateSubmission) {
    return {
      success:
        "Task approved. Rewards credited at 50% — submitted after the due date.",
    };
  }

  return { success: "Task approved and rewards credited." };
}

export async function rejectTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const taskId = formData.get("taskId")?.toString();
  if (!taskId) {
    return { error: "Invalid task." };
  }

  const reviewNote = formData.get("reviewNote")?.toString().trim();
  if (!reviewNote) {
    return { error: "Add a note when rejecting a task." };
  }

  const task = await getFamilyTask(taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "SUBMITTED") {
    return { error: "Only submitted tasks can be rejected." };
  }

  assertTransition(task.status, "REJECTED");

  await db.task.update({
    where: { id: task.id },
    data: {
      status: "REJECTED",
      reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  await syncGuardianNudgesAfterTaskChange(family.id, {
    taskId: task.id,
    resolveTypes: ["SUBMITTED_FOR_REVIEW"],
  });

  revalidateTaskPaths(task.cubId);
  revalidatePath(`/dashboard/tasks/review/${task.id}`);
  return { success: "Task rejected." };
}

export async function sendBackTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const taskId = formData.get("taskId")?.toString();
  if (!taskId) {
    return { error: "Invalid task." };
  }

  const reviewNote = formData.get("reviewNote")?.toString().trim();
  if (!reviewNote) {
    return { error: "Add a note when sending a task back." };
  }

  const task = await getFamilyTask(taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "SUBMITTED") {
    return { error: "Only submitted tasks can be sent back." };
  }

  assertTransition(task.status, "SENT_BACK");

  await db.task.update({
    where: { id: task.id },
    data: {
      status: "SENT_BACK",
      reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  await syncGuardianNudgesAfterTaskChange(family.id, {
    taskId: task.id,
    resolveTypes: ["SUBMITTED_FOR_REVIEW"],
  });

  revalidateTaskPaths(task.cubId);
  revalidatePath(`/dashboard/tasks/review/${task.id}`);
  return { success: "Task sent back for revision." };
}

export async function deleteAvailableTaskAction(
  taskId: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const task = await getFamilyTask(taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (task.status !== "AVAILABLE") {
    return { error: "Only available pool tasks can be deleted." };
  }

  await db.task.delete({ where: { id: task.id } });

  revalidateTaskPaths();
  return { success: "Task removed from the board." };
}

export async function updateTaskAction(
  taskId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const task = await getFamilyTask(taskId, family.id);
  if (!task) {
    return { error: "Task not found." };
  }

  if (!isTaskEditable(task.status)) {
    return {
      error:
        "This task can no longer be edited. Sent-back tasks can be edited until resubmitted.",
    };
  }

  const parsed = availableTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    subcategory: formData.get("subcategory") || undefined,
    growthCategory: formData.get("growthCategory") || undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
    dueDate: formData.get("dueDate")?.toString(),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const validationError = validateTaskDefinition(parsed.data);
  if (validationError) {
    return { error: validationError };
  }

  const dueFields = getDueFieldsFromFormData(formData);
  const rewardParsed = taskRewardFieldsSchema.safeParse({
    focusMinutesEarned: formData.get("focusMinutesEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
  });

  if (!rewardParsed.success) {
    return {
      error: rewardParsed.error.issues[0]?.message ?? "Invalid reward amounts",
    };
  }

  await db.task.update({
    where: { id: task.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      subcategory:
        parsed.data.category === "FOCUS_BLOCK"
          ? null
          : parsed.data.subcategory ?? null,
      growthCategory:
        parsed.data.category === "FOCUS_BLOCK" ? task.growthCategory : null,
      proofType: parsed.data.proofType,
      proofPrompt: parsed.data.proofPrompt || null,
      proofChecklistItems: parsed.data.proofChecklistItems ?? undefined,
      ...rewardParsed.data,
      ...(dueFields !== null
        ? { dueAt: dueFields.dueAt, dueAtHasTime: dueFields.dueAtHasTime }
        : {}),
    },
  });

  revalidateTaskPaths(task.cubId);
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath(`/dashboard/tasks/${taskId}/edit`);
  return { success: "Task updated." };
}

/** @deprecated Use updateTaskAction */
export const updateAvailableTaskAction = updateTaskAction;
