import { useMemo, useState } from "react";
import { SimBadge } from "../components/SimBadge";

type ScenarioId =
  | "success"
  | "missing"
  | "unauthorized"
  | "invalid-args"
  | "timeout"
  | "rate-limit";

interface WalkStep {
  id: string;
  title: string;
  layer: "model" | "application" | "backend";
  payload: unknown;
  highlight?: boolean;
  note?: string;
}

const SCENARIO_LABELS: Record<ScenarioId, string> = {
  success: "Success",
  missing: "Order not found",
  unauthorized: "Unauthorized caller",
  "invalid-args": "Invalid arguments",
  timeout: "Upstream timeout",
  "rate-limit": "Rate limited",
};

function buildSteps(scenario: ScenarioId): WalkStep[] {
  const modelProposal = {
    type: "tool_use",
    name: "get_order_status",
    input: { order_id: scenario === "invalid-args" ? "NOT-A-NUMBER" : "ORD-44219" },
  };

  const steps: WalkStep[] = [
    {
      id: "s1",
      title: "Model proposes tool call",
      layer: "model",
      payload: modelProposal,
    },
    {
      id: "s2",
      title: "Application validates schema & business rules",
      layer: "application",
      payload: {
        validator: "zod + domain rules",
        checks: ["order_id format", "tenant scope", "PII redaction"],
        result:
          scenario === "invalid-args"
            ? { ok: false, error: "order_id must match ORD-[0-9]+" }
            : { ok: true },
      },
      highlight: scenario === "invalid-args",
      note:
        scenario === "invalid-args"
          ? "Validation stops execution — model JSON is not trusted."
          : undefined,
    },
    {
      id: "s3",
      title: "Authorization",
      layer: "application",
      payload: {
        principal: scenario === "unauthorized" ? "contractor@guest" : "agent@support",
        requiredScope: "orders:read",
        allowed: scenario !== "unauthorized",
      },
      highlight: scenario === "unauthorized",
    },
  ];

  if (scenario === "invalid-args" || scenario === "unauthorized") {
    steps.push({
      id: "s4",
      title: "Safe response to user",
      layer: "application",
      payload: {
        userMessage:
          scenario === "unauthorized"
            ? "You do not have access to this order."
            : "I need a valid order ID like ORD-44219.",
        logged: true,
      },
    });
    return steps;
  }

  steps.push({
    id: "s4",
    title: "Backend service call",
    layer: "backend",
    payload: {
      method: "GET",
      path: "/internal/orders/ORD-44219",
      timeoutMs: 2500,
    },
  });

  if (scenario === "timeout") {
    steps.push({
      id: "s5",
      title: "Timeout handling",
      layer: "application",
      payload: { error: "upstream_timeout", retryable: true, circuitBreaker: "open" },
      highlight: true,
    });
  } else if (scenario === "rate-limit") {
    steps.push({
      id: "s5",
      title: "Rate limit response",
      layer: "backend",
      payload: { status: 429, retryAfterSec: 30 },
      highlight: true,
    });
    steps.push({
      id: "s6",
      title: "Application backoff",
      layer: "application",
      payload: { action: "queue_retry", userMessage: "Status lookup is busy — try again shortly." },
    });
  } else if (scenario === "missing") {
    steps.push({
      id: "s5",
      title: "Order service response",
      layer: "backend",
      payload: { status: 404, body: { error: "order_not_found" } },
    });
    steps.push({
      id: "s6",
      title: "Mapped user outcome",
      layer: "application",
      payload: {
        userMessage: "No order found with that ID. Verify the number with the customer.",
      },
    });
  } else {
    steps.push({
      id: "s5",
      title: "Order service response",
      layer: "backend",
      payload: {
        status: 200,
        body: { order_id: "ORD-44219", status: "shipped", eta: "2026-03-28" },
      },
    });
    steps.push({
      id: "s6",
      title: "Application composes answer",
      layer: "application",
      payload: {
        userMessage: "Order ORD-44219 is shipped; estimated delivery 28 Mar 2026.",
        citation: "orders-api v2",
      },
    });
  }

  return steps;
}

export function ToolWalkthroughLab() {
  const [scenario, setScenario] = useState<ScenarioId>("success");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => buildSteps(scenario), [scenario]);

  const current = steps[stepIndex] ?? steps[0];

  function selectScenario(id: ScenarioId) {
    setScenario(id);
    setStepIndex(0);
  }

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Order status tool walkthrough</h2>
        <SimBadge />
      </header>

      <fieldset style={{ border: 0, padding: 0 }}>
        <legend>Scenario</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {(Object.keys(SCENARIO_LABELS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={scenario === id ? "btn btn-primary" : "btn"}
              onClick={() => selectScenario(id)}
            >
              {SCENARIO_LABELS[id]}
            </button>
          ))}
        </div>
      </fieldset>

      <p style={{ marginTop: "1rem" }}>
        Step {stepIndex + 1} of {steps.length}: <strong>{current.title}</strong> ({current.layer} layer)
      </p>

      <pre
        className="card"
        style={{
          overflow: "auto",
          background: current.highlight ? "#fff7ed" : "var(--color-bg)",
          borderColor: current.highlight ? "#fed7aa" : undefined,
        }}
        aria-label="Step JSON payload"
      >
        {JSON.stringify(current.payload, null, 2)}
      </pre>
      {current.note && <p role="status"><strong>Application layer:</strong> {current.note}</p>}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          type="button"
          className="btn"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={stepIndex >= steps.length - 1}
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
