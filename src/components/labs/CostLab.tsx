import { useMemo, useState } from "react";
import { CACHE_AND_BATCH_STACK, models } from "../../config/pricing";
import { calculateCost, type CostInput } from "../../lib/cost";
import { money, num, pct } from "../../lib/format";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

const handbook: CostInput = {
  requestsPerDay: 10000,
  daysPerMonth: 30,
  staticInputTokens: 20000,
  dynamicInputTokens: 800,
  outputTokens: 400,
  inputUsdPerMillion: 2,
  outputUsdPerMillion: 10,
  cacheWriteMultiplier: 1.25,
  cacheReadMultiplier: 0.1,
  batchMultiplier: 0.5,
  minCacheTokens: 1024,
  cacheEnabled: true,
  batchEnabled: false,
  cacheTtlMinutes: 5,
  operatingMinutesPerDay: 480,
  successRate: 0.9,
  stackCacheAndBatch: CACHE_AND_BATCH_STACK,
};

export function CostLab() {
  const { setArtifact } = useLearning();
  const [input, setInput] = useState<CostInput>(handbook);
  const result = useMemo(() => calculateCost(input), [input]);

  function patch(partial: Partial<CostInput>) {
    setInput((current) => ({ ...current, ...partial }));
  }

  function applyModel(id: string) {
    const model = models.find((item) => item.id === id);
    if (!model) return;
    patch({
      inputUsdPerMillion: model.inputUsdPerMillion,
      outputUsdPerMillion: model.outputUsdPerMillion,
      cacheReadMultiplier: model.cacheReadMultiplier,
      cacheWriteMultiplier: input.cacheTtlMinutes === 60 ? model.cacheWrite1hMultiplier : model.cacheWrite5mMultiplier,
      batchMultiplier: model.batchMultiplier,
      minCacheTokens: model.minCacheTokens,
    });
  }

  function saveEvidence() {
    if (!result.ok) return;
    const lines = result.scenarios
      .filter((scenario) => scenario.bill)
      .map((scenario) => `${scenario.label}: ${money(scenario.bill!.usd)}. Uncached ${num(scenario.bill!.uncachedTokensPerRequest, 1)}, write ${num(scenario.bill!.cacheWriteTokensPerRequest, 1)}, read ${num(scenario.bill!.cacheReadTokensPerRequest, 1)}.`);
    setArtifact("day3-cost-note", [
      "Simulation — illustrative data. Prices start from the config and can be edited.",
      ...lines,
      `Baseline ${money(result.baselineUsd)}. Best compared design ${money(result.comparedUsd)}. Savings ${money(result.savingsUsd)} (${pct(result.savingsPercent)}).`,
      `Cost per successful task: ${money(result.costPerSuccessUsd)}.`,
      "To validate, measure cache write tokens, cache read tokens, expiry, and completed documents in production usage. A negative saving means caching cost more under these assumptions.",
      ...result.assumptions,
    ].join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>Transparent cost calculator</h3><SimLabel /></div>
      <div className="row">
        <button type="button" className="btn" onClick={() => setInput(handbook)}>Load 10,000 documents and a 20,000-token handbook</button>
        <button type="button" className="btn-ghost" onClick={() => setInput(handbook)}>Reset</button>
        {models.map((model) => (
          <button key={model.id} type="button" className="btn-ghost" onClick={() => applyModel(model.id)}>{model.label} prices</button>
        ))}
      </div>
      <div className="grid-3">
        <Num label="Requests per day" value={input.requestsPerDay} onChange={(value) => patch({ requestsPerDay: value })} />
        <Num label="Days in period" value={input.daysPerMonth} onChange={(value) => patch({ daysPerMonth: value })} />
        <Num label="Static input tokens" value={input.staticInputTokens} onChange={(value) => patch({ staticInputTokens: value })} />
        <Num label="Dynamic input tokens" value={input.dynamicInputTokens} onChange={(value) => patch({ dynamicInputTokens: value })} />
        <Num label="Output tokens" value={input.outputTokens} onChange={(value) => patch({ outputTokens: value })} />
        <Num label="Input $ / million" value={input.inputUsdPerMillion} step="0.01" onChange={(value) => patch({ inputUsdPerMillion: value })} />
        <Num label="Output $ / million" value={input.outputUsdPerMillion} step="0.01" onChange={(value) => patch({ outputUsdPerMillion: value })} />
        <Num label="Success rate (0 to 1)" value={input.successRate} step="0.01" onChange={(value) => patch({ successRate: value })} />
        <Num label="Cache write multiplier" value={input.cacheWriteMultiplier} step="0.01" onChange={(value) => patch({ cacheWriteMultiplier: value })} />
        <Num label="Cache read multiplier" value={input.cacheReadMultiplier} step="0.001" onChange={(value) => patch({ cacheReadMultiplier: value })} />
        <Num label="Batch multiplier" value={input.batchMultiplier} step="0.01" onChange={(value) => patch({ batchMultiplier: value })} />
        <Num label="Minimum cache tokens" value={input.minCacheTokens} onChange={(value) => patch({ minCacheTokens: value })} />
        <Num label="Operating minutes per day" value={input.operatingMinutesPerDay} onChange={(value) => patch({ operatingMinutesPerDay: value })} />
        <label className="field">Cache TTL
          <select value={input.cacheTtlMinutes} onChange={(event) => {
            const cacheTtlMinutes = Number(event.target.value);
            const model = models.find((item) => item.inputUsdPerMillion === input.inputUsdPerMillion && item.cacheReadMultiplier === input.cacheReadMultiplier);
            patch({
              cacheTtlMinutes,
              cacheWriteMultiplier: model ? (cacheTtlMinutes === 60 ? model.cacheWrite1hMultiplier : model.cacheWrite5mMultiplier) : input.cacheWriteMultiplier,
            });
          }}>
            <option value={5}>5 minutes (documented)</option>
            <option value={60}>1 hour (documented)</option>
          </select>
        </label>
      </div>
      <div className="row">
        <label><input type="checkbox" checked={input.cacheEnabled} onChange={(event) => patch({ cacheEnabled: event.target.checked })} /> Cache the static prefix</label>
        <label><input type="checkbox" checked={input.batchEnabled} onChange={(event) => patch({ batchEnabled: event.target.checked })} /> Batch discount</label>
      </div>
      {!result.ok ? (
        <div className="callout needs-verification" role="alert">
          {result.errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      ) : (
        <>
          <div className="metric-row">
            <div className="metric"><span>Baseline</span><strong>{money(result.baselineUsd)}</strong></div>
            <div className="metric"><span>Best compared</span><strong>{money(result.comparedUsd)}</strong></div>
            <div className="metric"><span>Savings</span><strong>{money(result.savingsUsd)} ({pct(result.savingsPercent)})</strong></div>
            <div className="metric"><span>Cost per success</span><strong>{money(result.costPerSuccessUsd)}</strong></div>
          </div>
          <p className="fine">Requests in the period: {num(input.requestsPerDay * input.daysPerMonth)}. Cache eligible: {result.cacheEligible ? "yes" : "no"}. Requests per cache window: {result.requestsPerCacheWindow === null ? "n/a" : num(result.requestsPerCacheWindow, 2)}. Successes: {num(result.successes, 1)}.</p>
          {result.scenarios.filter((scenario) => scenario.available && scenario.bill).map((scenario) => {
            const bill = scenario.bill!;
            const tokenSum = bill.uncachedTokensPerRequest + bill.cacheWriteTokensPerRequest + bill.cacheReadTokensPerRequest;
            return (
              <article key={scenario.id} className="card">
                <h4>{scenario.label}</h4>
                <p>{money(bill.usd)}</p>
                <p className="fine">{scenario.note}</p>
                <p>Per request — uncached {num(bill.uncachedTokensPerRequest, 2)}, cache write {num(bill.cacheWriteTokensPerRequest, 2)}, cache read {num(bill.cacheReadTokensPerRequest, 2)}, output {num(bill.outputTokensPerRequest, 2)}. Input categories sum to {num(tokenSum, 2)}, which should equal static plus dynamic ({num(input.staticInputTokens + input.dynamicInputTokens, 2)}).</p>
              </article>
            );
          })}
          <h4>Assumptions</h4>
          <ul>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
          <button type="button" className="btn" onClick={saveEvidence}>Save comparison to my evidence</button>
        </>
      )}
    </div>
  );
}

function Num({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) {
  return (
    <label className="field">{label}
      <input type="number" step={step} value={Number.isFinite(value) ? value : ""} onChange={(event) => onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))} />
    </label>
  );
}
