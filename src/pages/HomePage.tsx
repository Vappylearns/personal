import { Link } from "react-router-dom";
import { days } from "../data/curriculum";
import { useLearning } from "../context/LearningContext";

export function HomePage() {
  const { state } = useLearning();
  const completed = Object.values(state.lessonProgress).filter((p) => p.completed).length;
  const reviewDue = state.reviewQueue.filter((r) => !r.masteredAt).length;
  const resume = state.lastRoute ?? "/lesson/d2-l1";

  return (
    <div>
      <h1>AI Deployment Learning Lab</h1>
      <p>Welcome, Vipul. Seven study days — jump in any order; progress saves locally.</p>
      <div className="card" style={{ marginTop: "1rem" }}>
        <p><strong>{completed}</strong> lessons completed · <strong>{reviewDue}</strong> items in review queue</p>
        <Link className="btn btn-primary" to={resume}>Resume where you left off</Link>
      </div>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        {days.map((day) => (
          <section key={day.id} className="card">
            <h2>{day.title}</h2>
            <p className="muted">{day.subtitle}</p>
            <p><small>{day.agendaMinutes}</small></p>
            <ul>
              {day.lessons.map((l) => {
                const done = state.lessonProgress[l.id]?.completed;
                return (
                  <li key={l.id}>
                    <Link to={`/lesson/${l.id}`}>{l.title}</Link>
                    {done ? " ✓" : ""}
                  </li>
                );
              })}
            </ul>
            <p><em>Evidence:</em> {day.evidenceArtifact}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
