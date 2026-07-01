"use client";

import { useEffect, useRef } from "react";
import { ActionSuccessDialog } from "@/components/ui/action-success-dialog";
import { cn } from "@/lib/utils";

type FormSubmitFooterProps = {
  children: React.ReactNode;
  error?: string | null;
  success?: string | null;
  className?: string;
  /** Show success in a centered dialog instead of inline text. */
  successAsDialog?: boolean;
  successDialogTitle?: string;
};

/**
 * Submit area fixed above the mobile bottom nav (z-55) so taps are not stolen
 * by the nav bar (z-50). Includes a spacer so fields are not covered.
 */
export function FormSubmitFooter({
  children,
  error,
  success,
  className,
  successAsDialog = false,
  successDialogTitle,
}: FormSubmitFooterProps) {
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (success || error) {
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [success, error]);

  return (
    <>
      {successAsDialog ? (
        <ActionSuccessDialog
          message={success}
          title={successDialogTitle ?? "Success"}
        />
      ) : null}
      <div className="form-submit-footer-spacer" aria-hidden />
      <div className={cn("form-submit-footer", className)}>
        <div ref={statusRef} className="mx-auto w-full max-w-4xl px-4">
          {error ? (
            <p className="mb-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {success && !successAsDialog ? (
            <p className="mb-3 text-sm text-emerald-400" role="status">
              {success}
            </p>
          ) : null}
          <div className="relative z-[1]">{children}</div>
        </div>
      </div>
    </>
  );
}
