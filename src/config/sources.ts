import type { SourceRecord } from "../types";

export const sources: SourceRecord[] = [
  {
    id: "models",
    title: "Models overview",
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    verifiedOn: "2026-09-25",
    facts: [
      "Headline API IDs include claude-fable-5-1, claude-opus-5, claude-sonnet-5, and claude-haiku-4-5-20251001.",
      "Context windows: 1M tokens for Fable 5.1, Opus 5, and Sonnet 5; 200K for Haiku 4.5.",
      "Max output: 128K for Fable 5.1, Opus 5, and Sonnet 5; 64K for Haiku 4.5.",
      "Comparative latency labels: Fable slower, Opus moderate, Sonnet fast, Haiku fastest.",
      "Published retirement floors differ by model. “Not sooner than” is not a shutdown date.",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    url: "https://docs.anthropic.com/en/docs/about-claude/pricing",
    verifiedOn: "2026-09-25",
    facts: [
      "List prices per million tokens: Fable 5.1 $10 / $50, Opus 5 $5 / $25, Sonnet 5 $2 / $10, Haiku 4.5 $1 / $5.",
      "Cache writes are 1.25× base input for 5 minutes and 2× for 1 hour. Cache reads are 0.1× base input, or 0.025× on Fable 5.1.",
      "Batch processing is a 50% discount on input and output. Cache multipliers stack with the Batch discount.",
      "Claude 4.6 and later models include the full 1M context window at standard per-token rates.",
      "Claude 4.7 and later models use a tokenizer that produces about 30% more tokens for the same text. The exact change depends on the text.",
    ],
  },
  {
    id: "caching",
    title: "Prompt caching",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    verifiedOn: "2026-09-25",
    facts: [
      "Minimum cacheable prompt length includes 512 tokens for Fable 5.1 and Opus 5, 1,024 for Sonnet 5, and 4,096 for Haiku 4.5.",
      "Shorter prompts are processed without caching and without an error. Check cache_creation_input_tokens and cache_read_input_tokens.",
      "A cache entry becomes available after the first response begins. Parallel requests can miss the cache.",
      "Place the cache breakpoint on the last unchanging prefix. A breakpoint on changing text causes a write every time.",
    ],
  },
  {
    id: "structured",
    title: "Structured outputs",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs",
    verifiedOn: "2026-09-25",
    facts: [
      "JSON outputs use output_config.format. Strict tool use can constrain tool inputs.",
      "Structured outputs guarantee schema shape. They do not guarantee that the values are true.",
      "The documented quick start example uses the model ID claude-opus-5-5.",
    ],
  },
  {
    id: "release-notes",
    title: "Claude Platform release notes",
    url: "https://docs.anthropic.com/en/release-notes/api",
    verifiedOn: "2026-09-25",
    facts: [
      "Sonnet 5 introductory $2 / $10 pricing became the standard price. A planned move to $3 / $15 on 1 September 2026 did not occur.",
      "Priority Tier is not available on Claude Sonnet 5.",
      "MCP connector and MCP tunnels are documented platform features, with tunnels in research preview at the time of these notes.",
      "Claude Code Auto mode is mentioned as expanded for long-running tasks. Exact permission-mode names should be rechecked in Claude Code docs before an implementation guide.",
    ],
  },
  {
    id: "enterprise-identity",
    title: "Identity management (SSO, JIT, SCIM)",
    url: "https://support.claude.com/en/collections/17270717-identity-management-sso-jit-scim",
    verifiedOn: "2026-09-25",
    facts: [
      "Claude help documents SSO setup and JIT or SCIM provisioning for organizations.",
      "These controls belong to the Claude plan organization, which is separate from Claude Console workspace roles and from Claude Code command approvals.",
    ],
  },
  {
    id: "enterprise-roles",
    title: "Manage custom roles on Enterprise plans",
    url: "https://support.claude.com/en/articles/13930452-manage-custom-roles-on-enterprise-plans",
    verifiedOn: "2026-09-25",
    facts: [
      "Enterprise plans can assign custom roles to groups, including groups synced from an identity provider.",
      "Custom roles can limit Claude capabilities. Connector permissions can limit which connectors and tools a role may use.",
    ],
  },
  {
    id: "audit-logs",
    title: "Access audit logs",
    url: "https://support.claude.com/en/articles/9970975-access-audit-logs",
    verifiedOn: "2026-09-25",
    facts: [
      "Audit log export is documented for Enterprise organizations.",
      "Owners can export the past 180 days from organization data and privacy settings. The download link is time-limited.",
      "Organizations using customer-managed encryption keys cannot use that export button; the Compliance API is the documented alternative.",
    ],
  },
  {
    id: "retention",
    title: "Configure custom data retention controls for Enterprise plans",
    url: "https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans",
    verifiedOn: "2026-09-25",
    facts: [
      "Enterprise plans have documented custom data retention controls.",
      "Retention settings are a commercial and product control. They are not implied by a longer context window.",
    ],
  },
  {
    id: "console-separate",
    title: "Claude subscription and Claude API are billed separately",
    url: "https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console",
    verifiedOn: "2026-09-25",
    facts: [
      "A paid Claude subscription does not by itself pay for Claude API and Console usage.",
      "Seat plans and API consumption are different commercial motions.",
    ],
  },
  {
    id: "console-workspaces",
    title: "Creating and managing Workspaces in the Claude Console",
    url: "https://support.claude.com/en/articles/9796807-creating-and-managing-workspaces-in-the-claude-console",
    verifiedOn: "2026-09-25",
    facts: [
      "Claude Console workspaces are an API administration boundary for keys, usage, and access.",
      "They are not the same object as a Claude Enterprise chat organization.",
    ],
  },
  {
    id: "claude-code-enterprise",
    title: "Use Claude Code with your Team or Enterprise plan",
    url: "https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan",
    verifiedOn: "2026-09-25",
    facts: [
      "Claude Code can be used with Team or Enterprise plans under the terms of those plans.",
      "Plan access, Console API keys, and local command approval are different control planes.",
    ],
  },
  {
    id: "claude-code-review",
    title: "Set up Code Review for Claude Code",
    url: "https://support.claude.com/en/articles/14233555-set-up-code-review-for-claude-code",
    verifiedOn: "2026-09-25",
    facts: [
      "Claude Code has a documented code-review setup path.",
      "A passing review or a passing test is evidence about the checks that ran, not proof that the business change is safe.",
    ],
  },
];

export function sourceById(id: string): SourceRecord | undefined {
  return sources.find((source) => source.id === id);
}
