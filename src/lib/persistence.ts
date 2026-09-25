export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = "aidll.learning-state.v1";

export type LessonProgress = {
  status: "not_started" | "in_progress" | "completed";
  confidence: number | null;
  revisit: boolean;
  bookmarked: boolean;
  updatedAt: string;
};

export type QuizAttempt = {
  questionId: string;
  lessonId: string;
  selectedChoiceId: string | null;
  correct: boolean | null;
  attempts: number;
  updatedAt: string;
};

export type ReviewItem = {
  id: string;
  questionId?: string;
  lessonId: string;
  reason: "incorrect" | "flagged";
  resolved: boolean;
  updatedAt: string;
};

export type LearningState = {
  schemaVersion: typeof SCHEMA_VERSION;
  lastLessonId: string | null;
  lessons: Record<string, LessonProgress>;
  quizzes: Record<string, QuizAttempt>;
  reviews: Record<string, ReviewItem>;
  notes: Record<string, string>;
  interviewDrafts: Record<string, string>;
  interviewChecks: Record<string, Record<string, boolean>>;
  artifacts: Record<string, string>;
  labSettings: Record<string, unknown>;
};

export function emptyState(): LearningState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastLessonId: null,
    lessons: {},
    quizzes: {},
    reviews: {},
    notes: {},
    interviewDrafts: {},
    interviewChecks: {},
    artifacts: {},
    labSettings: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string" && key.length < 200 && item.length < 100_000) out[key] = item;
  }
  return out;
}

export type PersistResult = { ok: true; state: LearningState } | { ok: false; error: string };

export function parseLearningState(raw: unknown): PersistResult {
  if (!isRecord(raw)) return { ok: false, error: "The file is not a JSON object." };
  const body = isRecord(raw.state) ? raw.state : raw;
  if (body.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: `This lab reads schema version ${SCHEMA_VERSION}. The file has a different version.` };
  }
  if (!isRecord(body.lessons) || !isRecord(body.quizzes) || !isRecord(body.reviews)) {
    return { ok: false, error: "Lessons, quizzes, or reviews are missing or not objects." };
  }
  const state = emptyState();
  state.lastLessonId = typeof body.lastLessonId === "string" ? body.lastLessonId : null;
  for (const [id, value] of Object.entries(body.lessons)) {
    if (!isRecord(value)) continue;
    const status = value.status === "completed" || value.status === "in_progress" ? value.status : "not_started";
    const confidence = typeof value.confidence === "number" && value.confidence >= 1 && value.confidence <= 5 ? value.confidence : null;
    state.lessons[id] = {
      status,
      confidence,
      revisit: value.revisit === true,
      bookmarked: value.bookmarked === true,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    };
  }
  for (const [id, value] of Object.entries(body.quizzes)) {
    if (!isRecord(value) || typeof value.questionId !== "string" || typeof value.lessonId !== "string") continue;
    state.quizzes[id] = {
      questionId: value.questionId,
      lessonId: value.lessonId,
      selectedChoiceId: typeof value.selectedChoiceId === "string" ? value.selectedChoiceId : null,
      correct: typeof value.correct === "boolean" ? value.correct : null,
      attempts: typeof value.attempts === "number" && value.attempts >= 0 ? Math.floor(value.attempts) : 0,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    };
  }
  for (const [id, value] of Object.entries(body.reviews)) {
    if (!isRecord(value) || typeof value.lessonId !== "string") continue;
    const reason = value.reason === "flagged" ? "flagged" : "incorrect";
    state.reviews[id] = {
      id,
      questionId: typeof value.questionId === "string" ? value.questionId : undefined,
      lessonId: value.lessonId,
      reason,
      resolved: value.resolved === true,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    };
  }
  state.notes = asStringRecord(body.notes);
  state.interviewDrafts = asStringRecord(body.interviewDrafts);
  state.artifacts = asStringRecord(body.artifacts);
  if (isRecord(body.interviewChecks)) {
    for (const [id, value] of Object.entries(body.interviewChecks)) {
      if (!isRecord(value)) continue;
      const checks: Record<string, boolean> = {};
      for (const [key, checked] of Object.entries(value)) checks[key] = checked === true;
      state.interviewChecks[id] = checks;
    }
  }
  if (isRecord(body.labSettings)) state.labSettings = body.labSettings;
  return { ok: true, state };
}

export function exportEnvelope(state: LearningState): string {
  return JSON.stringify(
    {
      app: "ai-deployment-learning-lab",
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2,
  );
}

export function loadFromStorage(storage: Storage | null): { state: LearningState; warning: string | null } {
  if (!storage) return { state: emptyState(), warning: "Browser storage is unavailable. Progress stays in this tab only." };
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return { state: emptyState(), warning: null };
    const parsed = parseLearningState(JSON.parse(text));
    if (!parsed.ok) return { state: emptyState(), warning: `Saved progress was ignored: ${parsed.error}` };
    return { state: parsed.state, warning: null };
  } catch {
    return { state: emptyState(), warning: "Saved progress could not be read. Starting from an empty record." };
  }
}

export function saveToStorage(storage: Storage | null, state: LearningState): string | null {
  if (!storage) return "Browser storage is unavailable. This session will not survive a reload.";
  try {
    storage.setItem(STORAGE_KEY, exportEnvelope(state));
    return null;
  } catch {
    return "The browser refused to save progress. It may be full or blocked.";
  }
}
