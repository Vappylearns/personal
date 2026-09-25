import { useMemo, useState } from "react";
import { BATCH_DISCOUNT_FACTOR, MODEL_PRICES } from "../config/pricing";
import { optimizedMonthlyCost, type CostInputs } from "../lib/cost";
import { SimBadge } from "../components/SimBadge";

const HANDBOOK_PRESET: CostInputs = {
  requestsPerDay: 8_000,
  daysPerMonth: 30,
  staticInputTokens: 1_200,
  dynamicInputTokens: 450,
  outputTokens: 380,
  inputRatePerMtok: MODEL_PRICES[1].inputPerMtok,
  outputRatePerMtok: MODEL_PRICES[1].outputPerMtok,
  successRate: 0.92,
  cacheEnabled: true,
  cacheHitRate: 0.72,
  cacheWriteRatePerMtok: MODEL_PRICES[1].cacheWrite5mPerMtok,
  cacheReadRatePerMtok: MODEL_PRICES[1].cacheReadPerMtok,
  batchEnabled: false,
  batchDiscountFactor: BATCH_DISCOUNT_FACTOR,
};

const defaultInputs: CostInputs = { ...HANDBOOK_PRESET };

export function CostCalculatorLab() {
  const [inputs, setInputs] = useState<CostInputs>(defaultInputs);

  const breakdown = useMemo(() => optimizedMonthlyCost(inputs), [inputs]);

  function set<K extends keyof CostInputs>(key: K, value: CostInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function applyHandbook() {
    setInputs({ ...HANDBOOK_PRESET });
  }

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Production cost calculator</h2>
        <SimBadge />
      </header>

      <button type="button" className="btn btn-primary" onClick={applyHandbook}>
        Load handbook example preset
      </button>

      <form
        style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "1rem" }}
        onSubmit={(e) => e.preventDefault()}
      >
        <label>
          Requests / day
          <input
            type="number"
            min={0}
            value={inputs.requestsPerDay}
            onChange={(e) => set("requestsPerDay", Number(e.target.value))}
          />
        </label>
        <label>
          Days / month
          <input
            type="number"
            min={0}
            value={inputs.daysPerMonth}
            onChange={(e) => set("daysPerMonth", Number(e.target.value))}
          />
        </label>
        <label>
          Static input tokens
          <input
            type="number"
            min={0}
            value={inputs.staticInputTokens}
            onChange={(e) => set("staticInputTokens", Number(e.target.value))}
          />
        </label>
        <label>
          Dynamic input tokens
          <input
            type="number"
            min={0}
            value={inputs.dynamicInputTokens}
            onChange={(e) => set("dynamicInputTokens", Number(e.target.value))}
          />
        </label>
        <label>
          Output tokens
          <input
            type="number"
            min={0}
            value={inputs.outputTokens}
            onChange={(e) => set("outputTokens", Number(e.target.value))}
          />
        </label>
        <label>
          Input $ / MTok
          <input
            type="number"
            min={0}
            step={0.01}
            value={inputs.inputRatePerMtok}
            onChange={(e) => set("inputRatePerMtok", Number(e.target.value))}
          />
        </label>
        <label>
          Output $ / MTok
          <input
            type="number"
            min={0}
            step={0.01}
            value={inputs.outputRatePerMtok}
            onChange={(e) => set("outputRatePerMtok", Number(e.target.value))}
          />
        </label>
        <label>
          Success rate (0–1)
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={inputs.successRate}
            onChange={(e) => set("successRate", Number(e.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={inputs.cacheEnabled}
            onChange={(e) => set("cacheEnabled", e.target.checked)}
          />
          Prompt caching enabled
        </label>
        <label>
          Cache hit rate (static share)
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={inputs.cacheHitRate}
            disabled={!inputs.cacheEnabled}
            onChange={(e) => set("cacheHitRate", Number(e.target.value))}
          />
        </label>
        <label>
          Cache write $ / MTok
          <input
            type="number"
            min={0}
            step={0.01}
            value={inputs.cacheWriteRatePerMtok}
            onChange={(e) => set("cacheWriteRatePerMtok", Number(e.target.value))}
          />
        </label>
        <label>
          Cache read $ / MTok
          <input
            type="number"
            min={0}
            step={0.01}
            value={inputs.cacheReadRatePerMtok}
            onChange={(e) => set("cacheReadRatePerMtok", Number(e.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={inputs.batchEnabled}
            onChange={(e) => set("batchEnabled", e.target.checked)}
          />
          Batch API discount
        </label>
      </form>

      <section aria-live="polite" style={{ marginTop: "1.5rem" }}>
        {!breakdown.valid ? (
          <p role="alert">{breakdown.error}</p>
        ) : (
          <>
            <h3>Monthly totals</h3>
            <ul>
              <li>Monthly requests: {breakdown.monthlyRequests.toLocaleString()}</li>
              <li>Baseline (no cache/batch): ${breakdown.baselineMonthlyCost.toFixed(2)}</li>
              <li>
                <strong>Optimized: ${breakdown.optimizedMonthlyCost.toFixed(2)}</strong>
              </li>
              <li>
                Savings: ${breakdown.savingsAbs.toFixed(2)} ({breakdown.savingsPct.toFixed(1)}%)
              </li>
              <li>Cost per successful task: ${breakdown.costPerSuccessfulTask.toFixed(4)}</li>
            </ul>

            <h3>Per-request token buckets</h3>
            <ul>
              <li>Uncached input: {breakdown.tokenCategories.uncachedInput.toFixed(0)}</li>
              <li>Cache write: {breakdown.tokenCategories.cacheWriteInput.toFixed(0)}</li>
              <li>Cache read: {breakdown.tokenCategories.cacheReadInput.toFixed(0)}</li>
              <li>Output: {breakdown.tokenCategories.output.toFixed(0)}</li>
            </ul>

            <h3>Formula notes</h3>
            <ol>
              {breakdown.formulaNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              {breakdown.formulaNotes.length === 0 && <li>All input billed at standard input/output rates.</li>}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
