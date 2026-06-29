const TOUCH_DEBUG_ENABLED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_TOUCH_DEBUG === "1";

export type CreateFormKind = "task" | "routine";

/** Client request context — there is no separate API URL; forms use Next.js Server Actions. */
export function getFormRequestContext(): Record<string, string> {
  if (typeof window === "undefined") {
    return { transport: "next-server-action (server render)" };
  }

  return {
    origin: window.location.origin,
    pathname: window.location.pathname,
    href: window.location.href,
    transport:
      "next-server-action (same-origin POST to current page — no fetch/axios API)",
  };
}

/** Opt-in touch/form diagnostics — set NEXT_PUBLIC_TOUCH_DEBUG=1 on hosted builds. */
export function touchDebug(
  label: string,
  detail?: Record<string, unknown>,
): void {
  if (!TOUCH_DEBUG_ENABLED) return;
  console.log(`[cub-touch] ${label}`, detail ?? "");
}

export function logCreateButtonTap(
  form: CreateFormKind,
  detail?: Record<string, unknown>,
): void {
  touchDebug(`Create ${form} button tap`, {
    ...getFormRequestContext(),
    ...detail,
  });
}

export function logFormSubmit(
  form: CreateFormKind,
  detail?: Record<string, unknown>,
): void {
  touchDebug(`Form submit: ${form}`, {
    ...getFormRequestContext(),
    ...detail,
  });
}

export function logActionResult(
  form: CreateFormKind,
  state: { error?: string | null; success?: string | null },
): void {
  if (state.error) {
    touchDebug(`${form} action FAILED (server returned error)`, {
      ...getFormRequestContext(),
      error: state.error,
      diagnosis:
        "Category C or D — submit reached server but validation/DB failed, or UI may not refresh",
    });
    return;
  }

  if (state.success) {
    touchDebug(`${form} action SUCCESS (server returned success)`, {
      ...getFormRequestContext(),
      success: state.success,
      diagnosis:
        "Save succeeded — if list did not update, likely Category D (revalidation/UI)",
    });
  }
}
