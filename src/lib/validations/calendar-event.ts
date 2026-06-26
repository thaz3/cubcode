import { z } from "zod";
import { CALENDAR_EVENT_TYPES } from "@/lib/calendar-events";

export const calendarEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  cubId: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  eventType: z.enum(CALENDAR_EVENT_TYPES),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
  startTime: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  endTime: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  description: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export type CalendarEventFormInput = z.infer<typeof calendarEventSchema>;
