import { useState } from "react";
import { glossary } from "../data/glossary";
import { searchGlossary } from "../lib/search";
import { Link } from "react-router-dom";

export function GlossaryPage() {
  const [q, setQ] = useState("");
  const results = q ? searchGlossary(glossary, q) : glossary;

  return (
    <div>
      <h1>Glossary</h1>
      <label htmlFor="glossary-search">Search terms</label>
      <input
        id="glossary-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", maxWidth: "24rem", display: "block", margin: "0.5rem 0 1rem" }}
      />
      <ul>
        {results.map((e) => (
          <li key={e.id} className="card" style={{ marginBottom: "0.75rem", listStyle: "none" }}>
            <h2 style={{ fontSize: "1.1rem" }}>{e.term}</h2>
            <p>{e.definition}</p>
            <p>
              Related:{" "}
              {e.relatedLessonIds.map((id) => (
                <Link key={id} to={`/lesson/${id}`}>{id}</Link>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
