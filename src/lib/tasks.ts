import type { Task, TaskProofType } from "@/generated/prisma/client";

type SubmitInput = {
  reflection?: string;
  proofLink?: string;
  timeLoggedMinutes?: number;
  checklistData?: Record<string, boolean>;
};

export function getTaskChecklistItems(task: {
  proofChecklistItems: unknown;
}): string[] {
  if (!Array.isArray(task.proofChecklistItems)) {
    return [];
  }
  return task.proofChecklistItems
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export function validateSubmissionProof(
  proofType: TaskProofType,
  input: SubmitInput,
  checklistItems: string[],
  options?: { category?: Task["category"] },
): string | null {
  if (options?.category === "FOCUS_BLOCK") {
    if (!input.reflection || input.reflection.trim().length < 10) {
      return "Write a short reflection about what you focused on (at least 10 characters).";
    }
    if (!input.proofLink || input.proofLink.trim().length < 5) {
      return "Paste a share link to your photo, document, or video proof.";
    }
    return null;
  }

  switch (proofType) {
    case "PARENT_APPROVAL":
      return null;
    case "SHORT_REFLECTION":
      if (!input.reflection || input.reflection.trim().length < 10) {
        return "Write a short reflection (at least 10 characters).";
      }
      return null;
    case "TIME_LOG":
      if (input.timeLoggedMinutes == null || input.timeLoggedMinutes < 1) {
        return "Log at least 1 minute of effort.";
      }
      return null;
    case "CHECKLIST": {
      if (checklistItems.length === 0) {
        return "This task has no checklist items configured.";
      }
      const items = input.checklistData ?? {};
      const allChecked = checklistItems.every((item) => items[item] === true);
      if (!allChecked) {
        return "Complete every checklist item before submitting.";
      }
      return null;
    }
    case "PERFORMANCE_VIDEO":
    case "SLIDESHOW":
      if (!input.proofLink || input.proofLink.trim().length < 5) {
        return "Paste a share link (or upload location) for the proof.";
      }
      return null;
    default:
      return "Unsupported proof type.";
  }
}

export function parseChecklistFromForm(
  formData: FormData,
  checklistItems: string[],
): Record<string, boolean> {
  const data: Record<string, boolean> = {};
  checklistItems.forEach((item, index) => {
    data[item] = formData.get(`checklistItem${index}`) === "on";
  });
  return data;
}

export function taskBelongsToFamily(task: Task, familyId: string): boolean {
  return task.familyId === familyId;
}
