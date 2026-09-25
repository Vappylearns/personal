export type HealthPoint = { week: string; requests: number; successes: number; errors: number; cacheHitRate: number; spendUsd: number };

export type HealthAccount = {
  id: string;
  name: string;
  pattern: string;
  summary: string;
  series: HealthPoint[];
  evidence: { id: string; label: string; finding: string }[];
  hypotheses: { id: string; label: string; sound: boolean; why: string }[];
  actions: { id: string; label: string; sound: boolean; why: string }[];
};

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];

function series(rows: [number, number, number, number, number][]): HealthPoint[] {
  return rows.map(([requests, successes, errors, cacheHitRate, spendUsd], index) => ({
    week: weeks[index],
    requests,
    successes,
    errors,
    cacheHitRate,
    spendUsd,
  }));
}

export const healthAccounts: HealthAccount[] = [
  {
    id: "expansion",
    name: "Northwind Delivery Cloud",
    pattern: "Successful expansion",
    summary: "A second business unit launched a registered contract-summary workflow. Spend rose with completed workflows.",
    series: series([
      [4000, 3600, 40, 0.55, 820],
      [4200, 3800, 38, 0.57, 860],
      [6100, 5600, 50, 0.6, 1240],
      [7800, 7200, 55, 0.62, 1560],
      [8400, 7900, 48, 0.64, 1680],
      [9000, 8500, 52, 0.66, 1780],
    ]),
    evidence: [
      { id: "sponsor", label: "Ask who sponsored the new workflow", finding: "The delivery director sponsored a contract-summary workflow for the infrastructure unit in week 3." },
      { id: "quality", label: "Ask for review outcomes", finding: "Human reviewers accepted 93% of summaries. The rejects were formatting issues, not invented clauses." },
      { id: "seats", label: "Ask for seat activity", finding: "Weekly active seats rose from 140 to 260. The new seats are in the unit that launched the workflow." },
    ],
    hypotheses: [
      { id: "growth", label: "A real workflow expanded, so usage and successful tasks moved together.", sound: true, why: "Successes, seats, and a named workflow all moved after week 3." },
      { id: "waste", label: "Higher spend by itself means the account is unhealthy.", sound: false, why: "Spend without outcomes is a warning. Spend with completed, reviewed work can be expansion." },
    ],
    actions: [
      { id: "case", label: "Document the workflow, the baseline, and a reference story the sponsor will confirm.", sound: true, why: "Expansion conversations need a workflow the customer recognizes, not a token chart." },
      { id: "upsell-tokens", label: "Push a larger committed spend because tokens went up.", sound: false, why: "Token growth is not the value. Ask whether the next unit has an owner and a review path." },
    ],
  },
  {
    id: "optimization",
    name: "Sutlej Support Stack",
    pattern: "Usage down because of optimization",
    summary: "The same classification workflow is completing. Cache hit rate rose and spend fell.",
    series: series([
      [20000, 18400, 200, 0.1, 2400],
      [19800, 18300, 190, 0.15, 2300],
      [12000, 11200, 140, 0.72, 980],
      [11000, 10400, 120, 0.78, 860],
      [10800, 10300, 110, 0.8, 820],
      [10600, 10200, 100, 0.82, 790],
    ]),
    evidence: [
      { id: "cache", label: "Ask what changed in the prompt", finding: "Engineering moved a 20k-token help center prefix behind prompt caching in week 3. The handbook text is stable." },
      { id: "tasks", label: "Ask for completed tickets", finding: "Auto-classified tickets stayed near 10,000 a week. Agents did not report a quality drop." },
      { id: "errors", label: "Ask for error codes", finding: "Error rate stayed near 1%. There was no timeout spike." },
    ],
    hypotheses: [
      { id: "opt", label: "The customer removed repeated input cost. Falling tokens are a success.", sound: true, why: "Completed work held up while cache hits rose and spend fell." },
      { id: "churn", label: "The account is churning because requests fell.", sound: false, why: "Requests fell, but successful tasks did not. Churn would show abandoned workflows." },
    ],
    actions: [
      { id: "protect", label: "Congratulate the saving, confirm quality, and look for the next uncached repeated prefix.", sound: true, why: "A consumption CS motion should protect useful work, not refill tokens that caching removed." },
      { id: "reverse", label: "Ask them to turn caching off to restore spend.", sound: false, why: "That raises the bill without helping the customer." },
    ],
  },
  {
    id: "failure",
    name: "Deccan Claims Desk",
    pattern: "Usage down because of failure",
    summary: "Requests and successes fell together after a schema change. Errors climbed.",
    series: series([
      [8000, 7400, 80, 0.4, 1600],
      [8100, 7500, 90, 0.41, 1620],
      [6400, 4200, 900, 0.4, 1500],
      [4200, 1800, 1400, 0.38, 1100],
      [3000, 900, 1200, 0.36, 780],
      [2200, 500, 900, 0.35, 560],
    ]),
    evidence: [
      { id: "errors", label: "Ask for a sample of errors", finding: "Week 3 started returning validation errors: the model emitted claim totals as strings and the new schema required numbers. Jobs then stopped retrying." },
      { id: "owner", label: "Ask who owns the workflow", finding: "The claims operations lead paused the workflow after adjusters lost trust. No one is on point to repair the schema." },
      { id: "cache", label: "Ask whether caching explains the drop", finding: "Cache hit rate barely changed. Cost fell because the job stopped, not because the prefix was reused." },
    ],
    hypotheses: [
      { id: "break", label: "A release broke the workflow and people stopped using it.", sound: true, why: "Errors jumped in the same week successes fell. Caching does not explain it." },
      { id: "opt", label: "This is healthy optimization, like the support account.", sound: false, why: "Optimization keeps successful tasks flat or up. Here successes collapsed." },
    ],
    actions: [
      { id: "repair", label: "Restore a known-good schema, add a regression case for numeric fields, and name an owner before turning traffic back on.", sound: true, why: "The customer needs the workflow, not a pep talk about adoption." },
      { id: "training", label: "Schedule more prompt training for adjusters.", sound: false, why: "The failure is in the integration contract. Training does not fix a type mismatch." },
    ],
  },
  {
    id: "waste",
    name: "Malabar Bid Office",
    pattern: "High spend, poor outcomes",
    summary: "A team pastes entire bid libraries into a strong model. Reviewers reject most drafts.",
    series: series([
      [1500, 1100, 30, 0.05, 2200],
      [1800, 1000, 40, 0.04, 3100],
      [2400, 900, 50, 0.04, 4600],
      [2600, 700, 70, 0.03, 5400],
      [2800, 600, 80, 0.03, 6100],
      [3000, 500, 90, 0.02, 6900],
    ]),
    evidence: [
      { id: "review", label: "Ask for reviewer acceptance", finding: "Reviewers accepted 18% of drafts last week. The common note is “missed the client’s evaluation criteria”." },
      { id: "context", label: "Ask what is in the prompt", finding: "Analysts attach the full prior-bid archive, often past 300,000 tokens, with no retrieval filter and no checklist." },
      { id: "model", label: "Ask which model they use", finding: "They moved from Sonnet to the most capable model they could access. Acceptance did not improve." },
    ],
    hypotheses: [
      { id: "design", label: "Spend is high because the task design retrieves too much and checks too little.", sound: true, why: "Tokens and model strength rose while accepted drafts fell." },
      { id: "model", label: "The fix is a still stronger model.", sound: false, why: "A stronger model is not a substitute for a relevant packet, a schema, or a reviewer rubric." },
    ],
    actions: [
      { id: "redesign", label: "Cut the packet to the live criteria, add a checklist, and measure accepted drafts before any model upgrade.", sound: true, why: "Cost per accepted draft is the useful number. Raw spend is not." },
      { id: "commit", label: "Offer a larger annual commit to lock in the current run-rate.", sound: false, why: "Committing to a workflow reviewers reject creates a renewal problem." },
    ],
  },
];
