"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseEventDateInput } from "@/lib/calendar-events";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import type { ActionState } from "@/lib/actions/auth";
import { calendarEventSchema } from "@/lib/validations/calendar-event";

function revalidateDenOverviewPaths(cubIds: string[]) {
  revalidatePath("/dashboard");
  for (const cubId of cubIds) {
    revalidatePath(`/cub/${cubId}`);
    revalidatePath(`/cub/${cubId}/tasks`);
  }
}

export async function createCalendarEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const family = await requireFamilyForUser(userId);

    const parsed = calendarEventSchema.safeParse({
      title: formData.get("title"),
      cubId: formData.get("cubId"),
      eventType: formData.get("eventType"),
      eventDate: formData.get("eventDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid event details",
      };
    }

    const { cubId, eventDate, ...rest } = parsed.data;

    if (cubId) {
      const cub = family.cubs.find((item) => item.id === cubId);
      if (!cub) {
        return { error: "Cub not found in your family" };
      }
    }

    await db.calendarEvent.create({
      data: {
        familyId: family.id,
        cubId: cubId ?? null,
        eventDate: parseEventDateInput(eventDate),
        ...rest,
      },
    });

    revalidateDenOverviewPaths(family.cubs.map((cub) => cub.id));

    return { success: "Event added to the Den calendar" };
  } catch (error) {
    console.error("createCalendarEventAction", error);
    return { error: "Could not create calendar event" };
  }
}
