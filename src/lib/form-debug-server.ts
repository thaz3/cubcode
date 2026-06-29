/** Server-side diagnostics for task/routine create actions. */

export function debugServerAction(
  action: string,
  phase: "start" | "success" | "error",
  detail?: Record<string, unknown>,
): void {
  const enabled =
    process.env.NODE_ENV === "development" || process.env.FORM_DEBUG === "1";

  if (!enabled) return;

  console.log(`[cub-server] ${action} ${phase}`, detail ?? "");
}
