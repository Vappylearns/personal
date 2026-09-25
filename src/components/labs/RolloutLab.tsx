import { useMemo, useState } from "react";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

type Workflow = { id: string; department: string; name: string; owner: string };

const starter: Workflow[] = [
  { id: "bids", department: "Delivery", name: "First-draft bid responses", owner: "" },
  { id: "support", department: "Support", name: "Ticket classification", owner: "Support operations lead" },
];

const departments = ["Delivery", "Support", "HR", "Finance", "Legal", "Sales"];

export function RolloutLab() {
  const { state, setArtifact } = useLearning();
  const [workflows, setWorkflows] = useState<Workflow[]>(starter);
  const [sponsor, setSponsor] = useState("");
  const [security, setSecurity] = useState(false);
  const [baseline, setBaseline] = useState(false);
  const [training, setTraining] = useState(true);
  const [measures, setMeasures] = useState({ seats: true, workflows: true, quality: false, value: false });
  const [plan, setPlan] = useState(state.artifacts["day4-rollout"] ?? "");

  const gaps = useMemo(() => {
    const items: string[] = [];
    if (!sponsor.trim()) items.push("Missing executive sponsorship.");
    if (!security) items.push("Security review is unresolved.");
    if (!baseline) items.push("No baseline measure is recorded.");
    if (training && workflows.some((item) => !item.owner.trim())) items.push("Training is on while at least one workflow has no owner.");
    if (!measures.quality || !measures.value) items.push("Success measures do not yet include both quality and realized value.");
    return items;
  }, [sponsor, security, baseline, training, workflows, measures]);

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= workflows.length) return;
    const copy = workflows.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setWorkflows(copy);
  }

  function generate() {
    const lines = [
      "Simulation — illustrative data. Narmada Systems is fictional: 5,000 knowledge workers, Indian IT services.",
      `Sponsor: ${sponsor.trim() || "NOT NAMED"}.`,
      `Security review: ${security ? "closed for the named workflows" : "open"}.`,
      `Baseline: ${baseline ? "recorded" : "absent — do not publish a savings guarantee"}.`,
      "",
      "Day 30 — access and a pilot",
      ...workflows.map((item, index) => `${index + 1}. ${item.department}: ${item.name}. Owner: ${item.owner.trim() || "MISSING"}.`),
      "Gate: only workflows with an owner and a closed security review proceed.",
      "",
      "Day 60 — the workflow completes",
      "Champions coach the pilot team. Reviewers score a weekly sample. Training expands only where an owner exists.",
      "",
      "Day 90 — decide",
      "Expand, repair, or stop. Seat activity is reach. Completed workflows show the path ran. Quality is acceptance. Realized value needs the baseline. Any hours-saved figure is an estimate, not guaranteed financial savings.",
      "",
      `Measures selected: seats ${measures.seats}, completed workflows ${measures.workflows}, quality ${measures.quality}, value ${measures.value}.`,
      gaps.length ? `Open gaps: ${gaps.join(" ")}` : "No structural gaps under these switches.",
    ];
    setPlan(lines.join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>30/60/90 rollout builder</h3><SimLabel /></div>
      <p>Narmada Systems is a fictional 5,000-person IT services company. Move workflows with the buttons. There is no drag-and-drop-only path.</p>
      <label className="field">Executive sponsor
        <input value={sponsor} onChange={(event) => setSponsor(event.target.value)} placeholder="Name a person, not a brand" />
      </label>
      <div className="row">
        <label><input type="checkbox" checked={security} onChange={(event) => setSecurity(event.target.checked)} /> Security review closed</label>
        <label><input type="checkbox" checked={baseline} onChange={(event) => setBaseline(event.target.checked)} /> Baseline recorded</label>
        <label><input type="checkbox" checked={training} onChange={(event) => setTraining(event.target.checked)} /> Training scheduled</label>
      </div>
      <fieldset>
        <legend>Success measures</legend>
        {(Object.keys(measures) as (keyof typeof measures)[]).map((key) => (
          <label key={key} style={{ marginRight: "0.8rem" }}>
            <input type="checkbox" checked={measures[key]} onChange={(event) => setMeasures({ ...measures, [key]: event.target.checked })} /> {key}
          </label>
        ))}
      </fieldset>
      <ul>
        {workflows.map((item, index) => (
          <li key={item.id} className="card">
            <div className="grid-3">
              <label className="field">Department
                <select value={item.department} onChange={(event) => setWorkflows(workflows.map((row) => row.id === item.id ? { ...row, department: event.target.value } : row))}>
                  {departments.map((department) => <option key={department}>{department}</option>)}
                </select>
              </label>
              <label className="field">Workflow
                <input value={item.name} onChange={(event) => setWorkflows(workflows.map((row) => row.id === item.id ? { ...row, name: event.target.value } : row))} />
              </label>
              <label className="field">Owner
                <input value={item.owner} onChange={(event) => setWorkflows(workflows.map((row) => row.id === item.id ? { ...row, owner: event.target.value } : row))} />
              </label>
            </div>
            <div className="row">
              <button type="button" className="btn-ghost" onClick={() => move(index, -1)} disabled={index === 0}>Move earlier</button>
              <button type="button" className="btn-ghost" onClick={() => move(index, 1)} disabled={index === workflows.length - 1}>Move later</button>
              <button type="button" className="btn-ghost" onClick={() => setWorkflows(workflows.filter((row) => row.id !== item.id))}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-ghost" onClick={() => setWorkflows([...workflows, { id: `w-${Date.now()}`, department: "Delivery", name: "New workflow", owner: "" }])}>Add workflow</button>
      {gaps.length ? (
        <div className="callout needs-verification" role="status">
          <strong>Plan gaps. </strong>
          <ul>{gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
        </div>
      ) : <p className="callout verified">The switches you set cover sponsor, security, baseline, owners, and the four metric layers.</p>}
      <div className="row">
        <button type="button" className="btn" onClick={generate}>Generate editable plan</button>
        <button type="button" className="btn-ghost" onClick={() => { setWorkflows(starter); setSponsor(""); setSecurity(false); setBaseline(false); setTraining(true); setMeasures({ seats: true, workflows: true, quality: false, value: false }); setPlan(""); }}>Reset</button>
      </div>
      <label className="field">Rollout plan
        <textarea className="notes-box" rows={12} value={plan} onChange={(event) => setPlan(event.target.value)} />
      </label>
      <button type="button" className="btn" onClick={() => setArtifact("day4-rollout", plan)}>Save plan to my evidence</button>
    </div>
  );
}
