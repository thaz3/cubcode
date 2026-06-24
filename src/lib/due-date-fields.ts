import { parseDueDateFormValue } from "@/lib/task-schedule";

export function getDueFieldsFromFormData(formData: FormData): {
  dueAt: Date | null;
  dueAtHasTime: boolean;
} | null {
  if (!formData.has("dueDate")) {
    return null;
  }

  return parseDueDateFormValue(formData.get("dueDate")?.toString());
}
