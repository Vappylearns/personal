import { useMemo, useState } from "react";
import { models, type CapabilityBand, type ModelProfile } from "../../config/pricing";
import { money, num } from "../../lib/format";
import {
  latencyNeedOptions,
  qualityNeedOptions,
  recommendModel,
  selectedAssessment,
  type LatencyNeed,
  type ModelWorkload,
} from "../../lib/modelDecision";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  workload: ModelWorkload;
  modelId: string;
};

const scenarios: Scenario[] = [
  {
    id: "support",
    title: "Support classification",
    blurb: "Short tickets, high volume, someone is waiting.",
    modelId: "haiku",
    workload: { requestsPerDay: 20000, daysPerMonth: 30, instructions: 600, tools: 250, history: 150, retrieved: 400, reservedOutput: 80, latencyNeed: "interactive", qualityNeed: "routine" },
  },
  {
    id: "contract",
    title: "Contract extraction",
    blurb: "A few pages in, structured fields out, accuracy matters more than chat speed.",
    modelId: "sonnet",
    workload: { requestsPerDay: 500, daysPerMonth: 30, instructions: 900, tools: 700, history: 0, retrieved: 8000, reservedOutput: 900, latencyNeed: "relaxed", qualityNeed: "careful" },
  },
  {
    id: "synthesis",
    title: "Multi-document synthesis",
    blurb: "A large packet, a long answer, and a high cost if the brief is wrong.",
    modelId: "opus",
    workload: { requestsPerDay: 40, daysPerMonth: 30, instructions: 1200, tools: 200, history: 800, retrieved: 80000, reservedOutput: 3500, latencyNeed: "relaxed", qualityNeed: "deep" },
  },
];

export function ModelLab() {
  const { state, setArtifact, setLabSettings } = useLearning();
  const saved = state.labSettings["model-decision"] as Scenario | undefined;
  const [scenarioId, setScenarioId] = useState(saved?.id ?? scenarios[0].id);
  const base = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const [workload, setWorkload] = useState<ModelWorkload>(saved?.workload ?? base.workload);
  const [modelId, setModelId] = useState(saved?.modelId ?? base.modelId);

  function load(id: string) {
    const next = scenarios.find((item) => item.id === id) ?? scenarios[0];
    setScenarioId(next.id);
    setWorkload(next.workload);
    setModelId(next.modelId);
  }

  const result = useMemo(() => recommendModel(workload), [workload]);
  const selected = selectedAssessment(modelId, workload);
  const input = workload.instructions + workload.tools + workload.history + workload.retrieved;
  const total = input + workload.reservedOutput;
  const maxWindow = Math.max(...models.map((model) => model.contextWindowTokens));

  function saveEvidence() {
    const model = models.find((item) => item.id === modelId);
    const text = [
      `Scenario: ${base.title}.`,
      `I would start with ${model?.label ?? modelId} (${model?.apiId ?? "unknown id"}), knowing list-price math is about ${selected ? money(selected.monthlyUsd) : "n/a"} per ${workload.daysPerMonth} days at ${workload.requestsPerDay} requests/day.`,
      `Context budget: instructions ${workload.instructions}, tools ${workload.tools}, history ${workload.history}, retrieved ${workload.retrieved}, reserved output ${workload.reservedOutput}.`,
      selected?.checks.map((check) => `${check.ok ? "Pass" : "Check"}: ${check.message}`).join(" ") ?? "",
      `Before production I would evaluate held-out quality and measure latency on real traffic. Editorial fit bands are assumptions, not benchmarks. Checked prices are list prices as of the source registry.`,
      result.recommended ? `Lowest-cost fit under these preferences: ${result.recommended.model.label}. ${result.reasons.join(" ")}` : result.reasons.join(" "),
    ].join("\n");
    setArtifact("day1-recommendation", text);
    setLabSettings("model-decision", { id: scenarioId, title: base.title, blurb: base.blurb, workload, modelId });
  }

  return (
    <div className="card">
      <div className="row">
        <h3>Model decision simulator</h3>
        <SimLabel />
      </div>
      <p>Quality bands and any sense of “fast enough” beyond the documented comparative labels are assumptions. Prices come from the editable config.</p>
      <div className="row" role="group" aria-label="Scenarios">
        {scenarios.map((item) => (
          <button key={item.id} type="button" className="btn-ghost" aria-pressed={item.id === scenarioId} onClick={() => load(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      <p>{base.blurb}</p>
      <div className="grid-2">
        <label className="field">Model profile
          <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.label}</option>
            ))}
          </select>
        </label>
        <NumberField label="Requests per day" value={workload.requestsPerDay} onChange={(value) => setWorkload({ ...workload, requestsPerDay: value })} />
        <NumberField label="Instruction tokens" value={workload.instructions} onChange={(value) => setWorkload({ ...workload, instructions: value })} />
        <NumberField label="Tool tokens" value={workload.tools} onChange={(value) => setWorkload({ ...workload, tools: value })} />
        <NumberField label="History tokens" value={workload.history} onChange={(value) => setWorkload({ ...workload, history: value })} />
        <NumberField label="Retrieved tokens" value={workload.retrieved} onChange={(value) => setWorkload({ ...workload, retrieved: value })} />
        <NumberField label="Reserved output tokens" value={workload.reservedOutput} onChange={(value) => setWorkload({ ...workload, reservedOutput: value })} />
        <label className="field">Latency need
          <select value={workload.latencyNeed} onChange={(event) => setWorkload({ ...workload, latencyNeed: event.target.value as LatencyNeed })}>
            {latencyNeedOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">Quality threshold
          <select value={workload.qualityNeed} onChange={(event) => setWorkload({ ...workload, qualityNeed: event.target.value as CapabilityBand })}>
            {qualityNeedOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <h4>Context budget</h4>
      <div className="budget" aria-hidden="true">
        <Budget label="Instructions" value={workload.instructions} total={total} max={maxWindow} />
        <Budget label="Tools" value={workload.tools} total={total} max={maxWindow} />
        <Budget label="History" value={workload.history} total={total} max={maxWindow} />
        <Budget label="Retrieved" value={workload.retrieved} total={total} max={maxWindow} />
        <Budget label="Reserved output" value={workload.reservedOutput} total={total} max={maxWindow} />
      </div>
      <p>Input {num(input)} + reserved output {num(workload.reservedOutput)} = {num(total)} tokens in this request. The longest window in the config is {num(maxWindow)}.</p>
      {selected ? <AssessmentView title="Selected profile" assessmentLabel={selected.model} checks={selected.checks} usd={selected.monthlyUsd} /> : null}
      <h4>Recommendation</h4>
      {result.reasons.map((reason) => <p key={reason}>{reason}</p>)}
      <div className="table-wrap">
        <table>
          <caption className="sr">Model checks for this workload</caption>
          <thead><tr><th>Model</th><th>List cost / period</th><th>Hard fit</th><th>Preference fit</th></tr></thead>
          <tbody>
            {result.assessments.map((item) => (
              <tr key={item.model.id}>
                <td>{item.model.label}<br /><span className="fine">{item.model.apiId}</span></td>
                <td>{money(item.monthlyUsd)}</td>
                <td>{item.hardFail ? "Violates a limit" : "Fits the window"}</td>
                <td>{item.fitFail ? "Misses a preference" : "Meets preferences"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fine">Latency uses documented comparative labels only. The quality column uses the editorial bands in pricing config, not a vendor benchmark.</p>
      <div className="row">
        <button type="button" className="btn" onClick={saveEvidence}>Save recommendation to my evidence</button>
        <button type="button" className="btn-ghost" onClick={() => load(scenarioId)}>Reset scenario</button>
      </div>
    </div>
  );
}

function AssessmentView({ title, assessmentLabel, checks, usd }: { title: string; assessmentLabel: ModelProfile; checks: { id: string; ok: boolean; message: string }[]; usd: number }) {
  return (
    <div>
      <h4>{title}: {assessmentLabel.label}</h4>
      <p>About {money(usd)} at list price for this volume. {assessmentLabel.retirementNote}</p>
      <ul>
        {checks.map((check) => (
          <li key={check.id}>{check.ok ? "OK" : "Violation"} — {check.message}</li>
        ))}
      </ul>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="field">{label}
      <input type="number" min={0} value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Budget({ label, value, total, max }: { label: string; value: number; total: number; max: number }) {
  const width = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar"><span style={{ width: `${width}%` }} /></div>
      <span>{Math.round((value / Math.max(total, 1)) * 100)}%</span>
    </div>
  );
}
