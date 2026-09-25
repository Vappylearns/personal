/**
 * Verified Claude API list prices and limits.
 * Edit this file when Anthropic updates pricing. Do not hardcode these numbers in components.
 * Verification date is also recorded in src/config/sources.ts.
 */
export const PRICING_VERIFIED_ON = "2026-09-25";

export type LatencyLabel = "fastest" | "fast" | "moderate" | "slower";
export type CapabilityBand = "routine" | "careful" | "deep";

export type ModelProfile = {
  id: string;
  label: string;
  apiId: string;
  description: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  cacheWrite5mMultiplier: number;
  cacheWrite1hMultiplier: number;
  cacheReadMultiplier: number;
  batchMultiplier: number;
  minCacheTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  latencyLabel: LatencyLabel;
  /** Editorial mapping from Anthropic's positioning, not a benchmark score. */
  capabilityAssumption: CapabilityBand;
  retirementNote: string;
};

export const CACHE_AND_BATCH_STACK = true;

export const models: ModelProfile[] = [
  {
    id: "haiku",
    label: "Claude Haiku 4.5",
    apiId: "claude-haiku-4-5-20251001",
    description: "Documented as the fastest model with near-frontier intelligence, aimed at high volume.",
    inputUsdPerMillion: 1,
    outputUsdPerMillion: 5,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.1,
    batchMultiplier: 0.5,
    minCacheTokens: 4096,
    contextWindowTokens: 200_000,
    maxOutputTokens: 64_000,
    latencyLabel: "fastest",
    capabilityAssumption: "routine",
    retirementNote: "Not sooner than 15 October 2026. That date is a floor, not a shutdown date.",
  },
  {
    id: "sonnet",
    label: "Claude Sonnet 5",
    apiId: "claude-sonnet-5",
    description: "Documented as the combination of speed and intelligence for everyday work.",
    inputUsdPerMillion: 2,
    outputUsdPerMillion: 10,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.1,
    batchMultiplier: 0.5,
    minCacheTokens: 1024,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    latencyLabel: "fast",
    capabilityAssumption: "careful",
    retirementNote: "Not sooner than 30 June 2027.",
  },
  {
    id: "opus",
    label: "Claude Opus 5",
    apiId: "claude-opus-5",
    description: "Documented for complex agentic coding and enterprise work.",
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 25,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.1,
    batchMultiplier: 0.5,
    minCacheTokens: 512,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    latencyLabel: "moderate",
    capabilityAssumption: "deep",
    retirementNote: "Not sooner than 24 July 2027.",
  },
  {
    id: "fable",
    label: "Claude Fable 5.1",
    apiId: "claude-fable-5-1",
    description: "Documented for demanding reasoning and long-horizon agentic work.",
    inputUsdPerMillion: 10,
    outputUsdPerMillion: 50,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.025,
    batchMultiplier: 0.5,
    minCacheTokens: 512,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    latencyLabel: "slower",
    capabilityAssumption: "deep",
    retirementNote: "Not sooner than 1 September 2027.",
  },
];

export const capabilityRank: Record<CapabilityBand, number> = {
  routine: 1,
  careful: 2,
  deep: 3,
};

export const latencyRank: Record<LatencyLabel, number> = {
  fastest: 1,
  fast: 2,
  moderate: 3,
  slower: 4,
};

export function modelById(id: string): ModelProfile | undefined {
  return models.find((model) => model.id === id);
}
