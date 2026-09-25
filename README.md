# AI Deployment Learning Lab

A local, single-user study site for Vipul. It teaches enterprise AI deployment from first principles: model choice, APIs and tools, token cost, governance, retrieval, evaluation, Claude Code adoption, and consumption customer success.

Completing the lab is practice. It is not a prediction of interview success and not proof of job readiness.

The app does not call a model, need an API key, or send data anywhere. Simulations are labeled **Simulation — illustrative data**.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm test          # cost math, eval metrics, retrieval filters, persistence, smoke flow
npm run typecheck
npm run build     # output in dist/
npm run preview   # serve the production build
```

## Study path

Seven days, about 90–120 minutes each. Study in any order. The dashboard **Resume** button returns to the last lesson. Marking a lesson complete is separate from quiz results and from the confidence score you set yourself. Opening a lesson does not mark it complete.

Wrong practice answers enter the review queue. A later correct answer clears that item. Flag a lesson to revisit it.

## Where to edit content

| What | File |
| --- | --- |
| Lesson text | `src/content/days/day1.ts` … `day7.ts` |
| Glossary | `src/content/glossary.ts` |
| Interview prompts | `src/content/interview.ts` |
| Model IDs, list prices, cache minimums, context windows | `src/config/pricing.ts` |
| Whether cache and batch discounts stack | `CACHE_AND_BATCH_STACK` in `src/config/pricing.ts` |
| Source titles, URLs, and verification dates | `src/config/sources.ts` |
| Retrieval corpus | `src/content/policyCorpus.ts` |
| Evaluation fixtures | `src/content/evalCases.ts` |
| Account health fixtures | `src/content/healthFixtures.ts` |

Prices were checked against Anthropic’s public docs on **2026-09-25**. Re-check the source registry before a customer conversation. Editorial quality bands and any operating-day pattern in the cost lab are assumptions, not vendor benchmarks.

## Progress files

Progress, notes, bookmarks, quiz attempts, and lab evidence live in `localStorage` under schema version 1 (`aidll.learning-state.v1`).

- **Export** downloads Markdown (notes, evidence, interview drafts) and a versioned JSON learning record.
- **Import** replaces the whole local record after you confirm. Malformed JSON is rejected and the current record stays.
- **Reset** asks before clearing the browser record.

No secrets or customer data belong in this app.

## Simulation limits

- Model latency in the decision lab uses Anthropic’s comparative labels (fastest, fast, moderate, slower), not measured milliseconds.
- Quality thresholds are an editorial map of model positioning. They are not benchmark scores.
- The cost calculator assumes one cache write per TTL window. Parallel cold starts can all miss in production; the lab says so.
- Cache and batch are combined only because the pricing page checked on 2026-09-25 says those multipliers stack. Turn `CACHE_AND_BATCH_STACK` off to compare them separately.
- The retrieval lab uses deterministic term overlap. It is not embedding similarity.
- Evaluation scores are counted from 12 synthetic cases. They are not a production quality claim.
- The order service and CRM note never leave the browser. The coding lab does not run shell commands.
- Claude Opus 5.5 appears in some current doc examples. A complete price row was not in the pricing table captured for this lab, so it is not a selectable priced model. Structured-output examples on the docs use `claude-opus-5-5`; confirm model support before a production design.

## Deploy

This task does not publish the site. To host the static build yourself:

1. `npm run build`
2. Serve the `dist/` directory from any static host (Netlify, Cloudflare Pages, S3, GitHub Pages, or `npx serve dist`).
3. The app is a client-side hash router. Configure the host to serve `index.html` for unknown paths if you later switch to history routing. Hash routes work without that rewrite.

## Manual walkthrough

1. Open Day 2, “Schemas, retries, and doing it once.” Step the order-status lab through success, unauthorized, and the CRM note. Click the CRM button twice and confirm the second click does not add a note. Save the sequence note.
2. Open Day 3 and load “10,000 documents and a 20,000-token handbook.” Compare baseline, cache, and batch. Set requests so only one call falls in each cache window and confirm the saving can go negative.
3. Open the Day 5 retrieval lab. Choose the salary-band question as Delivery and confirm the restricted document is excluded. Set freshness so the 2023 travel policy drops out.
4. Reload the page. Resume should return to the last lesson, and the evidence note should still be there.
5. Export notes from the Export page.
