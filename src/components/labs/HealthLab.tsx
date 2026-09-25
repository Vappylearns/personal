import { useState } from "react";
import { healthAccounts } from "../../content/healthFixtures";
import { money, num, pct } from "../../lib/format";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

export function HealthLab() {
  const { setArtifact } = useLearning();
  const [accountId, setAccountId] = useState(healthAccounts[0].id);
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const account = healthAccounts.find((item) => item.id === accountId) ?? healthAccounts[0];
  const maxSpend = Math.max(...account.series.map((point) => point.spendUsd));

  function selectAccount(id: string) {
    setAccountId(id);
    setHypothesis(null);
    setAction(null);
    setOpened([]);
  }

  function save() {
    const chosenH = account.hypotheses.find((item) => item.id === hypothesis);
    const chosenA = account.actions.find((item) => item.id === action);
    setArtifact("day7-account-plan", [
      `Account: ${account.name} (${account.pattern}). Simulation — illustrative data.`,
      `Hypothesis: ${chosenH?.label ?? "not chosen"}. ${chosenH?.why ?? ""}`,
      `Evidence opened: ${opened.join(", ") || "none"}.`,
      `Action: ${chosenA?.label ?? "not chosen"}. ${chosenA?.why ?? ""}`,
      "I would not treat token spend as health. I would pair it with successful workflows, errors, and a named owner.",
    ].join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>Customer health investigation</h3><SimLabel /></div>
      <div className="row">
        {healthAccounts.map((item) => (
          <button key={item.id} type="button" className="btn-ghost" aria-pressed={item.id === account.id} onClick={() => selectAccount(item.id)}>{item.name}</button>
        ))}
      </div>
      <p>{account.summary}</p>
      <div className="bars" aria-label="Weekly spend derived from the fixture">
        {account.series.map((point) => (
          <div key={point.week} className="bar-row">
            <span>{point.week}</span>
            <div className="bar"><span style={{ width: `${(point.spendUsd / maxSpend) * 100}%` }} /></div>
            <span>{money(point.spendUsd)}</span>
          </div>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <caption>Weekly fixture values. Bars use the spend column.</caption>
          <thead><tr><th>Week</th><th>Requests</th><th>Successes</th><th>Errors</th><th>Cache hit</th><th>Spend</th></tr></thead>
          <tbody>
            {account.series.map((point) => (
              <tr key={point.week}>
                <td>{point.week}</td>
                <td>{num(point.requests)}</td>
                <td>{num(point.successes)}</td>
                <td>{num(point.errors)}</td>
                <td>{pct(point.cacheHitRate * 100)}</td>
                <td>{money(point.spendUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>Hypothesis</h4>
      {account.hypotheses.map((item) => (
        <button key={item.id} type="button" className="choice" aria-pressed={hypothesis === item.id} onClick={() => setHypothesis(item.id)}>
          {item.label}
          {hypothesis === item.id ? <span className="fine"> {item.sound ? "This matches the fixture. " : "This does not match the fixture. "}{item.why}</span> : null}
        </button>
      ))}
      <h4>Request evidence</h4>
      <div className="row">
        {account.evidence.map((item) => (
          <button key={item.id} type="button" className="btn-ghost" aria-pressed={opened.includes(item.id)} onClick={() => setOpened((current) => current.includes(item.id) ? current : [...current, item.id])}>{item.label}</button>
        ))}
      </div>
      {account.evidence.filter((item) => opened.includes(item.id)).map((item) => <p key={item.id}><strong>{item.label}. </strong>{item.finding}</p>)}
      <h4>Action</h4>
      {account.actions.map((item) => (
        <button key={item.id} type="button" className="choice" aria-pressed={action === item.id} onClick={() => setAction(item.id)}>
          {item.label}
          {action === item.id ? <span className="fine"> {item.sound ? "Sound for this fixture. " : "Not the action this fixture supports. "}{item.why}</span> : null}
        </button>
      ))}
      <div className="row">
        <button type="button" className="btn" onClick={save}>Save account action plan</button>
        <button type="button" className="btn-ghost" onClick={() => selectAccount(account.id)}>Reset this account</button>
      </div>
    </div>
  );
}
