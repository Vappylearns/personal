import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findQuestion } from "../content/curriculum";
import {
  emptyState,
  loadFromStorage,
  parseLearningState,
  saveToStorage,
  type LearningState,
  type LessonProgress,
} from "../lib/persistence";

type LearningContextValue = {
  state: LearningState;
  warning: string | null;
  storageReady: boolean;
  clearWarning: () => void;
  visitLesson: (lessonId: string) => void;
  setLessonStatus: (lessonId: string, status: LessonProgress["status"]) => void;
  setConfidence: (lessonId: string, confidence: number) => void;
  toggleRevisit: (lessonId: string) => void;
  toggleBookmark: (lessonId: string) => void;
  setNote: (lessonId: string, note: string) => void;
  answerQuestion: (lessonId: string, questionId: string, choiceId: string) => void;
  setDraft: (id: string, text: string) => void;
  toggleCheck: (promptId: string, checkId: string) => void;
  setArtifact: (id: string, text: string) => void;
  setLabSettings: (id: string, value: unknown) => void;
  replaceState: (next: LearningState) => void;
  resetState: () => void;
};

const LearningContext = createContext<LearningContextValue | null>(null);

function safeStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const probe = "aidll.probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

function progress(existing: LessonProgress | undefined, patch: Partial<LessonProgress>): LessonProgress {
  return {
    status: existing?.status ?? "not_started",
    confidence: existing?.confidence ?? null,
    revisit: existing?.revisit ?? false,
    bookmarked: existing?.bookmarked ?? false,
    updatedAt: new Date().toISOString(),
    ...patch,
  };
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const storage = useMemo(() => safeStorage(), []);
  const loaded = useMemo(() => loadFromStorage(storage), [storage]);
  const [state, setState] = useState<LearningState>(loaded.state);
  const [warning, setWarning] = useState<string | null>(loaded.warning);

  useEffect(() => {
    const error = saveToStorage(storage, state);
    if (error) setWarning(error);
  }, [state, storage]);

  const api = useMemo<LearningContextValue>(() => {
    return {
      state,
      warning,
      storageReady: storage !== null,
      clearWarning: () => setWarning(null),
      visitLesson: (lessonId) => {
        setState((prev) => {
          const current = prev.lessons[lessonId];
          if (prev.lastLessonId === lessonId && (current?.status === "in_progress" || current?.status === "completed")) return prev;
          if (current?.status === "completed") return { ...prev, lastLessonId: lessonId };
          return {
            ...prev,
            lastLessonId: lessonId,
            lessons: { ...prev.lessons, [lessonId]: progress(current, { status: "in_progress" }) },
          };
        });
      },
      setLessonStatus: (lessonId, status) => {
        setState((prev) => ({
          ...prev,
          lastLessonId: lessonId,
          lessons: { ...prev.lessons, [lessonId]: progress(prev.lessons[lessonId], { status }) },
        }));
      },
      setConfidence: (lessonId, confidence) => {
        setState((prev) => ({
          ...prev,
          lessons: { ...prev.lessons, [lessonId]: progress(prev.lessons[lessonId], { confidence }) },
        }));
      },
      toggleRevisit: (lessonId) => {
        setState((prev) => {
          const revisit = !prev.lessons[lessonId]?.revisit;
          const reviews = { ...prev.reviews };
          const id = `flag:${lessonId}`;
          reviews[id] = {
            id,
            lessonId,
            reason: "flagged",
            resolved: !revisit,
            updatedAt: new Date().toISOString(),
          };
          return {
            ...prev,
            lessons: { ...prev.lessons, [lessonId]: progress(prev.lessons[lessonId], { revisit }) },
            reviews,
          };
        });
      },
      toggleBookmark: (lessonId) => {
        setState((prev) => ({
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: progress(prev.lessons[lessonId], { bookmarked: !prev.lessons[lessonId]?.bookmarked }),
          },
        }));
      },
      setNote: (lessonId, note) => setState((prev) => ({ ...prev, notes: { ...prev.notes, [lessonId]: note } })),
      answerQuestion: (lessonId, questionId, choiceId) => {
        const found = findQuestion(questionId);
        const correct = found?.question.choices.find((choice) => choice.id === choiceId)?.correct ?? false;
        setState((prev) => {
          const prior = prev.quizzes[questionId];
          const reviews = { ...prev.reviews };
          const reviewId = `q:${questionId}`;
          if (!correct) {
            reviews[reviewId] = {
              id: reviewId,
              questionId,
              lessonId,
              reason: "incorrect",
              resolved: false,
              updatedAt: new Date().toISOString(),
            };
          } else if (reviews[reviewId]) {
            reviews[reviewId] = { ...reviews[reviewId], resolved: true, updatedAt: new Date().toISOString() };
          }
          return {
            ...prev,
            quizzes: {
              ...prev.quizzes,
              [questionId]: {
                questionId,
                lessonId,
                selectedChoiceId: choiceId,
                correct,
                attempts: (prior?.attempts ?? 0) + 1,
                updatedAt: new Date().toISOString(),
              },
            },
            reviews,
          };
        });
      },
      setDraft: (id, text) => setState((prev) => ({ ...prev, interviewDrafts: { ...prev.interviewDrafts, [id]: text } })),
      toggleCheck: (promptId, checkId) => {
        setState((prev) => {
          const current = prev.interviewChecks[promptId] ?? {};
          return {
            ...prev,
            interviewChecks: { ...prev.interviewChecks, [promptId]: { ...current, [checkId]: !current[checkId] } },
          };
        });
      },
      setArtifact: (id, text) => setState((prev) => ({ ...prev, artifacts: { ...prev.artifacts, [id]: text } })),
      setLabSettings: (id, value) => setState((prev) => ({ ...prev, labSettings: { ...prev.labSettings, [id]: value } })),
      replaceState: (next) => setState(next),
      resetState: () => setState(emptyState()),
    };
  }, [state, warning, storage]);

  return <LearningContext.Provider value={api}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside LearningProvider");
  return value;
}

export function readImport(text: string): ReturnType<typeof parseLearningState> {
  try {
    return parseLearningState(JSON.parse(text));
  } catch {
    return { ok: false, error: "That text is not valid JSON." };
  }
}
