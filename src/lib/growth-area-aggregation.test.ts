import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GrowthCategory } from "@/generated/prisma/client";
import {
  addGrowthAreaPoints,
  computeCoverage,
  computeMaxPoints,
  createEmptyByArea,
  finalizeGrowthAreaSummary,
  mergeGrowthAreaItem,
} from "@/lib/growth-area-aggregation";
import {
  GROWTH_RING_FULL_COMPLETIONS,
  growthRingSweepPercent,
} from "@/lib/unified-growth-areas";

describe("growth ring progress", () => {
  it("fills completely after seven completions", () => {
    assert.equal(GROWTH_RING_FULL_COMPLETIONS, 7);
    assert.ok(Math.abs(growthRingSweepPercent(1) - 100 / 7) < 0.001);
    assert.equal(growthRingSweepPercent(7), 100);
    assert.equal(growthRingSweepPercent(10), 100);
    assert.equal(growthRingSweepPercent(0), 0);
  });
});

describe("growth-area-summary", () => {
  it("counts coverage when required areas have points", () => {
    const byArea = createEmptyByArea();
    mergeGrowthAreaItem(byArea, "RESPONSIBILITY", {
      type: "task",
      id: "t1",
      title: "Focus session",
      completedAt: new Date(),
    });
    mergeGrowthAreaItem(byArea, "BODY", {
      type: "routine",
      id: "r1",
      title: "Brush teeth",
      completedAt: new Date(),
    });

    const required: GrowthCategory[] = [
      "MIND",
      "BODY",
      "RESPONSIBILITY",
      "CREATIVITY",
      "CHARACTER",
      "FAMILY",
      "COMMUNITY",
    ];
    const coverage = computeCoverage(required, byArea);
    assert.equal(coverage.met, 2);
    assert.equal(coverage.total, 7);
  });

  it("normalizes radar scale with at least 1", () => {
    const byArea = createEmptyByArea();
    assert.equal(computeMaxPoints(byArea), 1);
    mergeGrowthAreaItem(byArea, "CREATIVITY", {
      type: "task",
      id: "t2",
      title: "Homework",
      completedAt: new Date(),
    });
    addGrowthAreaPoints(
      byArea,
      "CREATIVITY",
      {
        type: "growth_pick",
        id: "p1",
        title: "Walk + Witness",
        completedAt: new Date(),
        points: 2,
      },
      2,
    );
    assert.equal(computeMaxPoints(byArea), 3);
  });

  it("finalizes sorted drill-down items", () => {
    const byArea = createEmptyByArea();
    const older = new Date("2026-06-20T10:00:00Z");
    const newer = new Date("2026-06-22T10:00:00Z");
    mergeGrowthAreaItem(byArea, "CREATIVITY", {
      type: "task",
      id: "old",
      title: "Older",
      completedAt: older,
    });
    mergeGrowthAreaItem(byArea, "CREATIVITY", {
      type: "task",
      id: "new",
      title: "Newer",
      completedAt: newer,
    });

    const summary = finalizeGrowthAreaSummary(
      ["CREATIVITY"],
      byArea,
      "Week of Jun 16",
    );
    assert.equal(summary.byArea.CREATIVITY.items[0]?.title, "Newer");
    assert.equal(summary.coverage.met, 1);
    assert.equal(summary.totalPoints, 2);
  });
});
