export type DayId = "day1" | "day2" | "day3" | "day4" | "day5" | "day6" | "day7";

export interface SourceRef {
  id: string;
  title: string;
  url: string;
  factsSupported: string;
  verifiedOn: string;
  status: "verified" | "needs-verification";
}

export interface PracticeQuestion {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  mistakeHint: string;
}

export interface InterviewPrep {
  prompt: string;
  scaffold: string;
  exemplar: string;
  rubric: string[];
}

export interface Lesson {
  id: string;
  dayId: DayId;
  title: string;
  durationMinutes: number;
  overview30s: string;
  customerProblem: string;
  firstPrinciples: { constraint: string; mechanism: string; tradeoff: string };
  walkthroughSteps: { label: string; detail: string }[];
  failureCase: { breakdown: string; symptoms: string; recovery: string };
  quickExplanation: string;
  howItWorks: string;
  goDeeper: string;
  customerValue: string;
  interviewPrep?: InterviewPrep;
  practice: PracticeQuestion[];
  labId?: string;
  glossaryTerms: string[];
  sourceIds: string[];
}

export interface DayModule {
  id: DayId;
  title: string;
  subtitle: string;
  agendaMinutes: string;
  lessons: Lesson[];
  evidenceArtifact: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  relatedLessonIds: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastVisitedAt: string;
  labCompleted?: boolean;
  evidenceDraft?: string;
}

export interface QuizAttempt {
  questionId: string;
  lessonId: string;
  choiceId: string;
  correct: boolean;
  at: string;
}

export interface ReviewItem {
  questionId: string;
  lessonId: string;
  flaggedByUser?: boolean;
  lastIncorrectAt?: string;
  masteredAt?: string;
}

export interface InterviewDraft {
  promptId: string;
  content: string;
  updatedAt: string;
}

export interface LearningStateV1 {
  version: 1;
  notes: Record<string, string>;
  bookmarks: string[];
  lessonProgress: Record<string, LessonProgress>;
  quizAttempts: QuizAttempt[];
  reviewQueue: ReviewItem[];
  interviewDrafts: Record<string, InterviewDraft>;
  labSettings: Record<string, unknown>;
  lastRoute?: string;
}

export const STORAGE_KEY = "ai-deployment-learning-lab-v1";
