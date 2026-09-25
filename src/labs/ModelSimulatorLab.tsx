import { useMemo, useState } from "react";
import { MODEL_PRICES } from "../config/pricing";
import { SimBadge } from "../components/SimBadge";

interface Scenario {
  id: string;
  title: string;
  description: string;
  minLatency: number;
  minQuality: number;
  maxMonthlyUsd: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "support",
    title: "Real-time support copilot",
    description: "Agents need sub-second feel; quality bar is moderate.",
    minLatency: 7,
    minQuality: 6,
    maxMonthlyUsd: 4_500,
  },
  {
    id: "legal",
    title: "Contract clause review",
    description: "Accuracy matters more than speed; legal reviewers in the loop.",
    minLatency: 5,
    minQuality: 8,
    maxMonthlyUsd: 12_000,
  },
  {
    id: "batch",
    title: "Nightly ticket summarization",
    description: "Large volume overnight batch; optimize unit cost.",
    minLatency: 4,
    minQuality: 6,
    maxMonthlyUsd: 2_000,
  },
];

export function ModelSimulatorLab() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [modelId, setModelId] = useState(MODEL_PRICES[1].apiId);
  const [volume, setVolume] = useState(12_000);
  const [latencyWeight, setLatencyWeight] = useState(7);
  const [qualityWeight, setQualityWeight] = useState(7);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const model = MODEL_PRICES.find((m) => m.apiId === modelId) ?? MODEL_PRICES[0];

  const estimate = useMemo(() => {
    const requestsPerDay = volume;
    const daysPerMonth = 30;
    const inputTokens = 1_800 + latencyWeight * 40;
    const outputTokens = 320 + qualityWeight * 25;
    const monthlyRequests = requestsPerDay * daysPerMonth;
    const perRequest =
      (inputTokens * model.inputPerMtok + outputTokens * model.outputPerMtok) /
      1_000_000;
    const monthlyCost = monthlyRequests * perRequest;
    const effectiveLatency = (model.latencyScore + latencyWeight) / 2;
    const effectiveQuality = (model.qualityScore + qualityWeight) / 2;

    const violations: string[] = [];
    if (effectiveLatency < scenario.minLatency) {
      violations.push(
        `Latency score ${effectiveLatency.toFixed(1)} below scenario minimum ${scenario.minLatency}.`,
      );
    }
    if (effectiveQuality < scenario.minQuality) {
      violations.push(
        `Quality score ${effectiveQuality.toFixed(1)} below scenario minimum ${scenario.minQuality}.`,
      );
    }
    if (monthlyCost > scenario.maxMonthlyUsd) {
      violations.push(
        `Estimated monthly cost $${monthlyCost.toFixed(0)} exceeds budget $${scenario.maxMonthlyUsd}.`,
      );
    }
    if (inputTokens + outputTokens > model.contextTokens * 0.02) {
      violations.push("Context budget stress — consider trimming history or retrieval.");
    }

    return {
      monthlyCost,
      effectiveLatency,
      effectiveQuality,
      inputTokens,
      outputTokens,
      violations,
    };
  }, [volume, latencyWeight, qualityWeight, model, scenario]);

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Model routing simulator</h2>
        <SimBadge />
      </header>

      <div role="tablist" aria-label="Scenarios" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === scenarioId}
            className={s.id === scenarioId ? "btn btn-primary" : "btn"}
            onClick={() => setScenarioId(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <p>{scenario.description}</p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label>
          Model
          <select
            className="card"
            style={{ width: "100%", marginTop: "0.25rem" }}
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
          >
            {MODEL_PRICES.map((m) => (
              <option key={m.apiId} value={m.apiId}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Daily request volume: {volume.toLocaleString()}
          <input
            type="range"
            min={500}
            max={50_000}
            step={500}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-valuemin={500}
            aria-valuemax={50_000}
            aria-valuenow={volume}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Latency priority: {latencyWeight}
          <input
            type="range"
            min={1}
            max={10}
            value={latencyWeight}
            onChange={(e) => setLatencyWeight(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Quality priority: {qualityWeight}
          <input
            type="range"
            min={1}
            max={10}
            value={qualityWeight}
            onChange={(e) => setQualityWeight(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <section aria-live="polite" style={{ marginTop: "1.5rem" }}>
        <h3>Estimated monthly cost</h3>
        <p>
          <strong>${estimate.monthlyCost.toFixed(2)}</strong> (illustrative; ~{estimate.inputTokens} in /{" "}
          {estimate.outputTokens} out tokens per request)
        </p>
        <p>
          Effective latency: {estimate.effectiveLatency.toFixed(1)} · Effective quality:{" "}
          {estimate.effectiveQuality.toFixed(1)}
        </p>

        <h3>Policy violations</h3>
        {estimate.violations.length === 0 ? (
          <p role="status">No violations for this scenario configuration.</p>
        ) : (
          <ul>
            {estimate.violations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
