import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LearningStateV1, QuizAttempt, ReviewItem } from "../types/learning";
import {
  DEFAULT_STATE,
  exportStateJson,
  importStateJson,
  loadState,
  saveState,
} from "../lib/persistence";

interface LearningContextValue {
  state: LearningStateV1;
  setNote: (lessonId: string, text: string) => void;
  toggleBookmark: (lessonId: string) => void;
  markLessonVisited: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  recordQuiz: (attempt: Omit<QuizAttempt, "at">) => void;
  flagReview: (lessonId: string, questionId: string) => void;
  masterReview: (lessonId: string, questionId: string) => void;
  setInterviewDraft: (promptId: string, content: string) => void;
  setLastRoute: (route: string) => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  resetAll: () => void;
  storageOk: boolean;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningStateV1>(() => loadState());
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(saveState(state));
  }, [state]);

  const update = useCallback((fn: (s: LearningStateV1) => LearningStateV1) => {
    setState((prev) => fn(prev));
  }, []);

  const value = useMemo<LearningContextValue>(
    () => ({
      state,
      storageOk,
      setNote: (lessonId, text) =>
        update((s) => ({ ...s, notes: { ...s.notes, [lessonId]: text } })),
      toggleBookmark: (lessonId) =>
        update((s) => {
          const has = s.bookmarks.includes(lessonId);
          return {
            ...s,
            bookmarks: has
              ? s.bookmarks.filter((id) => id !== lessonId)
              : [...s.bookmarks, lessonId],
          };
        }),
      markLessonVisited: (lessonId) =>
        update((s) => ({
          ...s,
          lessonProgress: {
            ...s.lessonProgress,
            [lessonId]: {
              ...s.lessonProgress[lessonId],
              lessonId,
              completed: s.lessonProgress[lessonId]?.completed ?? false,
              lastVisitedAt: new Date().toISOString(),
            },
          },
        })),
      completeLesson: (lessonId) =>
        update((s) => ({
          ...s,
          lessonProgress: {
            ...s.lessonProgress,
            [lessonId]: {
              ...s.lessonProgress[lessonId],
              lessonId,
              completed: true,
              lastVisitedAt: new Date().toISOString(),
            },
          },
        })),
      recordQuiz: (attempt) =>
        update((s) => {
          const full: QuizAttempt = { ...attempt, at: new Date().toISOString() };
          const reviewQueue = [...s.reviewQueue];
          if (!attempt.correct) {
            const existing = reviewQueue.find(
              (r) => r.questionId === attempt.questionId,
            );
            const item: ReviewItem = {
              questionId: attempt.questionId,
              lessonId: attempt.lessonId,
              lastIncorrectAt: new Date().toISOString(),
              flaggedByUser: existing?.flaggedByUser,
            };
            const next = reviewQueue.filter(
              (r) => r.questionId !== attempt.questionId,
            );
            next.push(item);
            return { ...s, quizAttempts: [...s.quizAttempts, full], reviewQueue: next };
          }
          return { ...s, quizAttempts: [...s.quizAttempts, full] };
        }),
      flagReview: (lessonId, questionId) =>
        update((s) => {
          const item: ReviewItem = {
            lessonId,
            questionId,
            flaggedByUser: true,
          };
          const next = s.reviewQueue.filter((r) => r.questionId !== questionId);
          next.push(item);
          return { ...s, reviewQueue: next };
        }),
      masterReview: (_lessonId, questionId) =>
        update((s) => ({
          ...s,
          reviewQueue: s.reviewQueue.map((r) =>
            r.questionId === questionId
              ? { ...r, masteredAt: new Date().toISOString() }
              : r,
          ),
        })),
      setInterviewDraft: (promptId, content) =>
        update((s) => ({
          ...s,
          interviewDrafts: {
            ...s.interviewDrafts,
            [promptId]: { promptId, content, updatedAt: new Date().toISOString() },
          },
        })),
      setLastRoute: (route) => update((s) => ({ ...s, lastRoute: route })),
      exportJson: () => exportStateJson(state),
      importJson: (json) => {
        const parsed = importStateJson(json);
        if (!parsed) return false;
        setState(parsed);
        return true;
      },
      resetAll: () => setState({ ...DEFAULT_STATE }),
    }),
    [state, storageOk, update],
  );

  return (
    <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
  );
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearning must be used within LearningProvider");
  return ctx;
}
