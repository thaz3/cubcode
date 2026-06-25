import type { TaskRecurrence } from "@/generated/prisma/client";

export const TASK_RECURRENCE_OPTIONS: Array<{
  value: TaskRecurrence;
  label: string;
}> = [
  { value: "NONE", label: "One time" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export function parseRecurrenceFromFormData(formData: FormData): TaskRecurrence {
  const value = formData.get("recurrence")?.toString();
  if (value === "DAILY" || value === "WEEKLY" || value === "MONTHLY") {
    return value;
  }
  return "NONE";
}

export function formatTaskRecurrence(recurrence: TaskRecurrence): string | null {
  switch (recurrence) {
    case "DAILY":
      return "Repeats daily";
    case "WEEKLY":
      return "Repeats weekly";
    case "MONTHLY":
      return "Repeats monthly";
    default:
      return null;
  }
}

export function advanceDueDate(
  from: Date,
  recurrence: Exclude<TaskRecurrence, "NONE">,
): Date {
  const next = new Date(from);
  switch (recurrence) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}
