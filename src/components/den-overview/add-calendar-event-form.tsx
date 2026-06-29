"use client";

import { useActionState, useState } from "react";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { createCalendarEventAction } from "@/lib/actions/calendar-events";
import { CALENDAR_EVENT_TYPE_META } from "@/lib/calendar-events";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type AddCalendarEventFormProps = {
  cubs: { id: string; displayName: string }[];
  defaultCubId?: string;
};

const initialState: ActionState = {};

export function AddCalendarEventForm({
  cubs,
  defaultCubId,
}: AddCalendarEventFormProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    createCalendarEventAction,
    initialState,
  );

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 touch-manipulation rounded-xl border border-teal-400/35 bg-teal-950/40 px-3 py-2 text-xs font-bold text-teal-100 transition active:border-teal-300/50 active:bg-teal-900/50"
      >
        Add Event
      </button>
    );
  }

  return (
    <CubKidPanel variant="violet" contentClassName="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/80">
            Family calendar
          </p>
          <h3 className="text-sm font-black text-cub-off-white">Add Event</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 touch-manipulation px-2 text-xs text-cub-muted active:text-cub-off-white"
        >
          Close
        </button>
      </div>

      <form action={action} className="space-y-3">
        <FormField id="event-title" label="Title">
          <Input
            id="event-title"
            name="title"
            required
            placeholder="Doctor appointment, practice, review day…"
            className="border-cub-charcoal bg-cub-ebony text-cub-off-white"
          />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="event-cub" label="Cub">
            <select
              id="event-cub"
              name="cubId"
              defaultValue={defaultCubId ?? ""}
              className={cn(
                "h-10 w-full rounded-md border border-cub-charcoal bg-cub-ebony px-3 text-sm text-cub-off-white",
              )}
            >
              <option value="">Whole family</option>
              {cubs.map((cub) => (
                <option key={cub.id} value={cub.id}>
                  {cub.displayName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="event-type" label="Event type">
            <select
              id="event-type"
              name="eventType"
              required
              defaultValue="APPOINTMENT"
              className="h-10 w-full rounded-md border border-cub-charcoal bg-cub-ebony px-3 text-sm text-cub-off-white"
            >
              {Object.entries(CALENDAR_EVENT_TYPE_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField id="event-date" label="Date">
            <Input
              id="event-date"
              name="eventDate"
              type="date"
              required
              defaultValue={defaultDate}
              className="border-cub-charcoal bg-cub-ebony text-cub-off-white"
            />
          </FormField>
          <FormField id="event-start" label="Start time">
            <Input
              id="event-start"
              name="startTime"
              type="time"
              className="border-cub-charcoal bg-cub-ebony text-cub-off-white"
            />
          </FormField>
          <FormField id="event-end" label="End time">
            <Input
              id="event-end"
              name="endTime"
              type="time"
              className="border-cub-charcoal bg-cub-ebony text-cub-off-white"
            />
          </FormField>
        </div>

        <FormField id="event-notes" label="Notes">
          <textarea
            id="event-notes"
            name="description"
            rows={2}
            placeholder="Location, what to bring, pickup details…"
            className="w-full rounded-md border border-cub-charcoal bg-cub-ebony px-3 py-2 text-sm text-cub-off-white"
          />
        </FormField>

        {state.error ? (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-cub-green-light" role="status">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-600 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save event"}
        </button>
      </form>
    </CubKidPanel>
  );
}
