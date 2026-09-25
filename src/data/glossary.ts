import type { GlossaryEntry } from "../types/learning";

export const glossary: GlossaryEntry[] = [
  {
    id: "token",
    term: "Token",
    definition:
      "A small piece of text the model reads or writes. Billing and context limits are counted in tokens, not words.",
    relatedLessonIds: ["d1-l3", "d3-l1"],
  },
  {
    id: "context-window",
    term: "Context window",
    definition:
      "Maximum tokens the model can consider in one request (instructions, history, retrieval, and reserved output).",
    relatedLessonIds: ["d1-l3", "d5-l3"],
  },
  {
    id: "tool-use",
    term: "Tool use",
    definition:
      "The model returns a structured request to call a function. Your application must validate, authorize, execute, and return results.",
    relatedLessonIds: ["d2-l2"],
  },
  {
    id: "rag",
    term: "RAG (retrieval-augmented generation)",
    definition:
      "Fetch relevant documents at query time, add them to context, then generate an answer — reduces but does not eliminate hallucination.",
    relatedLessonIds: ["d5-l1"],
  },
  {
    id: "prompt-caching",
    term: "Prompt caching",
    definition:
      "Reuse unchanged prompt prefixes across requests for lower latency and cost; governed by eligibility rules and TTL.",
    relatedLessonIds: ["d3-l2"],
  },
  {
    id: "scim",
    term: "SCIM",
    definition:
      "Protocol to provision/deprovision users from an identity provider into a SaaS app — supports enterprise access hygiene.",
    relatedLessonIds: ["d4-l1"],
  },
];
