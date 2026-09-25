import type { DayId, DayModule, Lesson } from "../types/learning";
import { dayMeta, lesson } from "./lessonFactory";

const sharedWalkthrough = [
  { label: "Trigger", detail: "User or system event starts the workflow." },
  { label: "Assemble context", detail: "Instructions, tools, history, retrieved text, output budget." },
  { label: "Model step", detail: "Model proposes language and optional tool calls — does not execute business actions." },
  { label: "Application layer", detail: "Your code validates, authorizes, calls services, logs, and returns results." },
  { label: "Outcome", detail: "User sees answer; metrics capture quality, latency, and cost." },
];

function dayLessons(dayId: DayId, topics: { id: string; title: string; labId?: string; extra?: Partial<Lesson> }[]): Lesson[] {
  const meta = dayMeta[dayId];
  return topics.map((t) =>
    lesson({
      id: t.id,
      dayId,
      title: t.title,
      durationMinutes: 25,
      overview30s: `You will ${t.title.toLowerCase()} and connect it to customer outcomes for ${meta.title}.`,
      customerProblem:
        "A CIO asks why invoices spiked while ticket deflection stalled — you need a mechanism story, not hype.",
      firstPrinciples: {
        constraint: "Models are probabilistic and context-limited.",
        mechanism: "Structure prompts, tools, retrieval, and evaluation to bound risk.",
        tradeoff: "Each guardrail adds latency, cost, or engineering effort.",
      },
      walkthroughSteps: sharedWalkthrough,
      failureCase: {
        breakdown: "Tool call executed without authorization check.",
        symptoms: "Customer sees another account's order ID in chat logs.",
        recovery: "Move permissions to application layer; add audit log + regression test.",
      },
      quickExplanation: `${t.title}: the business-visible piece of the AI system you can explain without jargon.`,
      howItWorks: "Separate what the model suggests from what your application allows to happen.",
      goDeeper: "Map each control to an enterprise concern: security, compliance, cost, or quality.",
      customerValue: "Fewer incidents, predictable spend, faster time-to-value in production workflows.",
      interviewPrep: {
        prompt: `Explain ${t.title} to a skeptical enterprise buyer in 90 seconds.`,
        scaffold: "Situation → mechanism → trade-off → customer metric → next step",
        exemplar:
          "Example only: We route high-risk requests to a smaller, faster model for triage, then escalate complex cases to a larger model with retrieval and human review — measuring cost per resolved ticket, not tokens used.",
        rubric: [
          "Names a concrete workflow",
          "Separates model output from execution",
          "States a trade-off honestly",
          "Ties to measurable value",
        ],
      },
      glossaryTerms: ["token", "context window", "tool use"],
      sourceIds: ["anthropic-pricing", "anthropic-tool-use"],
      labId: t.labId,
      ...t.extra,
    }),
  );
}

export const days: DayModule[] = [
  {
    id: "day1",
    title: dayMeta.day1.title,
    subtitle: dayMeta.day1.subtitle,
    agendaMinutes: dayMeta.day1.agenda,
    evidenceArtifact: dayMeta.day1.evidence,
    lessons: dayLessons("day1", [
      { id: "d1-l1", title: "Capability tiers and routing", labId: "model-simulator" },
      { id: "d1-l2", title: "Latency, quality, and cost trade-offs", labId: "model-simulator" },
      { id: "d1-l3", title: "Context budgeting in production", labId: "model-simulator" },
    ]),
  },
  {
    id: "day2",
    title: dayMeta.day2.title,
    subtitle: dayMeta.day2.subtitle,
    agendaMinutes: dayMeta.day2.agenda,
    evidenceArtifact: dayMeta.day2.evidence,
    lessons: dayLessons("day2", [
      { id: "d2-l1", title: "HTTP request and response anatomy", labId: "tool-walkthrough" },
      { id: "d2-l2", title: "Tool boundaries and idempotency", labId: "tool-walkthrough" },
      { id: "d2-l3", title: "Structured outputs vs factual correctness", labId: "tool-walkthrough" },
    ]),
  },
  {
    id: "day3",
    title: dayMeta.day3.title,
    subtitle: dayMeta.day3.subtitle,
    agendaMinutes: dayMeta.day3.agenda,
    evidenceArtifact: dayMeta.day3.evidence,
    lessons: dayLessons("day3", [
      { id: "d3-l1", title: "Input vs output spend", labId: "cost-calculator" },
      { id: "d3-l2", title: "Prompt caching mechanics", labId: "cost-calculator" },
      { id: "d3-l3", title: "Batch workloads and unit economics", labId: "cost-calculator" },
    ]),
  },
  {
    id: "day4",
    title: dayMeta.day4.title,
    subtitle: dayMeta.day4.subtitle,
    agendaMinutes: dayMeta.day4.agenda,
    evidenceArtifact: dayMeta.day4.evidence,
    lessons: dayLessons("day4", [
      { id: "d4-l1", title: "SSO, SCIM, and roles", labId: "rollout-builder" },
      { id: "d4-l2", title: "Champions and workflow ownership", labId: "rollout-builder" },
      { id: "d4-l3", title: "Measuring adoption vs value", labId: "rollout-builder" },
    ]),
  },
  {
    id: "day5",
    title: dayMeta.day5.title,
    subtitle: dayMeta.day5.subtitle,
    agendaMinutes: dayMeta.day5.agenda,
    evidenceArtifact: dayMeta.day5.evidence,
    lessons: dayLessons("day5", [
      { id: "d5-l1", title: "Chunking and retrieval", labId: "rag-pipeline" },
      { id: "d5-l2", title: "Permissions before context assembly", labId: "rag-pipeline" },
      { id: "d5-l3", title: "Citations, abstention, and review", labId: "rag-pipeline" },
    ]),
  },
  {
    id: "day6",
    title: dayMeta.day6.title,
    subtitle: dayMeta.day6.subtitle,
    agendaMinutes: dayMeta.day6.agenda,
    evidenceArtifact: dayMeta.day6.evidence,
    lessons: dayLessons("day6", [
      { id: "d6-l1", title: "Eval datasets and regression gates", labId: "eval-workbench" },
      { id: "d6-l2", title: "LLM judges and disagreement", labId: "eval-workbench" },
      { id: "d6-l3", title: "Claude Code workflow safety", labId: "dev-workflow" },
    ]),
  },
  {
    id: "day7",
    title: dayMeta.day7.title,
    subtitle: dayMeta.day7.subtitle,
    agendaMinutes: dayMeta.day7.agenda,
    evidenceArtifact: dayMeta.day7.evidence,
    lessons: dayLessons("day7", [
      { id: "d7-l1", title: "Usage telemetry that matters", labId: "customer-health" },
      { id: "d7-l2", title: "Expansion vs optimization signals", labId: "customer-health" },
      { id: "d7-l3", title: "Interview narratives for India enterprise", labId: "customer-health" },
    ]),
  },
];

export const allLessons: Lesson[] = days.flatMap((d) => d.lessons);

export function getLesson(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function getDay(id: DayId): DayModule | undefined {
  return days.find((d) => d.id === id);
}
