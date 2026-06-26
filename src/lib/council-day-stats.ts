import { getWeekEnd, type CubWeekStats } from "@/lib/council-day";
import { db } from "@/lib/db";

export async function getCubWeekStats(
  cubId: string,
  weekStart: Date,
): Promise<CubWeekStats> {
  const weekEnd = getWeekEnd(weekStart);

  const [completedTasks, completedFocusTasks, focusAgg, submittedAwaitingReview] =
    await Promise.all([
    db.task.count({
      where: {
        cubId,
        status: "COMPLETED",
        reviewedAt: { gte: weekStart, lt: weekEnd },
      },
    }),
    db.task.count({
      where: {
        cubId,
        category: "FOCUS_BLOCK",
        status: "COMPLETED",
        reviewedAt: { gte: weekStart, lt: weekEnd },
      },
    }),
    db.focusBlockLog.aggregate({
      where: {
        cubId,
        startedAt: { gte: weekStart, lt: weekEnd },
      },
      _sum: { durationMinutes: true },
    }),
    db.task.count({
      where: { cubId, status: "SUBMITTED" },
    }),
  ]);

  return {
    completedTasks,
    completedFocusTasks,
    focusMinutes: focusAgg._sum.durationMinutes ?? 0,
    submittedAwaitingReview,
  };
}
