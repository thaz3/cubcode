import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getWeekStart } from "@/lib/council-day";
import {
  filterTasksForWeek,
  getTaskWeekStart,
  taskBelongsToWeek,
} from "@/lib/task-schedule";
import type { TaskStatus } from "@/generated/prisma/client";

function task(
  overrides: Partial<{
    dueAt: Date | null;
    claimedAt: Date | null;
    createdAt: Date;
    status: TaskStatus;
  }> = {},
) {
  return {
    dueAt: null as Date | null,
    claimedAt: new Date("2025-06-25T12:00:00"),
    createdAt: new Date("2025-06-25T12:00:00"),
    status: "CLAIMED" as TaskStatus,
    dueAtHasTime: false,
    ...overrides,
  };
}

describe("task week bucketing", () => {
  const currentWeek = getWeekStart(new Date("2025-06-25T12:00:00"));

  it("uses due date week when dueAt is set", () => {
    const inWeek = task({ dueAt: new Date("2025-06-27T20:00:00") });
    const nextWeek = task({ dueAt: new Date("2025-06-30T23:59:59") });

    assert.equal(taskBelongsToWeek(inWeek, currentWeek), true);
    assert.equal(taskBelongsToWeek(nextWeek, currentWeek), false);
  });

  it("uses assignment week when there is no due date", () => {
    const assignedThisWeek = task({
      dueAt: null,
      claimedAt: new Date("2025-06-25T12:00:00"),
    });
    const assignedLastWeek = task({
      dueAt: null,
      claimedAt: new Date("2025-06-18T12:00:00"),
    });

    assert.equal(taskBelongsToWeek(assignedThisWeek, currentWeek), true);
    assert.equal(taskBelongsToWeek(assignedLastWeek, currentWeek), false);
  });

  it("filters a mixed task list to the current week", () => {
    const inWeek = task({ dueAt: new Date("2025-06-27T20:00:00") });
    const nextWeek = task({ dueAt: new Date("2025-06-30T23:59:59") });

    const filtered = filterTasksForWeek([inWeek, nextWeek], currentWeek);
    assert.equal(filtered.length, 1);
    assert.deepEqual(filtered[0], inWeek);
  });
});
