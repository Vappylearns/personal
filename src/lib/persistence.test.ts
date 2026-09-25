import { describe, expect, it } from "vitest";
import { importStateJson, validateState } from "./persistence";

describe("persistence validation", () => {
  it("rejects wrong version", () => {
    expect(validateState({ version: 2 })).toBeNull();
  });

  it("accepts minimal v1 state", () => {
    const s = validateState({
      version: 1,
      notes: {},
      bookmarks: [],
      lessonProgress: {},
      quizAttempts: [],
      reviewQueue: [],
      interviewDrafts: {},
      labSettings: {},
    });
    expect(s?.version).toBe(1);
  });

  it("import returns null on bad json", () => {
    expect(importStateJson("{")).toBeNull();
  });
});
