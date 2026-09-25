import { useMemo, useState } from "react";
import { SimBadge } from "../components/SimBadge";

const DEPARTMENTS = [
  "IT Service Desk",
  "Infrastructure",
  "Application Support",
  "Security Operations",
  "HR Shared Services",
  "Finance Ops",
];

const GATE_OPTIONS = [
  { id: "pilot-eval", label: "Pilot eval gate (≥85% pass on high-risk set)" },
  { id: "sso", label: "SSO + SCIM provisioning verified" },
  { id: "audit", label: "Audit logging & retention sign-off" },
  { id: "dpa", label: "Vendor DPA and data residency review" },
];

export function RolloutBuilderLab() {
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["IT Service Desk", "Application Support"]);
  const [milestones, setMilestones] = useState({
    kickoff: "2026-04-01",
    pilot: "2026-05-15",
    expand: "2026-07-01",
    retireLegacy: "2026-10-01",
  });
  const [gates, setGates] = useState<string[]>(["pilot-eval", "sso"]);
  const [executiveSponsor, setExecutiveSponsor] = useState("");
  const [championPerDept, setChampionPerDept] = useState<Record<string, string>>({});
  const [planText, setPlanText] = useState("");

  const generated = useMemo(() => {
    const lines = [
      "AI copilot rollout — IT services (5,000 employees)",
      "Simulation plan — illustrative data",
      "",
      `Executive sponsor: ${executiveSponsor || "(not assigned)"}`,
      "",
      "Departments in wave 1:",
      ...selectedDepts.map((d) => `- ${d} (champion: ${championPerDept[d] || "TBD"})`),
      "",
      "Milestones:",
      `- Program kickoff: ${milestones.kickoff}`,
      `- Pilot complete: ${milestones.pilot}`,
      `- Expansion: ${milestones.expand}`,
      `- Legacy workflow retirement: ${milestones.retireLegacy}`,
      "",
      "Release gates:",
      ...gates.map((g) => `- ${GATE_OPTIONS.find((o) => o.id === g)?.label ?? g}`),
      "",
      "Success metrics: weekly active agents, median handle time, escalation rate, cost per resolved ticket.",
    ];
    return lines.join("\n");
  }, [selectedDepts, milestones, gates, executiveSponsor, championPerDept]);

  const showSponsorWarning = executiveSponsor.trim().length === 0;

  function toggleDept(dept: string) {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
  }

  function toggleGate(id: string) {
    setGates((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Enterprise rollout builder</h2>
        <SimBadge />
      </header>

      <p>Design a rollout for a 5,000-employee IT services organization.</p>

      {showSponsorWarning && (
        <p role="alert" style={{ color: "var(--color-warning)" }}>
          Warning: no executive sponsor named — enterprise rollouts typically stall without visible sponsorship.
        </p>
      )}

      <fieldset style={{ border: 0, padding: 0 }}>
        <legend>Departments</legend>
        <div style={{ display: "grid", gap: "0.35rem" }}>
          {DEPARTMENTS.map((dept) => (
            <label key={dept} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selectedDepts.includes(dept)}
                onChange={() => toggleDept(dept)}
              />
              {dept}
            </label>
          ))}
        </div>
      </fieldset>

      {selectedDepts.map((dept) => (
        <label key={dept} style={{ display: "block", marginTop: "0.5rem" }}>
          Champion for {dept}
          <input
            type="text"
            value={championPerDept[dept] ?? ""}
            onChange={(e) =>
              setChampionPerDept((c) => ({ ...c, [dept]: e.target.value }))
            }
          />
        </label>
      ))}

      <fieldset style={{ border: 0, padding: 0, marginTop: "1rem" }}>
        <legend>Milestones</legend>
        {(
          [
            ["kickoff", "Kickoff"],
            ["pilot", "Pilot complete"],
            ["expand", "Expansion"],
            ["retireLegacy", "Retire legacy workflow"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} style={{ display: "block", marginBottom: "0.5rem" }}>
            {label}
            <input
              type="date"
              value={milestones[key]}
              onChange={(e) => setMilestones((m) => ({ ...m, [key]: e.target.value }))}
            />
          </label>
        ))}
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, marginTop: "1rem" }}>
        <legend>Release gates</legend>
        {GATE_OPTIONS.map((g) => (
          <label key={g.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={gates.includes(g.id)}
              onChange={() => toggleGate(g.id)}
            />
            {g.label}
          </label>
        ))}
      </fieldset>

      <label style={{ display: "block", marginTop: "1rem" }}>
        Executive sponsor
        <input
          type="text"
          value={executiveSponsor}
          onChange={(e) => setExecutiveSponsor(e.target.value)}
          aria-describedby={showSponsorWarning ? "sponsor-warning" : undefined}
        />
      </label>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn btn-primary" onClick={() => setPlanText(generated)}>
          Generate plan into editor
        </button>
        <button type="button" className="btn" onClick={() => setPlanText("")}>
          Clear editor
        </button>
      </div>

      <label style={{ display: "block", marginTop: "1rem" }}>
        Rollout plan (editable)
        <textarea
          rows={14}
          value={planText || generated}
          onChange={(e) => setPlanText(e.target.value)}
          style={{ width: "100%", fontFamily: "monospace" }}
          aria-label="Rollout plan text"
        />
      </label>
    </div>
  );
}
