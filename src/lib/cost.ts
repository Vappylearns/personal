export interface CostInputs {
  requestsPerDay: number;
  daysPerMonth: number;
  staticInputTokens: number;
  dynamicInputTokens: number;
  outputTokens: number;
  inputRatePerMtok: number;
  outputRatePerMtok: number;
  successRate: number; // 0-1
  cacheEnabled: boolean;
  cacheHitRate: number; // 0-1 share of static tokens served from cache read
  cacheWriteRatePerMtok: number;
  cacheReadRatePerMtok: number;
  batchEnabled: boolean;
  batchDiscountFactor: number;
}

export interface CostBreakdown {
  valid: boolean;
  error?: string;
  monthlyRequests: number;
  baselineMonthlyCost: number;
  optimizedMonthlyCost: number;
  savingsAbs: number;
  savingsPct: number;
  costPerSuccessfulTask: number;
  formulaNotes: string[];
  tokenCategories: {
    uncachedInput: number;
    cacheWriteInput: number;
    cacheReadInput: number;
    output: number;
  };
}

function safeNum(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

/** Baseline: no cache/batch — all input tokens billed at input rate. */
export function baselineMonthlyCost(i: CostInputs): number {
  const monthlyRequests = i.requestsPerDay * i.daysPerMonth;
  const inputTokens = i.staticInputTokens + i.dynamicInputTokens;
  const perRequest =
    (inputTokens * i.inputRatePerMtok + i.outputTokens * i.outputRatePerMtok) /
    1_000_000;
  return monthlyRequests * perRequest;
}

/**
 * Caching: static tokens split across uncached, cache write, cache read (mutually exclusive).
 * Dynamic tokens always uncached input. No double-billing of static tokens.
 */
export function optimizedMonthlyCost(i: CostInputs): CostBreakdown {
  const formulaNotes: string[] = [];
  if (
    !safeNum(i.requestsPerDay) ||
    !safeNum(i.daysPerMonth) ||
    !safeNum(i.successRate) ||
    i.successRate > 1
  ) {
    return {
      valid: false,
      error: "Invalid numeric inputs.",
      monthlyRequests: 0,
      baselineMonthlyCost: 0,
      optimizedMonthlyCost: 0,
      savingsAbs: 0,
      savingsPct: 0,
      costPerSuccessfulTask: 0,
      formulaNotes,
      tokenCategories: {
        uncachedInput: 0,
        cacheWriteInput: 0,
        cacheReadInput: 0,
        output: 0,
      },
    };
  }

  const monthlyRequests = i.requestsPerDay * i.daysPerMonth;
  const baseline = baselineMonthlyCost(i);

  let staticRead = 0;
  let staticWrite = 0;
  let staticUncached = i.staticInputTokens;

  if (i.cacheEnabled && i.staticInputTokens > 0) {
    staticRead = i.staticInputTokens * i.cacheHitRate;
    staticWrite = i.staticInputTokens * (1 - i.cacheHitRate) * 0.15; // illustrative: 15% cold writes per request
    staticUncached = Math.max(
      0,
      i.staticInputTokens - staticRead - staticWrite,
    );
    formulaNotes.push(
      "Static tokens split into uncached, cache write, and cache read buckets (no double count).",
    );
  }

  const dynamicUncached = i.dynamicInputTokens;
  const uncachedInputTokens = staticUncached + dynamicUncached;

  let inputCost =
    (uncachedInputTokens * i.inputRatePerMtok) / 1_000_000 +
    (staticWrite * i.cacheWriteRatePerMtok) / 1_000_000 +
    (staticRead * i.cacheReadRatePerMtok) / 1_000_000;

  let outputCost = (i.outputTokens * i.outputRatePerMtok) / 1_000_000;

  if (i.batchEnabled) {
    inputCost *= i.batchDiscountFactor;
    outputCost *= i.batchDiscountFactor;
    formulaNotes.push(
      "Batch discount applied to input/output — verify combination with caching in current Anthropic docs.",
    );
  }

  const perRequest = inputCost + outputCost;
  const optimized = monthlyRequests * perRequest;
  const savingsAbs = baseline - optimized;
  const savingsPct = baseline > 0 ? (savingsAbs / baseline) * 100 : 0;
  const successful = monthlyRequests * i.successRate;
  const costPerSuccessfulTask =
    successful > 0 ? optimized / successful : 0;

  if (successful === 0) {
    formulaNotes.push("Success rate is zero — cost per successful task undefined; showing 0.");
  }

  return {
    valid: true,
    monthlyRequests,
    baselineMonthlyCost: baseline,
    optimizedMonthlyCost: optimized,
    savingsAbs,
    savingsPct,
    costPerSuccessfulTask,
    formulaNotes,
    tokenCategories: {
      uncachedInput: uncachedInputTokens,
      cacheWriteInput: staticWrite,
      cacheReadInput: staticRead,
      output: i.outputTokens,
    },
  };
}
