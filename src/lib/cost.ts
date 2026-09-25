import { CACHE_AND_BATCH_STACK } from "../config/pricing";

export type CostInput = {
  requestsPerDay: number;
  daysPerMonth: number;
  staticInputTokens: number;
  dynamicInputTokens: number;
  outputTokens: number;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  cacheWriteMultiplier: number;
  cacheReadMultiplier: number;
  /** 0.5 when the documented Batch discount applies. */
  batchMultiplier: number;
  minCacheTokens: number;
  cacheEnabled: boolean;
  batchEnabled: boolean;
  /** Official cache durations are 5 and 60 minutes. Other values are treated as assumptions. */
  cacheTtlMinutes: number;
  operatingMinutesPerDay: number;
  successRate: number;
  stackCacheAndBatch?: boolean;
};

export type TokenBill = {
  requests: number;
  uncachedTokensPerRequest: number;
  cacheWriteTokensPerRequest: number;
  cacheReadTokensPerRequest: number;
  outputTokensPerRequest: number;
  usd: number;
};

export type CostScenario = {
  id: "baseline" | "cache" | "batch" | "combined";
  label: string;
  available: boolean;
  bill: TokenBill | null;
  note: string;
};

export type CostResult =
  | {
      ok: true;
      requestsPerCacheWindow: number | null;
      cacheEligible: boolean;
      scenarios: CostScenario[];
      comparedUsd: number;
      baselineUsd: number;
      savingsUsd: number;
      savingsPercent: number | null;
      successes: number;
      costPerSuccessUsd: number | null;
      assumptions: string[];
    }
  | { ok: false; errors: string[] };

function invalid(value: number): boolean {
  return typeof value !== "number" || !Number.isFinite(value);
}

export function validateCostInput(input: CostInput): string[] {
  const errors: string[] = [];
  const nonNegative: [keyof CostInput, string][] = [
    ["requestsPerDay", "Requests per day"],
    ["daysPerMonth", "Days per month"],
    ["staticInputTokens", "Static input tokens"],
    ["dynamicInputTokens", "Dynamic input tokens"],
    ["outputTokens", "Output tokens"],
    ["inputUsdPerMillion", "Input price"],
    ["outputUsdPerMillion", "Output price"],
    ["cacheWriteMultiplier", "Cache write multiplier"],
    ["cacheReadMultiplier", "Cache read multiplier"],
    ["batchMultiplier", "Batch multiplier"],
    ["minCacheTokens", "Minimum cache tokens"],
    ["cacheTtlMinutes", "Cache TTL"],
    ["operatingMinutesPerDay", "Operating minutes"],
  ];
  for (const [key, label] of nonNegative) {
    const value = input[key];
    if (typeof value !== "number" || invalid(value)) errors.push(`${label} must be a finite number.`);
    else if (value < 0) errors.push(`${label} cannot be negative.`);
  }
  if (invalid(input.successRate)) errors.push("Success rate must be a finite number.");
  else if (input.successRate < 0 || input.successRate > 1) {
    errors.push("Success rate must be between 0 and 1.");
  }
  if (input.batchMultiplier > 1) errors.push("Batch multiplier cannot be above 1 in this calculator.");
  if (input.cacheEnabled && input.cacheTtlMinutes <= 0) {
    errors.push("Cache TTL must be greater than zero when caching is on.");
  }
  if (input.cacheEnabled && input.operatingMinutesPerDay <= 0) {
    errors.push("Operating minutes must be greater than zero when caching is on.");
  }
  return errors;
}

export function requestsPerCacheWindow(requestsPerDay: number, operatingMinutes: number, ttlMinutes: number): number {
  const windows = Math.max(1, operatingMinutes / ttlMinutes);
  return requestsPerDay / windows;
}

function billTokens(args: {
  requests: number;
  uncached: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
  inputRate: number;
  writeRate: number;
  readRate: number;
  outputRate: number;
}): TokenBill {
  const usd =
    (args.requests *
      (args.uncached * args.inputRate +
        args.cacheWrite * args.writeRate +
        args.cacheRead * args.readRate +
        args.output * args.outputRate)) /
    1_000_000;
  return {
    requests: args.requests,
    uncachedTokensPerRequest: args.uncached,
    cacheWriteTokensPerRequest: args.cacheWrite,
    cacheReadTokensPerRequest: args.cacheRead,
    outputTokensPerRequest: args.output,
    usd,
  };
}

export function calculateCost(input: CostInput): CostResult {
  const errors = validateCostInput(input);
  if (errors.length > 0) return { ok: false, errors };

  const requests = input.requestsPerDay * input.daysPerMonth;
  const stack = input.stackCacheAndBatch ?? CACHE_AND_BATCH_STACK;
  const cacheEligible = input.staticInputTokens >= input.minCacheTokens && input.staticInputTokens > 0;
  const perWindow = input.cacheEnabled
    ? requestsPerCacheWindow(input.requestsPerDay, input.operatingMinutesPerDay, input.cacheTtlMinutes)
    : null;

  const fullUncached = input.staticInputTokens + input.dynamicInputTokens;
  const baseline = billTokens({
    requests,
    uncached: fullUncached,
    cacheWrite: 0,
    cacheRead: 0,
    output: input.outputTokens,
    inputRate: input.inputUsdPerMillion,
    writeRate: input.inputUsdPerMillion * input.cacheWriteMultiplier,
    readRate: input.inputUsdPerMillion * input.cacheReadMultiplier,
    outputRate: input.outputUsdPerMillion,
  });

  let writeFraction = 0;
  let readFraction = 0;
  if (input.cacheEnabled && cacheEligible && perWindow !== null) {
    writeFraction = perWindow >= 1 ? 1 / perWindow : 1;
    readFraction = perWindow >= 1 ? 1 - writeFraction : 0;
  }

  const useCache = input.cacheEnabled && cacheEligible;
  const cachedShape = {
    uncached: useCache ? input.dynamicInputTokens : fullUncached,
    cacheWrite: useCache ? input.staticInputTokens * writeFraction : 0,
    cacheRead: useCache ? input.staticInputTokens * readFraction : 0,
  };

  const cacheOnly = billTokens({
    requests,
    ...cachedShape,
    output: input.outputTokens,
    inputRate: input.inputUsdPerMillion,
    writeRate: input.inputUsdPerMillion * input.cacheWriteMultiplier,
    readRate: input.inputUsdPerMillion * input.cacheReadMultiplier,
    outputRate: input.outputUsdPerMillion,
  });

  const batchFactor = input.batchMultiplier;
  const batchOnly = billTokens({
    requests,
    uncached: fullUncached,
    cacheWrite: 0,
    cacheRead: 0,
    output: input.outputTokens,
    inputRate: input.inputUsdPerMillion * batchFactor,
    writeRate: input.inputUsdPerMillion * input.cacheWriteMultiplier * batchFactor,
    readRate: input.inputUsdPerMillion * input.cacheReadMultiplier * batchFactor,
    outputRate: input.outputUsdPerMillion * batchFactor,
  });

  const combined = billTokens({
    requests,
    ...cachedShape,
    output: input.outputTokens,
    inputRate: input.inputUsdPerMillion * batchFactor,
    writeRate: input.inputUsdPerMillion * input.cacheWriteMultiplier * batchFactor,
    readRate: input.inputUsdPerMillion * input.cacheReadMultiplier * batchFactor,
    outputRate: input.outputUsdPerMillion * batchFactor,
  });

  const cacheNote = !input.cacheEnabled
    ? "Caching is off, so static and dynamic input are both billed as ordinary input."
    : !cacheEligible
      ? `The static prefix is below the ${input.minCacheTokens.toLocaleString("en-US")} token cache minimum, so the request is billed as uncached input. No error is simulated.`
      : perWindow !== null && perWindow < 1
        ? "Fewer than one request falls in each cache lifetime, so every request pays a cache write and none pay a cache read."
        : "Each cache lifetime pays for one write of the static prefix. Later requests in that lifetime pay a cache read. Dynamic tokens stay uncached. Static tokens are not billed twice.";

  const scenarios: CostScenario[] = [
    {
      id: "baseline",
      label: "Baseline, no cache and no batch",
      available: true,
      bill: baseline,
      note: "requests × ((static + dynamic) × input rate + output × output rate) / 1,000,000",
    },
    {
      id: "cache",
      label: "Cache only",
      available: input.cacheEnabled,
      bill: input.cacheEnabled ? cacheOnly : null,
      note: cacheNote,
    },
    {
      id: "batch",
      label: "Batch only",
      available: input.batchEnabled,
      bill: input.batchEnabled ? batchOnly : null,
      note: "Batch applies the configured discount to input and output. The workload must be able to wait.",
    },
    {
      id: "combined",
      label: "Cache and batch together",
      available: input.cacheEnabled && input.batchEnabled && stack,
      bill: input.cacheEnabled && input.batchEnabled && stack ? combined : null,
      note: stack
        ? "Current pricing documentation says cache multipliers stack with the Batch discount, so both are applied."
        : "This configuration does not combine cache and batch. Compare those scenarios separately.",
    },
  ];

  const active = scenarios.filter((scenario) => scenario.available && scenario.id !== "baseline" && scenario.bill);
  const compared = active.length
    ? active.reduce((best, scenario) => (scenario.bill!.usd < best.bill!.usd ? scenario : best))
    : scenarios[0];
  const comparedUsd = compared.bill?.usd ?? baseline.usd;
  const savingsUsd = baseline.usd - comparedUsd;
  const savingsPercent = baseline.usd === 0 ? null : (savingsUsd / baseline.usd) * 100;
  const successes = requests * input.successRate;

  const assumptions = [
    "Prices are list prices unless you edit them. Enterprise discounts are not included.",
    "One cache write is assumed at the start of each TTL window, then reads until expiry. Real traffic is burstier.",
    "The first response must finish before parallel callers can read the new cache entry. This calculator does not model that race.",
    input.cacheTtlMinutes === 5 || input.cacheTtlMinutes === 60
      ? "The TTL matches a documented ephemeral cache duration."
      : "This TTL is an illustrative assumption. Documented default durations are 5 minutes and 1 hour.",
    "A newer tokenizer can change token counts by roughly 30% depending on the text. Do not convert tokens to words with a fixed ratio.",
  ];

  return {
    ok: true,
    requestsPerCacheWindow: perWindow,
    cacheEligible,
    scenarios,
    comparedUsd,
    baselineUsd: baseline.usd,
    savingsUsd,
    savingsPercent,
    successes,
    costPerSuccessUsd: successes === 0 ? null : comparedUsd / successes,
    assumptions,
  };
}
