import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatChallengeInterval,
  getCurrentInterval,
  isIntervalActiveOnDate,
  parseIntervalConfig,
} from "@/lib/challenge-intervals";

describe("challenge-intervals", () => {
  it("formats daily interval", () => {
    assert.equal(formatChallengeInterval("DAILY", null), "Every day");
  });

  it("formats custom days", () => {
    assert.equal(
      formatChallengeInterval("CUSTOM", { daysOfWeek: [2, 4] }),
      "Tue, Thu",
    );
  });

  it("weekdays inactive on Saturday", () => {
    const saturday = new Date(2026, 5, 27);
    assert.equal(isIntervalActiveOnDate("WEEKDAYS", null, saturday), false);
    assert.equal(
      getCurrentInterval({ intervalType: "WEEKDAYS", intervalConfig: null }, saturday),
      null,
    );
  });

  it("weekdays active on Wednesday", () => {
    const wednesday = new Date(2026, 5, 25);
    assert.equal(isIntervalActiveOnDate("WEEKDAYS", null, wednesday), true);
    const interval = getCurrentInterval(
      { intervalType: "WEEKDAYS", intervalConfig: null },
      wednesday,
    );
    assert.ok(interval);
    assert.equal(interval!.isActiveToday, true);
  });

  it("parses custom day config", () => {
    assert.deepEqual(parseIntervalConfig({ daysOfWeek: [0, 1, 7, -1] }), {
      daysOfWeek: [0, 1],
    });
  });

  it("weekly interval spans Monday start", () => {
    const wednesday = new Date(2026, 5, 25);
    const interval = getCurrentInterval(
      { intervalType: "WEEKLY", intervalConfig: null },
      wednesday,
    );
    assert.ok(interval);
    assert.equal(interval!.start.getDay(), 1);
  });
});
