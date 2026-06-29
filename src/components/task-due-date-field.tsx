"use client";

import type { ActionState } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { NATIVE_TIME_INPUT_CLASS, NATIVE_DATE_INPUT_CLASS } from "@/lib/mobile-form-styles";
import { debugServerAction } from "@/lib/form-debug-server";
import { dueInHoursFromNow, parseDueDateFormValue } from "@/lib/task-schedule";
import { cn } from "@/lib/utils";
import { useTouchNativeControls } from "@/components/use-prefers-hover";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

type TaskDueDateFieldProps = {
  id: string;
  defaultValue?: string;
  required?: boolean;
  showQuickDue?: boolean;
  /** YYYY-MM-DD, YYYY-MM-DDTHH:mm, or empty */
  onDueDateChange?: (value: string) => void;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseInitialDue(defaultValue: string) {
  const parsed = parseDueDateFormValue(defaultValue);
  if (!parsed.dueAt) {
    return { date: null as Date | null, time: "" };
  }

  if (parsed.dueAtHasTime) {
    const hours = String(parsed.dueAt.getHours()).padStart(2, "0");
    const minutes = String(parsed.dueAt.getMinutes()).padStart(2, "0");
    return {
      date: new Date(
        parsed.dueAt.getFullYear(),
        parsed.dueAt.getMonth(),
        parsed.dueAt.getDate(),
      ),
      time: `${hours}:${minutes}`,
    };
  }

  return {
    date: new Date(
      parsed.dueAt.getUTCFullYear(),
      parsed.dueAt.getUTCMonth(),
      parsed.dueAt.getUTCDate(),
    ),
    time: "",
  };
}

function toInputDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDueFormValue(date: Date | null, time: string): string {
  if (!date) {
    return "";
  }

  if (time) {
    return `${toInputDateValue(date)}T${time}`;
  }

  return toInputDateValue(date);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(viewMonth: Date): Date[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function TaskDueDateField({
  id,
  defaultValue = "",
  required = false,
  showQuickDue = false,
  onDueDateChange,
}: TaskDueDateFieldProps) {
  const initial = parseInitialDue(defaultValue);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initial.date);
  const [dueTime, setDueTime] = useState(initial.time);
  const [viewMonth, setViewMonth] = useState(
    () => initial.date ?? new Date(),
  );
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const useNativeControls = useTouchNativeControls();

  const selectedValue = buildDueFormValue(selectedDate, dueTime);

  useEffect(() => {
    onDueDateChange?.(selectedValue);
  }, [onDueDateChange, selectedValue]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = selectedValue;
    }
  }, [selectedValue]);

  function applyDueValue(value: string) {
    const parsed = parseInitialDue(value);
    setSelectedDate(parsed.date);
    setDueTime(parsed.time);
    if (parsed.date) {
      setViewMonth(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
    }
  }

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthDays = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(offset: number) {
    setViewMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectDate(date: Date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(normalized);
    setViewMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
  }

  return (
    <div>
      <Label htmlFor={id}>Due date{required ? "" : " (optional)"}</Label>
      <p className="mt-1 text-sm text-zinc-500">
        Pick a day and optional time. Use quick due for tasks needed in the next
        few hours — they rise to the top of the Cub&apos;s list.
      </p>

      {showQuickDue ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyDueValue(dueInHoursFromNow(2))}
            className="min-h-11 touch-manipulation rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 active:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          >
            Due in 2 hours
          </button>
          <button
            type="button"
            onClick={() => applyDueValue(dueInHoursFromNow(4))}
            className="min-h-11 touch-manipulation rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 active:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          >
            Due in 4 hours
          </button>
          <button
            type="button"
            onClick={() => {
              const tonight = new Date();
              tonight.setHours(20, 0, 0, 0);
              if (tonight.getTime() <= Date.now()) {
                tonight.setDate(tonight.getDate() + 1);
              }
              applyDueValue(buildDueFormValue(tonight, "20:00"));
            }}
            className="min-h-11 touch-manipulation rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 active:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-900"
          >
            Due tonight 8 PM
          </button>
        </div>
      ) : null}

      {useNativeControls ? (
        <div className="mt-3">
          <input
            type="date"
            value={selectedDate ? toInputDateValue(selectedDate) : ""}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) {
                setSelectedDate(null);
                return;
              }
              const [year, month, day] = value.split("-").map(Number);
              selectDate(new Date(year, month - 1, day));
            }}
            className={NATIVE_DATE_INPUT_CLASS}
          />
        </div>
      ) : (
      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-cub-off-white/10 dark:bg-cub-ebony">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-cub-off-white/10">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="touch-target flex items-center justify-center rounded-md text-sm text-zinc-600 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-900"
            aria-label="Previous month"
          >
            ←
          </button>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="touch-target flex items-center justify-center rounded-md text-sm text-zinc-600 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-900"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-zinc-200 p-px dark:bg-zinc-800">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="bg-zinc-50 px-1 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {label}
            </div>
          ))}

          {monthDays.map((day) => {
            const inCurrentMonth = day.getMonth() === viewMonth.getMonth();
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => selectDate(day)}
                className={cn(
                  "min-h-11 touch-manipulation bg-white px-1 py-2 text-sm transition dark:bg-cub-ebony",
                  inCurrentMonth
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 dark:text-zinc-600",
                  isSelected
                    ? "bg-amber-600 font-semibold text-white hover:bg-amber-700 dark:bg-amber-600"
                    : "hover:bg-amber-50 dark:hover:bg-amber-950/40",
                  isToday && !isSelected
                    ? "ring-1 ring-inset ring-amber-400 dark:ring-cub-gold"
                    : null,
                )}
                aria-label={day.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                aria-pressed={isSelected}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      )}

      <input
        ref={hiddenInputRef}
        id={id}
        name="dueDate"
        type="hidden"
        defaultValue={defaultValue}
        required={required}
      />

      <div className="mt-3">
        <Label htmlFor={`${id}-time`}>Due time (optional)</Label>
        <input
          id={`${id}-time`}
          type="time"
          value={dueTime}
          onChange={(event) => setDueTime(event.target.value)}
          className={NATIVE_TIME_INPUT_CLASS}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Add a time for &quot;due in a few hours&quot; urgency. Leave blank for end of day.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <p className="text-zinc-600 dark:text-zinc-400">
          {selectedDate
            ? dueTime
              ? `Selected: ${selectedDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })} at ${dueTime}`
              : `Selected: ${selectedDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} (end of day)`
            : "No due date selected"}
        </p>
        {!required && selectedDate ? (
          <button
            type="button"
            onClick={() => {
              setSelectedDate(null);
              setDueTime("");
            }}
            className="min-h-11 touch-manipulation px-2 text-amber-700 active:underline dark:text-cub-gold-light"
          >
            Clear
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
          }}
          className="min-h-11 touch-manipulation px-2 text-zinc-500 active:text-zinc-700 dark:active:text-zinc-300"
        >
          Today
        </button>
      </div>
    </div>
  );
}

/** Inject calendar due date into FormData before a server action runs. */
export function applyDueDateToFormData(
  formData: FormData,
  dueDate: string,
): void {
  formData.set("dueDate", dueDate);
}

/** Wrap a server action so calendar due dates are included on submit. */
export function useDueDateFormAction(
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>,
  initialState: ActionState = {},
  options?: { enabled?: boolean; initialDueDate?: string },
) {
  const enabled = options?.enabled ?? true;
  const dueDateRef = useRef(options?.initialDueDate ?? "");

  useEffect(() => {
    dueDateRef.current = options?.initialDueDate ?? "";
  }, [options?.initialDueDate]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      if (enabled) {
        const fromForm = formData.get("dueDate")?.toString() ?? "";
        const dueDate = dueDateRef.current || fromForm;
        applyDueDateToFormData(formData, dueDate);
      }
      debugServerAction("taskFormAction", "start", {
        dueDate: formData.get("dueDate")?.toString(),
        title: formData.get("title")?.toString(),
      });
      const result = await action(prevState, formData);
      debugServerAction("taskFormAction", result.error ? "error" : "success", {
        error: result.error,
        success: result.success,
      });
      return result;
    },
    initialState,
  );

  function onDueDateChange(value: string) {
    dueDateRef.current = value;
  }

  return { state, formAction, isPending, onDueDateChange };
}
