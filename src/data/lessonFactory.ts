import type { DayId, Lesson, PracticeQuestion } from "../types/learning";

const defaultPractice = (
  id: string,
  prompt: string,
  correct: string,
  wrong: string,
  explanation: string,
  mistake: string,
): PracticeQuestion => ({
  id,
  prompt,
  choices: [
    { id: "a", label: correct },
    { id: "b", label: wrong },
    { id: "c", label: "Skip evaluation and ship Friday" },
  ],
  correctChoiceId: "a",
  explanation,
  mistakeHint: mistake,
});

export function lesson(
  partial: Omit<Lesson, "practice"> & { practice?: PracticeQuestion[] },
): Lesson {
  return {
    practice: partial.practice ?? [
      defaultPractice(
        `${partial.id}-q1`,
        `What customer risk does "${partial.title}" primarily address?`,
        "Wrong outputs or spend without measurable workflow value",
        "Guaranteed truth from larger models alone",
        "Enterprise buyers need reliability, governance, and ROI — not raw model size.",
        "Bigger models do not remove the need for evaluation and permissions.",
      ),
    ],
    ...partial,
  };
}

export const dayMeta: Record<
  DayId,
  { title: string; subtitle: string; agenda: string; evidence: string }
> = {
  day1: {
    title: "Model selection & context",
    subtitle: "Route work to the right capability, latency, and cost profile.",
    agenda: "90–120 min: models, context budget, routing lab, practice.",
    evidence: "Short model-selection recommendation memo.",
  },
  day2: {
    title: "APIs, tools & structured outputs",
    subtitle: "Trace requests, validate tools, and bound automation.",
    agenda: "90–120 min: API anatomy, tool walkthrough lab, JSON validation.",
    evidence: "Annotated request/response sequence + permission boundaries.",
  },
  day3: {
    title: "Token economics, caching & batching",
    subtitle: "Measure cost per successful outcome, not tokens alone.",
    agenda: "90–120 min: pricing mechanics, calculator lab, savings narrative.",
    evidence: "Cost comparison with measurement plan.",
  },
  day4: {
    title: "Enterprise adoption & governance",
    subtitle: "Sponsorship, access, auditability, and rollout design.",
    agenda: "90–120 min: SSO/SCIM concepts, 30/60/90 builder, value metrics.",
    evidence: "Rollout plan separating activity, quality, and value.",
  },
  day5: {
    title: "RAG, long context & trust",
    subtitle: "Ground answers in permitted, fresh evidence.",
    agenda: "90–120 min: retrieval pipeline lab, failure diagnosis.",
    evidence: "Failure diagnosis + retrieval/access recommendation.",
  },
  day6: {
    title: "Evals & Claude Code adoption",
    subtitle: "Measure quality before production; adopt dev workflows safely.",
    agenda: "90–120 min: eval workbench, dev workflow walkthrough.",
    evidence: "Release recommendation + adoption measurement plan.",
  },
  day7: {
    title: "Consumption CS & interview rehearsal",
    subtitle: "Diagnose accounts and rehearse credible answers.",
    agenda: "90–120 min: health investigation lab, interview practice.",
    evidence: "Account action plan + four interview drafts.",
  },
};
