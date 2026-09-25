# AI Deployment Learning Lab — Implementation Plan

## Workspace findings (start)
- Minimal Node placeholder (`index.js`, smoke test only).
- No React/Vite app; scaffolding React 19 + TypeScript + Vite + React Router.
- Cloud install script retained at `.cursor/scripts/cloud-agent-install.sh`.

## Phased checklist

- [x] Phase 0: Scaffold toolchain, design tokens, types, persistence schema
- [x] Phase 1: Vertical slice — Day 2 lesson + tool lab + practice + notes + progress
- [x] Phase 2: Days 1, 3–7 modules, labs, practice questions
- [x] Phase 3: Dashboard, search, glossary, review queue, interview practice
- [x] Phase 4: Import/export, tests, README, browser verification (in progress)

## Architecture
- `src/config/` — pricing, model profiles, source registry (editable)
- `src/data/` — curriculum, glossary, fixtures (simulations)
- `src/lib/` — pure functions (cost, eval, persistence)
- `src/components/` — reusable UI + labs
- `src/pages/` — routes
- `src/context/` — learning state
