import { Link, Outlet, useLocation } from "react-router-dom";
import { days } from "../data/curriculum";

export function AppShell() {
  const location = useLocation();

  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <strong>AI Deployment Learning Lab</strong>
        </Link>
        <p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          Enterprise AI adoption practice for Vipul
        </p>
      </header>
      <div className="app-shell">
        <nav aria-label="Course navigation" className="card">
          <h2 style={{ fontSize: "1rem" }}>Study path</h2>
          {days.map((day) => (
            <details key={day.id} open={location.pathname.includes(day.id)}>
              <summary>{day.title}</summary>
              <ul style={{ paddingLeft: "1rem" }}>
                {day.lessons.map((l) => (
                  <li key={l.id}>
                    <Link to={`/lesson/${l.id}`}>{l.title}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <hr />
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/glossary">Glossary</Link></li>
            <li><Link to="/review">Review queue</Link></li>
            <li><Link to="/interview">Interview practice</Link></li>
            <li><Link to="/settings">Export / import</Link></li>
          </ul>
        </nav>
        <main>
          <Outlet />
        </main>
        <aside className="card" aria-label="Tips">
          <h2 style={{ fontSize: "1rem" }}>Remember</h2>
          <ul style={{ fontSize: "0.9rem" }}>
            <li>Models propose; your app executes.</li>
            <li>Valid JSON ≠ correct answer.</li>
            <li>Measure cost per successful workflow.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
