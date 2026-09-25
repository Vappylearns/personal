export type FactKind = "verified" | "concept" | "assumption" | "needs-verification";

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; kind: FactKind; title?: string; text: string }
  | { type: "term"; term: string; id: string; definition: string };

export type WalkStep = {
  id: string;
  label: string;
  input: string;
  output: string;
  note: string;
};

export type Choice = {
  id: string;
  text: string;
  correct: boolean;
  why: string;
};

export type Question = {
  id: string;
  prompt: string;
  choices: Choice[];
};

export type PredictOption = {
  id: string;
  label: string;
  observation: string;
  outcome: string;
};

export type PredictSpec = {
  prompt: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  rationale: string;
  controlLabel: string;
  options: PredictOption[];
  initialOptionId: string;
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  overview: string;
  customerProblem: string;
  firstPrinciples: { constraint: string; mechanism: string; tradeoff: string };
  walkthrough: { title: string; summary: string; steps: WalkStep[] };
  predict: PredictSpec;
  failure: { title: string; symptoms: string[]; recovery: string };
  depth: { quick: Block[]; how: Block[]; deeper: Block[] };
  practice: Question[];
  customerValue: { metrics: string[]; outcome: string };
  interview: { prompt: string; outline: string[]; exemplar: string };
  labId?: LabId;
  sourceIds: string[];
  glossaryIds: string[];
};

export type LabId =
  | "model-decision"
  | "tool-walkthrough"
  | "cost-calculator"
  | "rollout-builder"
  | "retrieval-pipeline"
  | "eval-workbench"
  | "code-workflow"
  | "health-investigation";

export type Day = {
  id: string;
  number: number;
  title: string;
  summary: string;
  agenda: { minutes: string; item: string }[];
  lessons: Lesson[];
};

export type GlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  lessonId?: string;
};

export type SourceRecord = {
  id: string;
  title: string;
  url: string;
  facts: string[];
  verifiedOn: string;
};

export type InterviewPrompt = {
  id: string;
  prompt: string;
  scaffold: string;
  exemplar: string;
  rubric: { id: string; label: string }[];
};
