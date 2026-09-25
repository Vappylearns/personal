export interface PolicyDocument {
  id: string;
  title: string;
  department: string;
  updatedAt: string;
  minRole: "employee" | "manager" | "hr" | "legal";
  body: string;
}

/** Fictional internal policy corpus for RAG lab simulations only. */
export const POLICY_CORPUS: PolicyDocument[] = [
  {
    id: "pol-001",
    title: "Remote work eligibility",
    department: "HR",
    updatedAt: "2025-11-02",
    minRole: "employee",
    body:
      "Employees may work remotely up to three days per week with manager approval. Core collaboration hours are 10:00–16:00 local time.",
  },
  {
    id: "pol-002",
    title: "Expense reimbursement — travel",
    department: "Finance",
    updatedAt: "2025-08-15",
    minRole: "employee",
    body:
      "Domestic travel requires pre-approval for amounts over INR 25,000. Receipts must be submitted within 14 days of return.",
  },
  {
    id: "pol-003",
    title: "Customer data handling",
    department: "Security",
    updatedAt: "2026-01-10",
    minRole: "manager",
    body:
      "Customer PII must not be pasted into external AI tools without an approved DPA and redaction workflow. Violations are escalated to the CISO.",
  },
  {
    id: "pol-004",
    title: "Vendor AI subprocessors",
    department: "Legal",
    updatedAt: "2025-12-01",
    minRole: "legal",
    body:
      "New AI vendors require legal review of subprocessors, data residency, and model training opt-out clauses before production use.",
  },
  {
    id: "pol-005",
    title: "Incident response — severity 1",
    department: "IT",
    updatedAt: "2025-09-20",
    minRole: "manager",
    body:
      "Severity 1 incidents require war-room activation within 15 minutes and executive notification within one hour.",
  },
  {
    id: "pol-006",
    title: "Laptop refresh cycle",
    department: "IT",
    updatedAt: "2024-06-01",
    minRole: "employee",
    body:
      "Standard laptops are refreshed every 36 months. Early refresh requires IT director approval and asset tag verification.",
  },
];
