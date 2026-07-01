"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionSuccessDialogProps = {
  message: string | null | undefined;
  title?: string;
  onDismiss?: () => void;
};

export function ActionSuccessDialog({
  message,
  title = "Success",
  onDismiss,
}: ActionSuccessDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  const open = Boolean(message && message !== dismissedMessage);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDismissedMessage(message ?? null);
        onDismiss?.();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, message, onDismiss]);

  if (!open || !message) {
    return null;
  }

  function dismiss() {
    setDismissedMessage(message ?? null);
    onDismiss?.();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className={cn(
          "relative w-full max-w-md rounded-2xl border-2 border-cub-green/40",
          "bg-cub-ebony px-6 py-6 shadow-2xl shadow-black/50",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cub-green-bright/50 bg-cub-green-muted/80 text-2xl"
            aria-hidden
          >
            ✓
          </div>
          <h2
            id={titleId}
            className="mt-4 text-xl font-bold text-cub-off-white"
          >
            {title}
          </h2>
          <p id={messageId} className="mt-2 text-sm leading-relaxed text-cub-muted">
            {message}
          </p>
          <Button
            type="button"
            variant="constructive"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={dismiss}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
