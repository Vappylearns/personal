import { describe, expect, it } from "vitest";
import { evalCases } from "../content/evalCases";
import { metricsFor, releaseGate } from "../lib/evals";

describe("evaluation metrics", () => {
  it("counts accuracy and fails a high-risk miss even when the average rises", () => {
    expect(evalCases.length).toBeGreaterThanOrEqual(12);
    const baseline = metricsFor(evalCases, "baseline", "A");
    const candidate = metricsFor(evalCases, "candidate", "B");
    expect(baseline.exactMatches).toBe(9);
    expect(candidate.exactMatches).toBe(11);
    expect(candidate.accuracy).toBeGreaterThan(baseline.accuracy);
    expect(candidate.highRiskMisses).toEqual(["C06"]);
    expect(candidate.precision).toBeCloseTo(1, 6);
    expect(candidate.recall).toBeCloseTo(0.75, 6);
    const gate = releaseGate(baseline, candidate);
    expect(gate.pass).toBe(false);
    expect(gate.reasons.join(" ")).toMatch(/C06/);
  });
});
