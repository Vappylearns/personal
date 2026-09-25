
export interface EvalCaseRow {
  id: string;
  input: string;
  expectedContains?: string;
  mustNotContain?: string;
  riskLevel: "low" | "high";
  variantA: boolean;
  variantB: boolean;
}

export function computePrecisionRecall(
  cases: EvalCaseRow[],
  field: "variantA" | "variantB",
): { precision: number; recall: number; passed: number; total: number } {
  const total = cases.length;
  const passed = cases.filter((c) => c[field]).length;
  // Synthetic binary classification: "pass" = positive class
  const precision = total > 0 ? passed / total : 0;
  const recall = precision; // single-label pass/fail per case for demo
  return { precision, recall, passed, total };
}

export function releaseGate(
  cases: EvalCaseRow[],
  field: "variantA" | "variantB",
): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const highRiskFails = cases.filter(
    (c) => c.riskLevel === "high" && !c[field],
  );
  if (highRiskFails.length > 0) {
    reasons.push(
      `${highRiskFails.length} high-risk case(s) failed: ${highRiskFails.map((c) => c.id).join(", ")}`,
    );
  }
  const { precision } = computePrecisionRecall(cases, field);
  if (precision < 0.85) {
    reasons.push(`Pass rate ${(precision * 100).toFixed(0)}% below 85% gate.`);
  }
  return { allowed: reasons.length === 0, reasons };
}
