import { EVAL_FIXTURE } from "../data/evalFixture";
import { computePrecisionRecall, releaseGate } from "../lib/evalMetrics";
import { SimBadge } from "../components/SimBadge";

export function EvalWorkbenchLab() {
  const metricsA = computePrecisionRecall(EVAL_FIXTURE, "variantA");
  const metricsB = computePrecisionRecall(EVAL_FIXTURE, "variantB");
  const gateA = releaseGate(EVAL_FIXTURE, "variantA");
  const gateB = releaseGate(EVAL_FIXTURE, "variantB");

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Eval workbench</h2>
        <SimBadge />
      </header>

      <p>{EVAL_FIXTURE.length} regression cases — compare variant A vs B before release.</p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <section aria-labelledby="variant-a-heading">
          <h3 id="variant-a-heading">Variant A</h3>
          <ul>
            <li>Pass rate: {(metricsA.precision * 100).toFixed(1)}%</li>
            <li>Passed: {metricsA.passed} / {metricsA.total}</li>
            <li>
              Release gate:{" "}
              <strong>{gateA.allowed ? "ALLOWED" : "BLOCKED"}</strong>
            </li>
          </ul>
          {!gateA.allowed && (
            <ul>
              {gateA.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="variant-b-heading">
          <h3 id="variant-b-heading">Variant B</h3>
          <ul>
            <li>Pass rate: {(metricsB.precision * 100).toFixed(1)}%</li>
            <li>Passed: {metricsB.passed} / {metricsB.total}</li>
            <li>
              Release gate:{" "}
              <strong>{gateB.allowed ? "ALLOWED" : "BLOCKED"}</strong>
            </li>
          </ul>
          {!gateB.allowed && (
            <ul>
              {gateB.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <caption className="sr-only">Eval cases and variant outcomes</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Input</th>
            <th scope="col">Risk</th>
            <th scope="col">A</th>
            <th scope="col">B</th>
          </tr>
        </thead>
        <tbody>
          {EVAL_FIXTURE.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.input}</td>
              <td>{row.riskLevel}</td>
              <td>{row.variantA ? "pass" : "fail"}</td>
              <td>{row.variantB ? "pass" : "fail"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
