import { describe, expect, it } from "vitest";
import { baselineMonthlyCost, optimizedMonthlyCost } from "./cost";

const base = {
  requestsPerDay: 10000,
  daysPerMonth: 22,
  staticInputTokens: 20000,
  dynamicInputTokens: 500,
  outputTokens: 300,
  inputRatePerMtok: 3,
  outputRatePerMtok: 15,
  successRate: 0.95,
  cacheEnabled: false,
  cacheHitRate: 0,
  cacheWriteRatePerMtok: 3.75,
  cacheReadRatePerMtok: 0.3,
  batchEnabled: false,
  batchDiscountFactor: 0.5,
};

describe("cost calculator", () => {
  it("computes baseline without error", () => {
    const b = baselineMonthlyCost(base);
    expect(b).toBeGreaterThan(0);
  });

  it("handles zero success rate", () => {
    const r = optimizedMonthlyCost({ ...base, successRate: 0 });
    expect(r.valid).toBe(true);
    expect(r.costPerSuccessfulTask).toBe(0);
  });

  it("does not double-count static tokens when caching on", () => {
    const r = optimizedMonthlyCost({
      ...base,
      cacheEnabled: true,
      cacheHitRate: 0.8,
    });
    expect(r.valid).toBe(true);
    const sum =
      r.tokenCategories.uncachedInput +
      r.tokenCategories.cacheWriteInput +
      r.tokenCategories.cacheReadInput;
    expect(sum).toBeLessThanOrEqual(base.staticInputTokens + base.dynamicInputTokens + 1);
  });
});
