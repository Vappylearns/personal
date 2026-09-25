# AI Deployment Learning Lab — implementation plan

Workspace inspected 2026-09-25: no application code, package manifest, or design system. README contained only the heading "personal". Built a local React + TypeScript + Vite app with plain CSS.

## Checklist

- [x] Inspect repository and confirm it is empty of an app stack
- [x] Verify current Anthropic model, pricing, caching, batch, and product-control facts from official docs
- [x] Define lesson, source, and learning-state types
- [x] Establish visual tokens and app shell
- [x] Pure functions: cost, model decision, retrieval, evals, persistence
- [x] Day 2 vertical slice: lessons, tool lab, practice, notes, progress
- [x] Days 1 and 3–7 lessons and labs
- [x] Dashboard, search, glossary, review queue, interview practice, import/export
- [x] Tests for cost math, eval metrics, retrieval filters, persistence, and a core-flow smoke test
- [x] README, source registry, and a browser pass of the main flows

## Decisions

- No backend, login, or live model calls. Simulations are deterministic and labeled.
- Prices and model limits live in `src/config/pricing.ts`. Narrative lives in `src/content/`.
- Cache and batch multipliers may be combined because current pricing docs say those modifiers stack. The flag is config, not a hardcoded claim inside a component.
- Quality and latency numbers that Anthropic does not publish are labeled illustrative assumptions.
- localStorage schema version 1. Import replaces the saved learning record after confirmation.
