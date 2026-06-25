import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GrowthCategory } from "@/generated/prisma/client";
import {
  computeCoverage,
  computeMaxCompletions,
  createEmptyByArea,
  finalizeGrowthAreaSummary,
  mergeGrowthAreaItem,
} from "@/lib/growth-area-aggregation";

describe("growth-area-summary", () => {
  it("counts coverage when required areas have completions", () => {
    const byArea = createEmptyByArea();
    mergeGrowthAreaItem(byArea, "CONTROL", {
      type: "task",
      id: "t1",
      title: "Focus session",
      completedAt: new Date(),
    });
    mergeGrowthAreaItem(byArea, "WELLNESS", {
      type: "routine",
      id: "r1",
      title: "Brush teeth",
      completedAt: new Date(),
    });

    const required: GrowthCategory[] = [
      "CONTROL",
      "USE",
      "BUILD",
      "CHARACTER",
      "WELLNESS",
    ];
    const coverage = computeCoverage(required, byArea);
    assert.equal(coverage.met, 2);
    assert.equal(coverage.total, 5);
  });

  it("normalizes radar scale with at least 1", () => {
    const byArea = createEmptyByArea();
    assert.equal(computeMaxCompletions(byArea), 1);
    mergeGrowthAreaItem(byArea, "USE", {
      type: "task",
      id: "t2",
      title: "Homework",
      completedAt: new Date(),
    });
    mergeGrowthAreaItem(byArea, "USE", {
      type: "task",
      id: "t3",
      title: "Reading",
      completedAt: new Date(),
    });
    assert.equal(computeMaxCompletions(byArea), 2);
  });

  it("finalizes sorted drill-down items", () => {
    const byArea = createEmptyByArea();
    const older = new Date("2026-06-20T10:00:00Z");
    const newer = new Date("2026-06-22T10:00:00Z");
    mergeGrowthAreaItem(byArea, "BUILD", {
      type: "task",
      id: "old",
      title: "Older",
      completedAt: older,
    });
    mergeGrowthAreaItem(byArea, "BUILD", {
      type: "task",
      id: "new",
      title: "Newer",
      completedAt: newer,
    });

    const summary = finalizeGrowthAreaSummary(
      ["BUILD"],
      byArea,
      "Week of Jun 16",
    );
    assert.equal(summary.byArea.BUILD.items[0]?.title, "Newer");
    assert.equal(summary.coverage.met, 1);
  });
});
