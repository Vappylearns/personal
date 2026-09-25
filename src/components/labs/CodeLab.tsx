import { useState } from "react";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

const steps = [
  { id: "inspect", title: "Inspect the repository", body: "billing/dates.py splits on ‘/’ only. ISO dates such as 2026-04-01 contain hyphens, so the function never finds three parts." },
  { id: "propose", title: "Proposed change", body: "Accept either hyphens or slashes, require three numeric parts, and return the ISO form. This is a proposal, not a merge." },
  { id: "test", title: "Existing test", body: "The test expects parse_renewal('2026-04-01') to equal '2026-04-01'. Before the fix it fails. The lab shows that failure. It does not run a shell." },
  { id: "fail", title: "Failure investigation", body: "AssertionError: expected 2026-04-01, got the original string because split('/') returned one piece. The failure is explained by the delimiter, not by the model." },
  { id: "fix", title: "Inspectable fix", body: "Split on both delimiters. Reject anything that is not three integers. Return YYYY-MM-DD." },
  { id: "review", title: "Human review", body: "A reviewer asks about 01/04/2026 versus 04/01/2026, empty input, and datetime values. Those cases are not in the test." },
  { id: "merge", title: "Merge readiness", body: "Ready for review is not the same as ready to merge. Merge when a human has read the diff and the tests cover the formats you accept." },
];

const broken = `def parse_renewal(value: str) -> str:
    month, day, year = value.split("/")
    return f"{year}-{month}-{day}"

def test_iso():
    assert parse_renewal("2026-04-01") == "2026-04-01"
# Fails: split('/') does not divide an ISO date.`;

const fixed = `def parse_renewal(value: str) -> str:
    parts = value.replace("-", "/").split("/")
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        raise ValueError("unsupported date")
    year, month, day = parts if "-" in value else (parts[2], parts[0], parts[1])
    return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

def test_iso():
    assert parse_renewal("2026-04-01") == "2026-04-01"
# Passes for this example only.`;

export function CodeLab() {
  const { setArtifact } = useLearning();
  const [index, setIndex] = useState(0);
  const [showFix, setShowFix] = useState(false);
  const step = steps[index];

  function save() {
    setArtifact("day6-adoption", [
      "The ISO test failed because the parser split only on slashes. The inspectable fix accepts the example 2026-04-01.",
      "That green test proves one assertion. It does not prove slash-order ambiguity, nulls, or the billing rule.",
      "Adoption measures I would use: cycle time for this class of fix, defects found in review, and escaped defects. I would not quote an unsupported productivity multiplier.",
      "Claude Code may propose the diff. A human reviews it. Command approval, Enterprise seat controls, and Console API keys are different.",
      "This lab did not execute a shell command.",
    ].join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>Developer workflow walkthrough</h3><SimLabel /></div>
      <div className="row">
        <button type="button" className="btn" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>Back</button>
        <button type="button" className="btn" onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={index === steps.length - 1}>Forward</button>
        <button type="button" className="btn-ghost" onClick={() => { setIndex(0); setShowFix(false); }}>Reset</button>
      </div>
      <h4>{step.title}</h4>
      <p>{step.body}</p>
      <pre className="code">{showFix ? fixed : broken}</pre>
      <div className="row">
        <button type="button" className="btn-ghost" aria-pressed={showFix} onClick={() => setShowFix((value) => !value)}>{showFix ? "Show the failing version" : "Show the inspectable fix"}</button>
        <button type="button" className="btn" onClick={save}>Save adoption note</button>
      </div>
      <p className="fine">What the evidence proves: after the fix, the displayed test’s one ISO example matches. It does not prove every date the business might send.</p>
    </div>
  );
}
