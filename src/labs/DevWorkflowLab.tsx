import { useState } from "react";
import { SimBadge } from "../components/SimBadge";

interface WorkflowStep {
  id: string;
  title: string;
  body: string;
  code?: string;
  testOutput?: string;
  failing?: boolean;
}

const STEPS: WorkflowStep[] = [
  {
    id: "1",
    title: "Read legacy ticket router",
    body: "Identify where string-matching routes tickets instead of structured intents.",
    code: `function routeTicket(subject: string) {
  if (subject.includes("refund")) return "billing";
  if (subject.includes("password")) return "iam";
  return "general";
}`,
  },
  {
    id: "2",
    title: "Add characterization test",
    body: "Capture current behavior before refactor — tests run in CI only (no shell in this lab).",
    code: `test("routes password resets", () => {
  expect(routeTicket("reset password")).toBe("iam");
});`,
    testOutput: "PASS — baseline captured",
  },
  {
    id: "3",
    title: "Introduce intent classifier hook",
    body: "Swap inline strings for a typed intent map while keeping the legacy function signature.",
    code: `const INTENTS = { refund: "billing", password_reset: "iam" } as const;
// TODO: wire classifier output`,
  },
  {
    id: "4",
    title: "Run tests — regression",
    body: "A failing test signals unsafe refactor; fix before merging.",
    code: `test("routes password resets", () => {
  expect(routeTicket("reset password")).toBe("iam");
});`,
    testOutput: `FAIL  expected "iam" received "general"
  at devWorkflow.test.ts:14`,
    failing: true,
  },
  {
    id: "5",
    title: "Fix mapping & re-run (simulated)",
    body: "Restore IAM routing, then add eval cases for ambiguous subjects.",
    code: `if (subject.match(/password|mfa|login/i)) return "iam";`,
    testOutput: "PASS — 12 tests",
  },
  {
    id: "6",
    title: "Ship behind feature flag",
    body: "Gradual rollout with logging of intent disagreements; no production shell access required.",
  },
];

export function DevWorkflowLab() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Claude Code workflow (legacy refactor)</h2>
        <SimBadge />
      </header>

      <p>Step-through a safe refactor. Test output is simulated — no commands are executed in your browser.</p>

      <ol>
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === index ? "btn btn-primary" : "btn"}
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ol>

      <section aria-live="polite" style={{ marginTop: "1rem" }}>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        {step.code && (
          <pre className="card" style={{ overflow: "auto", fontFamily: "monospace" }}>
            {step.code}
          </pre>
        )}
        {step.testOutput && (
          <pre
            role="status"
            className="card"
            style={{
              overflow: "auto",
              background: step.failing ? "#fef2f2" : "var(--color-bg)",
              borderColor: step.failing ? "#fecaca" : undefined,
            }}
          >
            {step.testOutput}
          </pre>
        )}
      </section>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          type="button"
          className="btn"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={index >= STEPS.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
