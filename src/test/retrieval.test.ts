import { describe, expect, it } from "vitest";
import { policyCorpus } from "../content/policyCorpus";
import { retrieve } from "../lib/retrieval";

describe("retrieve", () => {
  it("excludes restricted documents before assembly", () => {
    const result = retrieve(policyCorpus, {
      query: "What is the L5 salary band?",
      chunkWords: 30,
      overlapWords: 8,
      topK: 4,
      freshOnOrAfter: "2020-01-01",
      role: "delivery",
    });
    expect(result.chunks.some((chunk) => chunk.docId === "salary-bands")).toBe(false);
    expect(result.excludedRestricted).toBeGreaterThan(0);
    expect(result.behavior).not.toBe("answer");
  });

  it("can select the current travel policy for a public role", () => {
    const result = retrieve(policyCorpus, {
      query: "What is the hotel stay cap for metro cities?",
      chunkWords: 40,
      overlapWords: 10,
      topK: 2,
      freshOnOrAfter: "2025-01-01",
      role: "all",
    });
    expect(result.chunks[0]?.docId).toBe("travel-2025");
    expect(result.chunks.some((chunk) => chunk.docId === "travel-2023")).toBe(false);
  });
});
