import {
  capabilityRank,
  latencyRank,
  modelById,
  models,
  type CapabilityBand,
  type LatencyLabel,
  type ModelProfile,
} from "../config/pricing";

export type LatencyNeed = "relaxed" | "interactive" | "fastest";
export type QualityNeed = CapabilityBand;

export type ModelWorkload = {
  requestsPerDay: number;
  daysPerMonth: number;
  instructions: number;
  tools: number;
  history: number;
  retrieved: number;
  reservedOutput: number;
  latencyNeed: LatencyNeed;
  qualityNeed: QualityNeed;
};

export type ConstraintCheck = {
  id: string;
  ok: boolean;
  message: string;
};

export type ModelAssessment = {
  model: ModelProfile;
  inputTokens: number;
  monthlyUsd: number;
  checks: ConstraintCheck[];
  hardFail: boolean;
  fitFail: boolean;
};

const latencyNeedRank: Record<LatencyNeed, number> = {
  fastest: 1,
  interactive: 2,
  relaxed: 4,
};

export function contextInput(workload: ModelWorkload): number {
  return workload.instructions + workload.tools + workload.history + workload.retrieved;
}

export function monthlyCost(model: ModelProfile, workload: ModelWorkload): number {
  const requests = workload.requestsPerDay * workload.daysPerMonth;
  const input = contextInput(workload);
  return (requests * (input * model.inputUsdPerMillion + workload.reservedOutput * model.outputUsdPerMillion)) / 1_000_000;
}

export function assessModel(model: ModelProfile, workload: ModelWorkload): ModelAssessment {
  const inputTokens = contextInput(workload);
  const checks: ConstraintCheck[] = [];
  const fitsWindow = inputTokens + workload.reservedOutput <= model.contextWindowTokens;
  checks.push({
    id: "window",
    ok: fitsWindow,
    message: fitsWindow
      ? `Input plus reserved output fits in the ${model.contextWindowTokens.toLocaleString("en-US")} token window.`
      : `Input plus reserved output exceeds the ${model.contextWindowTokens.toLocaleString("en-US")} token window.`,
  });
  const fitsOutput = workload.reservedOutput <= model.maxOutputTokens && workload.reservedOutput >= 0;
  checks.push({
    id: "output",
    ok: fitsOutput,
    message: fitsOutput
      ? `Reserved output is within the ${model.maxOutputTokens.toLocaleString("en-US")} token output cap.`
      : `Reserved output exceeds the ${model.maxOutputTokens.toLocaleString("en-US")} token output cap.`,
  });
  const latencyOk = latencyRank[model.latencyLabel] <= latencyNeedRank[workload.latencyNeed];
  checks.push({
    id: "latency",
    ok: latencyOk,
    message: latencyOk
      ? `Documented comparative latency (${model.latencyLabel}) meets the selected need.`
      : `Documented comparative latency is ${model.latencyLabel}, which is slower than the selected need. This is a label, not a measured millisecond benchmark.`,
  });
  const qualityOk = capabilityRank[model.capabilityAssumption] >= capabilityRank[workload.qualityNeed];
  checks.push({
    id: "quality",
    ok: qualityOk,
    message: qualityOk
      ? "The editorial fit band meets the threshold you set. This is not a vendor quality score."
      : "The editorial fit band is below the threshold you set. Confirm with an evaluation set before rejecting or accepting the model.",
  });
  return {
    model,
    inputTokens,
    monthlyUsd: monthlyCost(model, workload),
    checks,
    hardFail: checks.some((check) => (check.id === "window" || check.id === "output") && !check.ok),
    fitFail: checks.some((check) => (check.id === "latency" || check.id === "quality") && !check.ok),
  };
}

export function recommendModel(workload: ModelWorkload): {
  assessments: ModelAssessment[];
  recommended: ModelAssessment | null;
  reasons: string[];
} {
  const assessments = models.map((model) => assessModel(model, workload));
  const eligible = assessments.filter((item) => !item.hardFail && !item.fitFail);
  const pool = eligible.length ? eligible : assessments.filter((item) => !item.hardFail);
  const recommended = pool.slice().sort((a, b) => a.monthlyUsd - b.monthlyUsd || latencyRank[a.model.latencyLabel] - latencyRank[b.model.latencyLabel])[0] ?? null;
  const reasons: string[] = [];
  if (!recommended) {
    reasons.push("No configured model can hold this input plus reserved output.");
  } else if (!eligible.length) {
    reasons.push(`${recommended.model.label} is the lowest-cost model that fits the window, but it misses a latency or quality preference. Treat that preference as a hypothesis to test.`);
  } else {
    reasons.push(`${recommended.model.label} is the lowest list-price option that fits the window and the preferences you set.`);
    reasons.push("Before production, evaluate accuracy on held-out examples, measure latency on your own traffic, and confirm the model ID is still the one you intend to pin.");
  }
  reasons.push("More context is not automatically better. Unused retrieved text still costs input tokens and can distract the answer.");
  return { assessments, recommended, reasons };
}

export function selectedAssessment(modelId: string, workload: ModelWorkload): ModelAssessment | null {
  const model = modelById(modelId);
  if (!model) return null;
  return assessModel(model, workload);
}

export const latencyNeedOptions: { id: LatencyNeed; label: string }[] = [
  { id: "fastest", label: "Fastest comparative class only" },
  { id: "interactive", label: "Interactive: fastest or fast" },
  { id: "relaxed", label: "Can wait" },
];

export const qualityNeedOptions: { id: QualityNeed; label: string }[] = [
  { id: "routine", label: "Routine classification" },
  { id: "careful", label: "Careful extraction" },
  { id: "deep", label: "Deep synthesis" },
];

export function latencyLabelText(label: LatencyLabel): string {
  return label;
}
