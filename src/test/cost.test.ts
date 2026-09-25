import { describe, expect, it } from "vitest";
import { calculateCost, type CostInput } from "../lib/cost";

const base: CostInput = {
  requestsPerDay: 2,
  daysPerMonth: 1,
  staticInputTokens: 1000,
  dynamicInputTokens: 100,
  outputTokens: 50,
  inputUsdPerMillion: 2,
  outputUsdPerMillion: 10,
  cacheWriteMultiplier: 1.25,
  cacheReadMultiplier: 0.1,
  batchMultiplier: 0.5,
  minCacheTokens: 100,
  cacheEnabled: false,
  batchEnabled: false,
  cacheTtlMinutes: 5,
  operatingMinutesPerDay: 10,
  successRate: 1,
};

describe("calculateCost", () => {
  it("prices the uncached baseline from the published formula", () => {
    const result = calculateCost(base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expected = (2 * ((1100 * 2 + 50 * 10) / 1_000_000));
    expect(result.baselineUsd).toBeCloseTo(expected, 8);
    expect(result.savingsUsd).toBeCloseTo(0, 8);
  });

  it("does not bill static tokens twice when caching", () => {
    const result = calculateCost({
      ...base,
      cacheEnabled: true,
      operatingMinutesPerDay: 5,
      requestsPerDay: 2,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const bill = result.scenarios.find((item) => item.id === "cache")?.bill;
    expect(bill).toBeTruthy();
    if (!bill) return;
    expect(bill.uncachedTokensPerRequest + bill.cacheWriteTokensPerRequest + bill.cacheReadTokensPerRequest).toBeCloseTo(1100, 6);
    expect(bill.cacheWriteTokensPerRequest).toBeGreaterThan(0);
    expect(bill.cacheReadTokensPerRequest).toBeGreaterThan(0);
  });

  it("lets a cold cache cost more than the baseline", () => {
    const cached = calculateCost({
      ...base,
      cacheEnabled: true,
      requestsPerDay: 1,
      operatingMinutesPerDay: 600,
      cacheTtlMinutes: 5,
    });
    expect(cached.ok).toBe(true);
    if (!cached.ok) return;
    expect(cached.savingsUsd).toBeLessThan(0);
  });

  it("stacks batch onto cache only when configured", () => {
    const stacked = calculateCost({ ...base, cacheEnabled: true, batchEnabled: true, stackCacheAndBatch: true });
    const separate = calculateCost({ ...base, cacheEnabled: true, batchEnabled: true, stackCacheAndBatch: false });
    expect(stacked.ok && separate.ok).toBe(true);
    if (!stacked.ok || !separate.ok) return;
    expect(stacked.scenarios.find((item) => item.id === "combined")?.available).toBe(true);
    expect(separate.scenarios.find((item) => item.id === "combined")?.available).toBe(false);
  });

  it("refuses zero denominators and invalid numbers", () => {
    const zero = calculateCost({ ...base, successRate: 0 });
    expect(zero.ok).toBe(true);
    if (!zero.ok) return;
    expect(zero.costPerSuccessUsd).toBeNull();
    const bad = calculateCost({ ...base, requestsPerDay: Number.NaN, successRate: 2 });
    expect(bad.ok).toBe(false);
  });
});
