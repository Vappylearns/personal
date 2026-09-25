import type { SourceRef } from "../types/learning";

/** Editable source registry — update verifiedOn when re-checking official docs. */
export const SOURCE_REGISTRY: SourceRef[] = [
  {
    id: "anthropic-pricing",
    title: "Anthropic API pricing",
    url: "https://docs.anthropic.com/en/docs/about-claude/pricing",
    factsSupported: "Per-model input/output MTok rates, prompt cache write/read multipliers, batch pricing notes",
    verifiedOn: "2026-09-25",
    status: "verified",
  },
  {
    id: "anthropic-models",
    title: "Anthropic models overview",
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    factsSupported: "Model families, context windows, deprecation notices (check current page)",
    verifiedOn: "2026-09-25",
    status: "needs-verification",
  },
  {
    id: "anthropic-tool-use",
    title: "Tool use (function calling)",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
    factsSupported: "Model proposes tools; client executes and returns results",
    verifiedOn: "2026-09-25",
    status: "verified",
  },
  {
    id: "anthropic-prompt-caching",
    title: "Prompt caching",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    factsSupported: "Cache eligibility, TTL, billing categories for cache writes/reads",
    verifiedOn: "2026-09-25",
    status: "verified",
  },
  {
    id: "anthropic-enterprise",
    title: "Claude for Enterprise (product)",
    url: "https://www.anthropic.com/enterprise",
    factsSupported: "Workspace SSO/SCIM positioning — verify current SKUs and regions separately from API Console",
    verifiedOn: "2026-09-25",
    status: "needs-verification",
  },
];

export function getSource(id: string): SourceRef | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}
