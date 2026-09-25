import { useEffect, useState } from "react";
import { useLearning } from "../context/LearningContext";

const PROMPTS = [
  {
    id: "consumption-growth",
    text: "How would you drive useful Claude API consumption growth?",
    scaffold: "Segment workloads → measure successful outcomes → remove friction → expand champions",
  },
  {
    id: "technical-depth",
    text: "How technical are you? Demonstrate with a concrete workflow.",
    scaffold: "Pick one workflow → draw request/tool boundary → name validation + metric",
  },
  {
    id: "why-anthropic-india",
    text: "Why Anthropic, and why enterprise AI adoption in India?",
    scaffold: "Mission fit → enterprise trust → India-specific adoption pattern (illustrative)",
  },
  {
    id: "zero-to-motion",
    text: "How would you build an enterprise customer motion from zero?",
    scaffold: "ICP → pilot design → governance → value proof → expansion",
  },
];

export function InterviewPage() {
  const { state, setInterviewDraft } = useLearning();
  const [active, setActive] = useState(PROMPTS[0].id);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const prompt = PROMPTS.find((p) => p.id === active)!;
  const draft = state.interviewDrafts[active]?.content ?? "";

  return (
    <div>
      <h1>Interview practice</h1>
      <p className="sim-badge">Simulation — illustrative data</p>
      <p>Timer for 60–90 second answers. No automatic scoring of free text.</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
        {PROMPTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`btn ${p.id === active ? "btn-primary" : ""}`}
            onClick={() => setActive(p.id)}
          >
            {p.id}
          </button>
        ))}
      </div>
      <div className="card">
        <h2>{prompt.text}</h2>
        <p><strong>Scaffold:</strong> {prompt.scaffold}</p>
        <p>Timer: {seconds}s</p>
        <button type="button" className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"} timer
        </button>
        <button type="button" className="btn" onClick={() => { setSeconds(0); setRunning(false); }}>
          Reset timer
        </button>
        <label htmlFor="interview-draft" style={{ display: "block", marginTop: "1rem" }}>Your answer</label>
        <textarea
          id="interview-draft"
          rows={8}
          style={{ width: "100%" }}
          value={draft}
          onChange={(e) => setInterviewDraft(active, e.target.value)}
        />
        <h3>Self-assessment rubric</h3>
        <ul>
          <li>Concrete workflow named</li>
          <li>Technical mechanism without jargon pile-up</li>
          <li>Customer metric and risk acknowledged</li>
          <li>Honest about limits of AI / citations / evals</li>
        </ul>
        <p><strong>Exemplar (example only — not your biography):</strong> Tie consumption growth to resolved workflows and governance, not raw token maximization.</p>
      </div>
    </div>
  );
}
