import { useState } from "react";
import { Link } from "react-router-dom";
import { allLessons } from "../data/curriculum";
import { glossary } from "../data/glossary";
import { searchGlossary, searchLessons } from "../lib/search";

export function SearchPage() {
  const [q, setQ] = useState("");
  const lessons = searchLessons(allLessons, q);
  const terms = searchGlossary(glossary, q);

  return (
    <div>
      <h1>Search</h1>
      <label htmlFor="global-search">Lessons and glossary</label>
      <input
        id="global-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", maxWidth: "28rem", display: "block", margin: "0.5rem 0 1rem" }}
      />
      {q && (
        <>
          <h2>Lessons</h2>
          <ul>
            {lessons.map((l) => (
              <li key={l.id}><Link to={`/lesson/${l.id}`}>{l.title}</Link></li>
            ))}
          </ul>
          <h2>Glossary</h2>
          <ul>
            {terms.map((t) => (
              <li key={t.id}>{t.term}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
