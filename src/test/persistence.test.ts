import { describe, expect, it } from "vitest";
import { emptyState, exportEnvelope, parseLearningState, STORAGE_KEY, saveToStorage } from "../lib/persistence";

describe("parseLearningState", () => {
  it("rejects malformed and wrong-version payloads", () => {
    expect(parseLearningState(null).ok).toBe(false);
    expect(parseLearningState({ schemaVersion: 2 }).ok).toBe(false);
    expect(parseLearningState({ schemaVersion: 1, lessons: [] }).ok).toBe(false);
  });

  it("round-trips a versioned envelope and replaces cleanly", () => {
    const state = emptyState();
    state.lastLessonId = "day2-validation";
    state.notes["day2-validation"] = "Permissions sit in the application.";
    state.lessons["day2-validation"] = {
      status: "completed",
      confidence: 4,
      revisit: false,
      bookmarked: true,
      updatedAt: "2026-09-25T00:00:00.000Z",
    };
    const parsed = parseLearningState(JSON.parse(exportEnvelope(state)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.state.notes["day2-validation"]).toMatch(/application/);
    expect(parsed.state.lessons["day2-validation"].status).toBe("completed");
    expect(parsed.state.schemaVersion).toBe(1);
  });

  it("survives a storage write and a bad saved blob", () => {
    const memory = new Map<string, string>();
    const storage: Storage = {
      get length() { return memory.size; },
      clear: () => memory.clear(),
      getItem: (key) => memory.get(key) ?? null,
      key: (index) => [...memory.keys()][index] ?? null,
      removeItem: (key) => memory.delete(key),
      setItem: (key, value) => memory.set(key, value),
    };
    const state = emptyState();
    state.artifacts["day2-sequence"] = "validation before the service";
    expect(saveToStorage(storage, state)).toBeNull();
    expect(storage.getItem(STORAGE_KEY)).toMatch(/day2-sequence/);
    storage.setItem(STORAGE_KEY, "{");
    expect(() => JSON.parse(storage.getItem(STORAGE_KEY) ?? "")).toThrow();
  });
});
