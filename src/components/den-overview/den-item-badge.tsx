import type { EarnType } from "@/lib/earn-types";
import type { CalendarEventType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { getCalendarEventTypeMeta } from "@/lib/calendar-events";

export type DenItemKind =
  | EarnType
  | "calendar_event";

type DenItemBadgeProps = {
  kind: DenItemKind;
  calendarEventType?: CalendarEventType;
  size?: "sm" | "md";
  className?: string;
};

export function DenItemBadge({
  kind,
  calendarEventType,
  size = "sm",
  className,
}: DenItemBadgeProps) {
  if (kind !== "calendar_event") {
    return <EarnTypeBadge earnType={kind} size={size} className={className} />;
  }

  const meta = getCalendarEventTypeMeta(
    calendarEventType ?? "APPOINTMENT",
  );

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold uppercase tracking-wide",
        meta.badgeClass,
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {meta.shortLabel}
    </span>
  );
}
