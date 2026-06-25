export function parseIsUrgentFromFormData(formData: FormData): boolean {
  return formData.get("isUrgent") === "on";
}
