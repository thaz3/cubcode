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
      return "text-emerald-600";
    case "overdue":
      return "text-red-500";
    case "submitted":
      return "text-amber-600";
    case "in_progress":
      return "text-kid-purple";
    default:
      return "text-kid-ink-muted";
  }
}

function DenItemRow({ item }: { item: DenOverviewItem }) {
  const content = (
    <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-kid-purple/10 bg-white px-3 py-2.5 shadow-sm transition hover:border-kid-blue/30 hover:shadow-md">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <DenItemBadge
            kind={item.kind}
            calendarEventType={item.calendarEventType}
          />
          {item.cubName ? (
            <span className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
              {item.cubName}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "truncate text-sm font-bold",
            item.state === "done" ? "text-kid-ink-muted line-through" : "text-kid-ink",
          )}
        >
          {item.title}
          {item.state === "done" ? (
            <span className="ml-1.5 inline-block" aria-hidden>
              ⭐
            </span>
          ) : null}
        </p>
        {item.subtitle ? (
          <p className="truncate text-xs text-kid-ink-muted">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        {item.timeLabel ? (
          <p className="text-xs font-bold text-kid-blue">{item.timeLabel}</p>
        ) : null}
        <p className={cn("text-[10px] font-black uppercase tracking-wide", stateTone(item.state))}>
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
        eyebrow="🎮 Cub HQ"
        title="Mission Control"
        subtitle="Your week at a glance — tap a day to see what's coming up!"
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
                "rounded-2xl border-2 px-1 py-2 text-center transition sm:px-2 sm:py-3",
                selectedDay === day.dateKey
                  ? "border-kid-purple/50 bg-kid-lavender shadow-md shadow-kid-purple/15"
                  : "border-kid-purple/10 bg-white hover:border-kid-blue/35 hover:bg-kid-sky/50",
                day.isToday && selectedDay !== day.dateKey && "ring-2 ring-kid-aqua/50",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted sm:text-xs">
                {day.dayName}
              </p>
              <p className="text-lg font-black text-kid-ink sm:text-xl">
                {day.dayNum}
              </p>
              <p
                className={cn(
                  "text-[10px] font-bold",
                  day.itemCount > 0 ? "text-kid-purple" : "text-kid-ink-muted",
                )}
              >
                {day.itemCount}
              </p>
            </button>
          ))}
        </div>

        <CubKidPanel variant="violet" contentClassName="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-kid-purple">
            📅 {selectedDayLabel}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-sm font-medium text-kid-ink-muted">
              No items on this day — enjoy the free time!
            </p>
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
