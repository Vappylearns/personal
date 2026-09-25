export type PolicyDoc = {
  id: string;
  title: string;
  date: string;
  roles: string[];
  text: string;
};

export type Chunk = {
  id: string;
  docId: string;
  title: string;
  date: string;
  roles: string[];
  text: string;
  index: number;
};

export type RetrievalInput = {
  query: string;
  chunkWords: number;
  overlapWords: number;
  topK: number;
  freshOnOrAfter: string;
  role: string;
};

export type RankedChunk = Chunk & { score: number; terms: string[] };

export type RetrievalResult = {
  chunks: RankedChunk[];
  excludedRestricted: number;
  excludedStale: number;
  behavior: "answer" | "abstain" | "insufficient" | "irrelevant";
  answer: string;
  note: string;
};

const STOP = new Set(["the", "a", "an", "of", "to", "and", "or", "for", "in", "on", "is", "what", "how", "does", "do", "our"]);

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function chunkDocument(doc: PolicyDoc, chunkWords: number, overlapWords: number): Chunk[] {
  const words = doc.text.split(/\s+/).filter(Boolean);
  const size = Math.max(5, Math.floor(chunkWords));
  const overlap = Math.max(0, Math.min(size - 1, Math.floor(overlapWords)));
  if (words.length <= size) {
    return [{ id: `${doc.id}-0`, docId: doc.id, title: doc.title, date: doc.date, roles: doc.roles, text: words.join(" "), index: 0 }];
  }
  const chunks: Chunk[] = [];
  const step = size - overlap;
  let index = 0;
  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + size);
    if (!slice.length) break;
    chunks.push({
      id: `${doc.id}-${index}`,
      docId: doc.id,
      title: doc.title,
      date: doc.date,
      roles: doc.roles,
      text: slice.join(" "),
      index,
    });
    index += 1;
    if (start + size >= words.length) break;
  }
  return chunks;
}

function scoreChunk(queryTerms: string[], chunk: Chunk): { score: number; terms: string[] } {
  const hay = new Set(tokens(chunk.text));
  const terms = queryTerms.filter((term) => hay.has(term));
  return { score: terms.length, terms };
}

export function retrieve(docs: PolicyDoc[], input: RetrievalInput): RetrievalResult {
  const queryTerms = [...new Set(tokens(input.query))];
  let excludedRestricted = 0;
  let excludedStale = 0;
  const candidates: Chunk[] = [];
  for (const doc of docs) {
    if (!doc.roles.includes(input.role) && !doc.roles.includes("all")) {
      excludedRestricted += 1;
      continue;
    }
    if (doc.date < input.freshOnOrAfter) {
      excludedStale += 1;
      continue;
    }
    candidates.push(...chunkDocument(doc, input.chunkWords, input.overlapWords));
  }
  const ranked = candidates
    .map((chunk) => ({ ...chunk, ...scoreChunk(queryTerms, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
    .slice(0, Math.max(1, Math.floor(input.topK)));

  const topScore = ranked[0]?.score ?? 0;
  const querySpecific = queryTerms.filter((term) => !["policy", "employee", "employees"].includes(term));
  const matchedSpecific = ranked.some((chunk) => chunk.terms.some((term) => querySpecific.includes(term)));

  let behavior: RetrievalResult["behavior"] = "answer";
  let answer: string;
  let note: string;
  if (!ranked.length) {
    behavior = "abstain";
    answer = "I do not have an authorized, in-date passage that matches this question. I should abstain rather than guess.";
    note = "No eligible chunk shared a query term. Restricted documents were removed before ranking.";
  } else if (!matchedSpecific || topScore < Math.min(2, querySpecific.length)) {
    behavior = querySpecific.length && !matchedSpecific ? "irrelevant" : "insufficient";
    answer = `The lexical ranker selected “${ranked[0].title}”, but the overlap is weak for this question. The answer should say the evidence is insufficient.`;
    note = "This is term overlap, not embedding similarity. A weak overlap can still become the top hit when top-k is large or the corpus is small.";
  } else {
    behavior = "answer";
    answer = `Based on ${ranked[0].title} (${ranked[0].date}): ${ranked[0].text}`;
    note = "The quoted sentence is copied from the selected fictional chunk. A real model could still misstate it. Citation is not the same as truth.";
  }

  return { chunks: ranked, excludedRestricted, excludedStale, behavior, answer, note };
}
