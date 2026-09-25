import type { LearningStateV1 } from "../types/learning";
import { STORAGE_KEY } from "../types/learning";

export const DEFAULT_STATE: LearningStateV1 = {
  version: 1,
  notes: {},
  bookmarks: [],
  lessonProgress: {},
  quizAttempts: [],
  reviewQueue: [],
  interviewDrafts: {},
  labSettings: {},
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function validateState(raw: unknown): LearningStateV1 | null {
  if (!isObject(raw) || raw.version !== 1) return null;
  try {
    return {
      version: 1,
      notes: (raw.notes as LearningStateV1["notes"]) ?? {},
      bookmarks: Array.isArray(raw.bookmarks)
        ? (raw.bookmarks as string[])
        : [],
      lessonProgress:
        (raw.lessonProgress as LearningStateV1["lessonProgress"]) ?? {},
      quizAttempts: Array.isArray(raw.quizAttempts)
        ? (raw.quizAttempts as LearningStateV1["quizAttempts"])
        : [],
      reviewQueue: Array.isArray(raw.reviewQueue)
        ? (raw.reviewQueue as LearningStateV1["reviewQueue"])
        : [],
      interviewDrafts:
        (raw.interviewDrafts as LearningStateV1["interviewDrafts"]) ?? {},
      labSettings: (raw.labSettings as LearningStateV1["labSettings"]) ?? {},
      lastRoute: typeof raw.lastRoute === "string" ? raw.lastRoute : undefined,
    };
  } catch {
    return null;
  }
}

export function loadState(): LearningStateV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as unknown;
    return validateState(parsed) ?? { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: LearningStateV1): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportStateJson(state: LearningStateV1): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(json: string): LearningStateV1 | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    return validateState(parsed);
  } catch {
    return null;
  }
}
