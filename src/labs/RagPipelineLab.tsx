import { useMemo, useState } from "react";
import { POLICY_CORPUS, type PolicyDocument } from "../data/policyCorpus";
import { SimBadge } from "../components/SimBadge";

const ROLE_RANK: Record<PolicyDocument["minRole"], number> = {
  employee: 1,
  manager: 2,
  hr: 3,
  legal: 4,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function chunkDocument(doc: PolicyDocument, chunkSize: number, overlap: number): { id: string; text: string; meta: PolicyDocument }[] {
  const words = doc.body.split(/\s+/);
  const chunks: { id: string; text: string; meta: PolicyDocument }[] = [];
  let start = 0;
  let index = 0;
  while (start < words.length) {
    const slice = words.slice(start, start + chunkSize).join(" ");
    chunks.push({
      id: `${doc.id}-c${index}`,
      text: `${doc.title}: ${slice}`,
      meta: doc,
    });
    start += Math.max(1, chunkSize - overlap);
    index += 1;
  }
  return chunks;
}

/** Lexical ranking (simulation): overlap count between query tokens and chunk tokens. */
function lexicalScore(query: string, chunkText: string): number {
  const q = new Set(tokenize(query));
  const c = tokenize(chunkText);
  let score = 0;
  for (const t of c) {
    if (q.has(t)) score += 1;
  }
  return score;
}

export function RagPipelineLab() {
  const [query, setQuery] = useState("remote work policy for employees");
  const [chunkSize, setChunkSize] = useState(24);
  const [overlap, setOverlap] = useState(6);
  const [topK, setTopK] = useState(3);
  const [freshnessDays, setFreshnessDays] = useState(400);
  const [viewerRole, setViewerRole] = useState<PolicyDocument["minRole"]>("employee");

  const ranked = useMemo(() => {
    const cutoff = Date.now() - freshnessDays * 24 * 60 * 60 * 1000;
    const allChunks = POLICY_CORPUS.flatMap((doc) => chunkDocument(doc, chunkSize, overlap));

    const filtered = allChunks.filter((ch) => {
      const updated = new Date(ch.meta.updatedAt).getTime();
      const roleOk = ROLE_RANK[viewerRole] >= ROLE_RANK[ch.meta.minRole];
      return updated >= cutoff && roleOk;
    });

    const scored = filtered
      .map((ch) => ({
        ...ch,
        score: lexicalScore(query, ch.text),
        method: "lexical",
      }))
      .filter((ch) => ch.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }, [query, chunkSize, overlap, topK, freshnessDays, viewerRole]);

  return (
    <div className="card">
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>RAG pipeline explorer</h2>
        <SimBadge />
      </header>

      <p>
        Ranking method: <strong>Lexical ranking (simulation)</strong> — token overlap only, not embeddings.
      </p>

      <label style={{ display: "block" }}>
        User query
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: "1rem" }}>
        <label>
          Chunk size (words): {chunkSize}
          <input
            type="range"
            min={8}
            max={48}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
          />
        </label>
        <label>
          Overlap (words): {overlap}
          <input
            type="range"
            min={0}
            max={20}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
          />
        </label>
        <label>
          Top-k: {topK}
          <input
            type="range"
            min={1}
            max={6}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
          />
        </label>
        <label>
          Freshness window (days): {freshnessDays}
          <input
            type="range"
            min={30}
            max={800}
            value={freshnessDays}
            onChange={(e) => setFreshnessDays(Number(e.target.value))}
          />
        </label>
        <label>
          Viewer role (permissions)
          <select value={viewerRole} onChange={(e) => setViewerRole(e.target.value as PolicyDocument["minRole"])}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="legal">Legal</option>
          </select>
        </label>
      </div>

      <section aria-live="polite" style={{ marginTop: "1.5rem" }}>
        <h3>Selected chunks ({ranked.length})</h3>
        {ranked.length === 0 ? (
          <p>No chunks match filters — try widening freshness, lowering permissions, or changing chunking.</p>
        ) : (
          <ol>
            {ranked.map((ch) => (
              <li key={ch.id} style={{ marginBottom: "0.75rem" }}>
                <strong>{ch.meta.title}</strong> (score {ch.score}, updated {ch.meta.updatedAt}, role ≥{" "}
                {ch.meta.minRole})
                <p>{ch.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
