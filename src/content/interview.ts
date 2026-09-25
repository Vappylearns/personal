import type { InterviewPrompt } from "../types";

const rubric = [
  { id: "problem", label: "Names a specific customer problem" },
  { id: "mechanism", label: "Explains the mechanism in plain language" },
  { id: "tradeoff", label: "States a tradeoff or limit" },
  { id: "measure", label: "Says what you would measure" },
  { id: "own", label: "Uses your own experience, not the exemplar" },
];

export const interviewPrompts: InterviewPrompt[] = [
  {
    id: "consumption-growth",
    prompt: "How would you drive useful Claude API consumption growth?",
    scaffold: `Situation: name one workflow a customer already repeats.\nDecision: what you would instrument before asking for more usage.\nAction: the adoption motion (owner, pilot, quality bar, cache or batch only if the workload fits).\nResult: the outcome you would watch, such as completed tasks and cost per success.\nLimit: token growth alone is not health.`,
    exemplar: `Example response — not your work. I would not start from a token target. I would pick one workflow with an owner, such as classifying support tickets, and write down today's completion rate, error rate, and cost per successful ticket. I would remove friction that blocks that workflow: access, a broken schema, or a prompt that pastes a whole handbook on every call. If the handbook is stable I would test caching and check that successful tickets stay flat while cost falls. Growth then means a second team adopting the same measured workflow, not a larger invoice with worse outcomes.`,
    rubric,
  },
  {
    id: "how-technical",
    prompt: "How technical are you? Demonstrate with a concrete workflow.",
    scaffold: `Pick one workflow: order status, retrieval, or a cost model.\nTrace the path of one request in five steps.\nSay where the application, not the model, checks permission.\nSay one failure and the evidence you would ask for.\nClose with what you would not claim.`,
    exemplar: `Example response — not your work. I am not the engineer who designs the serving stack. I can trace a workflow. A customer asks for an order status. The model may request a tool. My application validates the arguments, checks that this caller may see that order, then calls the order service with a timeout and an idempotency key. The tool result comes back, and a second model call writes the answer. If we get a 404 I say the order is missing. If we get a timeout I do not invent a status. A valid JSON status is still not proof the warehouse shipped the box.`,
    rubric,
  },
  {
    id: "why-anthropic-india",
    prompt: "Why Anthropic, and why enterprise AI adoption in India?",
    scaffold: `Why this work: enterprise adoption, not a generic interest in AI.\nWhy this buyer: Indian IT services and global capability centers have scale, delivery pressure, and strict client contracts.\nWhat you bring: customer success and GTM judgment.\nWhat you would verify: data residency, plan versus API commercial terms, and a workflow owner.\nDo not invent an Anthropic office, headcount, or personal achievement.`,
    exemplar: `Example response — not your work. I want the adoption problem, not a demo tour. Indian IT services firms and captive centers already run the workflows where a model can draft, classify, or search, and they also carry client restrictions that a chatbot trial ignores. My background is turning a product into a renewed, expanded relationship. I would separate Claude Enterprise workspace controls, Console API controls, and Claude Code approvals, and I would not promise savings until a workflow has a baseline. I would check current residency and commercial terms rather than repeat a slogan about India.`,
    rubric,
  },
  {
    id: "motion-from-zero",
    prompt: "How would you build an enterprise customer motion from zero?",
    scaffold: `Week 0: one sponsor and one painful workflow.\nDays 30: access, security review, baseline, five to ten design partners.\nDays 60: a trained workflow owner and a quality check.\nDays 90: a decision to expand, fix, or stop.\nName the metrics that are activity versus value.`,
    exemplar: `Example response — not your work. I would not launch to 5,000 people. I would ask a sponsor for one workflow, such as proposal first drafts in one industry unit, and write the baseline: cycle time, review rejection rate, and who signs the output. Day 30 is access, a security answer, and a handful of design partners. Day 60 is a workflow owner and a weekly review of failures. Day 90 is a decision. Seat activity tells me people logged in. Completed, accepted drafts tell me the work changed. I would label any time-saved figure as an estimate.`,
    rubric,
  },
];
