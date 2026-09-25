/**
 * API price table — edit here when Anthropic updates list prices.
 * Values below mirror docs.anthropic.com pricing page as of verification date in sources registry.
 * Simulation quality/latency scores are illustrative, not vendor benchmarks.
 */

export interface ModelPriceRow {
  apiId: string;
  displayName: string;
  inputPerMtok: number;
  outputPerMtok: number;
  cacheWrite5mPerMtok: number;
  cacheReadPerMtok: number;
  /** Illustrative relative scores for lab only (1–10). */
  qualityScore: number;
  latencyScore: number;
  contextTokens: number;
  notes?: string;
}

export const MODEL_PRICES: ModelPriceRow[] = [
  {
    apiId: "claude-haiku-4-5",
    displayName: "Claude Haiku 4.5",
    inputPerMtok: 1,
    outputPerMtok: 5,
    cacheWrite5mPerMtok: 1.25,
    cacheReadPerMtok: 0.1,
    qualityScore: 6,
    latencyScore: 9,
    contextTokens: 200_000,
    notes: "Verify exact API model string on Models page before production.",
  },
  {
    apiId: "claude-sonnet-4-5",
    displayName: "Claude Sonnet 4.5",
    inputPerMtok: 3,
    outputPerMtok: 15,
    cacheWrite5mPerMtok: 3.75,
    cacheReadPerMtok: 0.3,
    qualityScore: 8,
    latencyScore: 7,
    contextTokens: 200_000,
  },
  {
    apiId: "claude-opus-4-5",
    displayName: "Claude Opus 4.5",
    inputPerMtok: 5,
    outputPerMtok: 25,
    cacheWrite5mPerMtok: 6.25,
    cacheReadPerMtok: 0.5,
    qualityScore: 9,
    latencyScore: 5,
    contextTokens: 200_000,
  },
];

/** Batch API discount used only when documented — 50% on input/output for eligible batch jobs (verify current docs). */
export const BATCH_DISCOUNT_FACTOR = 0.5;
