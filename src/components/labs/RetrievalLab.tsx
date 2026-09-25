import { useMemo, useState } from "react";
import { policyCorpus, retrievalQueries } from "../../content/policyCorpus";
import { retrieve } from "../../lib/retrieval";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

export function RetrievalLab() {
  const { setArtifact } = useLearning();
  const [queryId, setQueryId] = useState(retrievalQueries[0].id);
  const [query, setQuery] = useState(retrievalQueries[0].query);
  const [chunkWords, setChunkWords] = useState(18);
  const [overlapWords, setOverlapWords] = useState(6);
  const [topK, setTopK] = useState(3);
  const [freshOnOrAfter, setFreshOnOrAfter] = useState("2025-01-01");
  const [role, setRole] = useState("all");
  const preset = retrievalQueries.find((item) => item.id === queryId);

  const result = useMemo(
    () => retrieve(policyCorpus, { query, chunkWords, overlapWords, topK, freshOnOrAfter, role }),
    [query, chunkWords, overlapWords, topK, freshOnOrAfter, role],
  );

  function save() {
    setArtifact("day5-diagnosis", [
      "Simulation — illustrative data. Ranker: deterministic lexical overlap, not embeddings.",
      `Question: ${query}`,
      `Role ${role}. Freshness on or after ${freshOnOrAfter}. Chunk ${chunkWords} words, overlap ${overlapWords}, top-k ${topK}.`,
      `Excluded before assembly — restricted docs ${result.excludedRestricted}, stale docs ${result.excludedStale}.`,
      `Behavior: ${result.behavior}. ${result.answer}`,
      `Selected: ${result.chunks.map((chunk) => `${chunk.title} (${chunk.date}, score ${chunk.score})`).join("; ") || "none"}.`,
      "Recommendation: filter access in trusted infrastructure before the prompt, drop stale policies with a cutoff, abstain when overlap is weak, and evaluate retrieval separately from the final sentence.",
    ].join("\n"));
  }

  return (
    <div className="card">
      <div className="row"><h3>Inspectable retrieval pipeline</h3><SimLabel /></div>
      <p>The corpus is fictional. Changing chunk size, overlap, top-k, freshness, or role changes the eligible text or explains an empty result.</p>
      <label className="field">Preset question
        <select value={queryId} onChange={(event) => {
          const next = retrievalQueries.find((item) => item.id === event.target.value) ?? retrievalQueries[0];
          setQueryId(next.id);
          setQuery(next.query);
        }}>
          {retrievalQueries.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <p className="fine">{preset?.hint}</p>
      <label className="field">Question
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="grid-3">
        <label className="field">Chunk size (words)
          <input type="number" min={5} value={chunkWords} onChange={(event) => setChunkWords(Number(event.target.value))} />
        </label>
        <label className="field">Overlap (words)
          <input type="number" min={0} value={overlapWords} onChange={(event) => setOverlapWords(Number(event.target.value))} />
        </label>
        <label className="field">Top-k
          <input type="number" min={1} value={topK} onChange={(event) => setTopK(Number(event.target.value))} />
        </label>
        <label className="field">Fresh on or after
          <input type="date" value={freshOnOrAfter} onChange={(event) => setFreshOnOrAfter(event.target.value)} />
        </label>
        <label className="field">Signed-in role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="all">Employee (public policies)</option>
            <option value="delivery">Delivery</option>
            <option value="security">Security</option>
            <option value="hr">HR</option>
            <option value="finance-lead">Finance lead</option>
          </select>
        </label>
      </div>
      <p>Excluded before ranking: {result.excludedRestricted} restricted, {result.excludedStale} stale. Answer behavior: <strong>{result.behavior}</strong>.</p>
      <p>{result.answer}</p>
      <p className="fine">{result.note}</p>
      <ol>
        {result.chunks.map((chunk) => (
          <li key={chunk.id}>
            <strong>{chunk.title}</strong> ({chunk.date}) — lexical score {chunk.score}, terms {chunk.terms.join(", ") || "none"}
            <div className="fine">{chunk.text}</div>
          </li>
        ))}
      </ol>
      {!result.chunks.length ? <p>No chunk was assembled. Restricted and stale documents were not passed to the answer step.</p> : null}
      <div className="row">
        <button type="button" className="btn" onClick={save}>Save diagnosis to my evidence</button>
        <button type="button" className="btn-ghost" onClick={() => { setChunkWords(18); setOverlapWords(6); setTopK(3); setFreshOnOrAfter("2025-01-01"); setRole("all"); setQueryId(retrievalQueries[0].id); setQuery(retrievalQueries[0].query); }}>Reset</button>
      </div>
    </div>
  );
}
