"use client";

import type { TaskRecurrence } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import {
  RECURRENCE_DAY_OPTIONS,
  type TaskRecurrenceConfig,
} from "@/lib/task-recurrence-config";
import { TASK_RECURRENCE_OPTIONS } from "@/lib/task-recurrence";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TaskRecurrenceFieldProps = {
  initialValue?: TaskRecurrence;
  initialConfig?: TaskRecurrenceConfig | null;
};

export function TaskRecurrenceField({
  initialValue = "NONE",
  initialConfig = null,
}: TaskRecurrenceFieldProps) {
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(initialValue);
  const [dayOfWeek, setDayOfWeek] = useState(
    initialConfig?.dayOfWeek ?? new Date().getDay(),
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    initialConfig?.dayOfMonth ?? new Date().getDate(),
  );
  const [time, setTime] = useState(initialConfig?.time ?? "");

  return (
    <div className="space-y-3">
      <input type="hidden" name="recurrence" value={recurrence} />
      {recurrence === "WEEKLY" ? (
        <input type="hidden" name="recurrenceDayOfWeek" value={dayOfWeek} />
      ) : null}
      {recurrence === "MONTHLY" ? (
        <input type="hidden" name="recurrenceDayOfMonth" value={dayOfMonth} />
      ) : null}
      {recurrence !== "NONE" && time ? (
        <input type="hidden" name="recurrenceTime" value={time} />
      ) : null}

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Repeat
        </p>
        <RadioChoiceList
          name="recurrenceChoice"
          value={recurrence}
          onChange={setRecurrence}
          layout="compact"
          options={TASK_RECURRENCE_OPTIONS}
        />
      </div>

      {recurrence === "WEEKLY" ? (
        <div className="space-y-2">
          <Label>Repeat on</Label>
          <div className="flex flex-wrap gap-2">
            {RECURRENCE_DAY_OPTIONS.map((day) => {
              const selected = dayOfWeek === day.value;
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setDayOfWeek(day.value)}
                  className={cn(
                    "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-cub-gold bg-cub-gold-muted text-cub-gold-light"
                      : "border-cub-off-white/15 bg-cub-charcoal text-cub-muted hover:border-cub-off-white/25",
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {recurrence === "MONTHLY" ? (
        <div>
          <Label htmlFor="recurrence-day-of-month">Day of month</Label>
          <select
            id="recurrence-day-of-month"
            value={dayOfMonth}
            onChange={(event) => setDayOfMonth(Number(event.target.value))}
            className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
          >
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {recurrence !== "NONE" ? (
        <div>
          <Label htmlFor="recurrence-time">Repeat time</Label>
          <input
            id="recurrence-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Optional — sets when each repeat is due. Leave blank for end of day.
          </p>
        </div>
      ) : null}

      {recurrence !== "NONE" ? (
        <p className="text-xs text-zinc-500">
          When approved, the next occurrence is assigned automatically with the
          schedule you set here.
        </p>
      ) : null}
    </div>
  );
}
