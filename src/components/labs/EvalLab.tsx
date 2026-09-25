import { useMemo, useState } from "react";
import { evalCases, judgeNote } from "../../content/evalCases";
import { metricsFor, releaseGate } from "../../lib/evals";
import { pct } from "../../lib/format";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

export function EvalLab() {
  const { setArtifact } = useLearning();
  const [risk, setRisk] = useState<"all" | "high" | "standard">("all");
  const [onlyMisses, setOnlyMisses] = useState(false);
  const [variant, setVariant] = useState<"baseline" | "candidate">("candidate");
  const baseline = useMemo(() => metricsFor(evalCases, "baseline", "Variant A"), []);
  const candidate = useMemo(() => metricsFor(evalCases, "candidate", "Variant B"), []);
  const gate = releaseGate(baseline, candidate);
  const visible = evalCases.filter((item) => (risk === "all" || item.risk === risk) && (!onlyMisses || item.variants[variant].prediction !== item.expected));

  function save() {
    setArtifact("day6-release", [
      "Simulation — illustrative data. Metrics are counted from 12 synthetic cases.",
      `Variant A accuracy ${pct(baseline.accuracy * 100)} with high-risk misses: ${baseline.highRiskMisses.join(", ") || "none"}.`,
      `Variant B accuracy ${pct(candidate.accuracy * 100)} with high-risk misses: ${candidate.highRiskMisses.join(", ") || "none"}.`,
      `Escalate precision A ${fmt(baseline.precision)} recall ${fmt(baseline.recall)}. B precision ${fmt(candidate.precision)} recall ${fmt(candidate.recall)}.`,
      `Release gate: ${gate.pass ? "pass" : "fail"}. ${gate.reasons.join(" ")}`,
      "I would not ship Variant B while C06 answers another customer’s invoice. A higher average does not waive that case.",
      `Judge note on ${judgeNote.caseId}: ${judgeNote.explanation}`,
    ].join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>Evaluation workbench</h3><SimLabel /></div>
      <div className="metric-row">
        <Metric title="Variant A accuracy" value={pct(baseline.accuracy * 100)} detail={`Exact ${baseline.exactMatches}/${baseline.cases}`} />
        <Metric title="Variant B accuracy" value={pct(candidate.accuracy * 100)} detail={`Exact ${candidate.exactMatches}/${candidate.cases}`} />
        <Metric title="Gate" value={gate.pass ? "Pass" : "Fail"} detail={gate.reasons[0]} />
      </div>
      <div className="grid-2">
        <Ratio title="Variant A escalate" precision={baseline.precision} recall={baseline.recall} counts={baseline.escalate} ungrounded={baseline.ungroundedAnswers} />
        <Ratio title="Variant B escalate" precision={candidate.precision} recall={candidate.recall} counts={candidate.escalate} ungrounded={candidate.ungroundedAnswers} />
      </div>
      <ul>{gate.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      <div className="callout concept">
        <strong>Judge disagreement on {judgeNote.caseId}. </strong>
        {judgeNote.judgeA} {judgeNote.judgeB} {judgeNote.explanation}
      </div>
      <div className="row">
        <label>Show
          <select value={variant} onChange={(event) => setVariant(event.target.value as "baseline" | "candidate")}>
            <option value="candidate">Variant B predictions</option>
            <option value="baseline">Variant A predictions</option>
          </select>
        </label>
        <label>Risk
          <select value={risk} onChange={(event) => setRisk(event.target.value as typeof risk)}>
            <option value="all">All cases</option>
            <option value="high">High risk</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <label><input type="checkbox" checked={onlyMisses} onChange={(event) => setOnlyMisses(event.target.checked)} /> Failures only</label>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr">Synthetic evaluation cases</caption>
          <thead><tr><th>Case</th><th>Risk</th><th>Expected</th><th>Predicted</th><th>Grounded</th></tr></thead>
          <tbody>
            {visible.map((item) => {
              const predicted = item.variants[variant];
              const miss = predicted.prediction !== item.expected;
              return (
                <tr key={item.id}>
                  <td>{item.id} {item.title}<br /><span className="fine">{item.note}</span></td>
                  <td>{item.risk}</td>
                  <td>{item.expected}</td>
                  <td>{miss ? "Miss: " : "Match: "}{predicted.prediction}</td>
                  <td>{predicted.grounded ? "Marked grounded" : "Not grounded"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn" onClick={save}>Save release recommendation</button>
    </div>
  );
}

function fmt(value: number | null): string {
  return value === null ? "not defined" : pct(value * 100);
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="metric"><span>{title}</span><strong>{value}</strong><div className="fine">{detail}</div></div>;
}

function Ratio({ title, precision, recall, counts, ungrounded }: { title: string; precision: number | null; recall: number | null; counts: { tp: number; fp: number; tn: number; fn: number }; ungrounded: number }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p>Precision {fmt(precision)}. Recall {fmt(recall)}. TP {counts.tp}, FP {counts.fp}, FN {counts.fn}, TN {counts.tn}. Ungrounded answers: {ungrounded}.</p>
    </div>
  );
}
