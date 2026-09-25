# AI Deployment Learning Lab

Interactive, single-user learning site for enterprise AI deployment — built for **Vipul** to practice customer decisions, technical fluency, and interview narratives without live API keys.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown (default `http://localhost:5173`).

```bash
npm run build    # production bundle in dist/
npm run preview  # serve dist/
npm test         # unit tests (cost, persistence, eval gate)
```

## What’s inside

- **7 study days** with lessons, practice questions, interview prep, and labs
- **localStorage** progress, notes, bookmarks, review queue, interview drafts
- **Export/import** versioned JSON; Markdown export for notes and interview answers
- **Simulations** labeled “Simulation — illustrative data” — not live models or vendor benchmarks

## Editing content

| Area | Location |
| --- | --- |
| Lessons & days | `src/data/curriculum.ts`, `src/data/lessonFactory.ts` |
| Glossary | `src/data/glossary.ts` |
| API pricing (verify against Anthropic docs) | `src/config/pricing.ts` |
| Source registry | `src/config/sources.ts` |
| RAG corpus / eval fixtures | `src/data/policyCorpus.ts`, `src/data/evalFixture.ts` |
| Cost formulas | `src/lib/cost.ts` |

Update `verifiedOn` in `src/config/sources.ts` whenever you re-check [Anthropic pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) or model docs.

## Simulation limits

- Model quality/latency scores in the model simulator are **illustrative**
- RAG lab uses **deterministic lexical ranking**, not embedding similarity
- Customer health and eval cases are **synthetic**
- Interview practice has **no automatic free-text scoring**

## Deployment (optional)

Build static assets with `npm run build` and host `dist/` on any static host (S3, Netlify, Vercel, etc.). No server required.

## Manual walkthrough checklist

1. Complete **Day 2** tool walkthrough lab and a practice question
2. Open **Day 3** cost calculator and compare baseline vs caching
3. Diagnose a failure in **Day 5** RAG lab (stale or restricted doc)
4. Reload the browser — progress and notes should persist
5. **Settings** → export notes Markdown and progress JSON
