"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddCalendarEventForm } from "@/components/den-overview/add-calendar-event-form";
import { DenItemBadge } from "@/components/den-overview/den-item-badge";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import {
  denItemStateLabel,
  type DenOverviewData,
  type DenOverviewItem,
} from "@/lib/den-overview-types";
import { cn } from "@/lib/utils";

type DenOverviewDashboardProps = {
  cubId: string;
  isParent: boolean;
  cubs: { id: string; displayName: string }[];
  data: DenOverviewData;
  initialSelectedDay: string;
};

function stateTone(state: DenOverviewItem["state"]) {
  switch (state) {
    case "done":
      return "text-cub-green-light";
    case "overdue":
      return "text-red-300";
    case "submitted":
      return "text-cub-gold-light";
    case "in_progress":
      return "text-violet-200";
    default:
      return "text-cub-muted";
  }
}

function DenItemRow({ item }: { item: DenOverviewItem }) {
  const content = (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-cub-charcoal/80 bg-cub-ebony/50 px-3 py-2.5 transition hover:border-cub-gold/25 hover:bg-cub-charcoal/50">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <DenItemBadge
            kind={item.kind}
            calendarEventType={item.calendarEventType}
          />
          {item.cubName ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-cub-muted">
              {item.cubName}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "truncate text-sm font-semibold",
            item.state === "done" ? "text-cub-muted line-through" : "text-cub-off-white",
          )}
        >
          {item.title}
        </p>
        {item.subtitle ? (
          <p className="truncate text-xs text-cub-muted">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        {item.timeLabel ? (
          <p className="text-xs font-bold text-teal-200/90">{item.timeLabel}</p>
        ) : null}
        <p className={cn("text-[10px] font-semibold uppercase tracking-wide", stateTone(item.state))}>
          {denItemStateLabel(item.state)}
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function DenOverviewDashboard({
  cubId,
  isParent,
  cubs,
  data,
  initialSelectedDay,
}: DenOverviewDashboardProps) {
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const selectedItems = useMemo(
    () => data.itemsByDay[selectedDay] ?? [],
    [data.itemsByDay, selectedDay],
  );

  const selectedDayLabel = useMemo(() => {
    const day = data.weekDays.find((d) => d.dateKey === selectedDay);
    if (!day) return "Selected day";
    const date = new Date(`${selectedDay}T00:00:00.000Z`);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }, [data.weekDays, selectedDay]);

  return (
    <div className="space-y-3">
      <CubKidSectionHeader
        eyebrow="🗓️ Den Dashboard"
        title="Family calendar"
        subtitle="Tap a day to see assignments and family events."
        trailing={
          isParent ? (
            <AddCalendarEventForm cubs={cubs} defaultCubId={cubId} />
          ) : null
        }
      />

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {data.weekDays.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => setSelectedDay(day.dateKey)}
              className={cn(
                "rounded-xl border px-1 py-2 text-center transition sm:px-2 sm:py-3",
                selectedDay === day.dateKey
                  ? "border-cub-gold/50 bg-cub-gold-muted/30 shadow-md"
                  : "border-cub-charcoal/80 bg-cub-ebony/60 hover:border-teal-400/30",
                day.isToday && selectedDay !== day.dateKey && "ring-1 ring-teal-400/25",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-cub-muted sm:text-xs">
                {day.dayName}
              </p>
              <p className="text-lg font-black text-cub-off-white sm:text-xl">
                {day.dayNum}
              </p>
              <p
                className={cn(
                  "text-[10px] font-semibold",
                  day.itemCount > 0 ? "text-teal-200" : "text-cub-muted",
                )}
              >
                {day.itemCount}
              </p>
            </button>
          ))}
        </div>

        <CubKidPanel contentClassName="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-200/80">
            {selectedDayLabel}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-cub-muted">No items on this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((item) => (
                <li key={item.id}>
                  <DenItemRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </CubKidPanel>
    </div>
  );
}
