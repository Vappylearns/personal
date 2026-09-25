import { useState } from "react";
import { SimBadge } from "../components/SimBadge";

interface AccountScenario {
  id: string;
  name: string;
  industry: string;
  seats: number;
  weeklyActivePct: number;
  supportTicketsPer100: number;
  nps: number;
  spendTrendPct: number;
  contractRenewalDays: number;
}

const ACCOUNTS: AccountScenario[] = [
  {
    id: "a1",
    name: "Northwind IT Services",
    industry: "IT outsourcing",
    seats: 420,
    weeklyActivePct: 68,
    supportTicketsPer100: 4.2,
    nps: 42,
    spendTrendPct: 12,
    contractRenewalDays: 45,
  },
  {
    id: "a2",
    name: "Contoso BPO",
    industry: "Business process",
    seats: 890,
    weeklyActivePct: 31,
    supportTicketsPer100: 11.5,
    nps: 18,
    spendTrendPct: -8,
    contractRenewalDays: 120,
  },
  {
    id: "a3",
    name: "Fabrikam Systems",
    industry: "Managed services",
    seats: 210,
    weeklyActivePct: 55,
    supportTicketsPer100: 6.1,
    nps: 35,
    spendTrendPct: 3,
    contractRenewalDays: 200,
  },
  {
    id: "a4",
    name: "Adventure Works",
    industry: "Enterprise IT",
    seats: 1200,
    weeklyActivePct: 74,
    supportTicketsPer100: 2.8,
    nps: 51,
    spendTrendPct: 22,
    contractRenewalDays: 30,
  },
];

const HYPOTHESES = [
  { id: "adoption", label: "Adoption gap in specific business units" },
  { id: "quality", label: "Model quality / trust issue driving tickets" },
  { id: "expansion", label: "Healthy usage — expansion opportunity" },
  { id: "cost", label: "Customer optimizing spend — risk of downgrade" },
];

const ACTIONS = [
  { id: "champion", label: "Executive business review + champion program" },
  { id: "eval", label: "Joint eval sprint on top failure modes" },
  { id: "expansion", label: "Propose seat expansion & new use cases" },
  { id: "optimize", label: "Cost optimization workshop (caching, routing)" },
];

function suggestedPair(account: AccountScenario): { hypothesis: string; action: string; rationale: string } {
  if (account.weeklyActivePct < 40 && account.supportTicketsPer100 > 8) {
    return {
      hypothesis: "quality",
      action: "eval",
      rationale: "Low activation with high ticket rate suggests trust/quality problems.",
    };
  }
  if (account.weeklyActivePct < 45) {
    return {
      hypothesis: "adoption",
      action: "champion",
      rationale: "Usage is below benchmark — sponsorship and champions usually move activation.",
    };
  }
  if (account.spendTrendPct > 15 && account.nps >= 40) {
    return {
      hypothesis: "expansion",
      action: "expansion",
      rationale: "Strong engagement and growing spend — good expansion candidate.",
    };
  }
  if (account.spendTrendPct < 0) {
    return {
      hypothesis: "cost",
      action: "optimize",
      rationale: "Shrinking spend often precedes downgrade — show unit economics wins.",
    };
  }
  return {
    hypothesis: "adoption",
    action: "champion",
    rationale: "Mixed signals — start with adoption diagnostics.",
  };
}

export function CustomerHealthLab() {
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id);
  const [hypothesis, setHypothesis] = useState("");
  const [action, setAction] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const account = ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0];
  const ideal = suggestedPair(account);

  function submit() {
    if (!hypothesis || !action) {
      setFeedback("Select both a hypothesis and an action.");
      return;
    }
    const match = hypothesis === ideal.hypothesis && action === ideal.action;
    setFeedback(
      match
        ? `Aligned with playbook: ${ideal.rationale}`
        : `Consider: ${ideal.rationale} (illustrative pairing: ${ideal.hypothesis} → ${ideal.action}).`,
    );
  }

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Customer health investigation</h2>
        <SimBadge />
      </header>

      <fieldset style={{ border: 0, padding: 0 }}>
        <legend>Account</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {ACCOUNTS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={a.id === accountId ? "btn btn-primary" : "btn"}
              onClick={() => {
                setAccountId(a.id);
                setFeedback(null);
                setHypothesis("");
                setAction("");
              }}
            >
              {a.name}
            </button>
          ))}
        </div>
      </fieldset>

      <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.5rem", marginTop: "1rem" }}>
        <div><dt>Seats</dt><dd>{account.seats}</dd></div>
        <div><dt>Weekly active %</dt><dd>{account.weeklyActivePct}%</dd></div>
        <div><dt>Tickets / 100 users</dt><dd>{account.supportTicketsPer100}</dd></div>
        <div><dt>NPS</dt><dd>{account.nps}</dd></div>
        <div><dt>Spend trend (90d)</dt><dd>{account.spendTrendPct}%</dd></div>
        <div><dt>Renewal in</dt><dd>{account.contractRenewalDays} days</dd></div>
      </dl>

      <fieldset style={{ border: 0, padding: 0, marginTop: "1rem" }}>
        <legend>Your hypothesis</legend>
        {HYPOTHESES.map((h) => (
          <label key={h.id} style={{ display: "block" }}>
            <input
              type="radio"
              name="hypothesis"
              value={h.id}
              checked={hypothesis === h.id}
              onChange={() => setHypothesis(h.id)}
            />
            {h.label}
          </label>
        ))}
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, marginTop: "1rem" }}>
        <legend>Recommended action</legend>
        {ACTIONS.map((a) => (
          <label key={a.id} style={{ display: "block" }}>
            <input
              type="radio"
              name="action"
              value={a.id}
              checked={action === a.id}
              onChange={() => setAction(a.id)}
            />
            {a.label}
          </label>
        ))}
      </fieldset>

      <button type="button" className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={submit}>
        Check alignment
      </button>

      {feedback && (
        <p role="status" aria-live="polite" style={{ marginTop: "1rem" }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
