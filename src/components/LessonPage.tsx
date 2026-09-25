import { useEffect, useState } from "react";
import { findLesson } from "../content/curriculum";
import { useLearning } from "../state/LearningContext";
import { Blocks, GlossaryPeek, SourceList } from "./Blocks";
import { CodeLab } from "./labs/CodeLab";
import { CostLab } from "./labs/CostLab";
import { EvalLab } from "./labs/EvalLab";
import { HealthLab } from "./labs/HealthLab";
import { ModelLab } from "./labs/ModelLab";
import { RetrievalLab } from "./labs/RetrievalLab";
import { RolloutLab } from "./labs/RolloutLab";
import { ToolLab } from "./labs/ToolLab";
import { PracticeList } from "./Practice";
import { Predict } from "./Predict";
import type { LabId } from "../types";

export function LessonPage({ lessonId }: { lessonId: string }) {
  const found = findLesson(lessonId);
  const { state, visitLesson, setLessonStatus, setConfidence, toggleBookmark, toggleRevisit, setNote, setDraft } = useLearning();
  useEffect(() => {
    visitLesson(lessonId);
  }, [lessonId, visitLesson]);
  if (!found) return <p>That lesson is not in this lab. Return to the dashboard and pick a day.</p>;
  const { day, lesson } = found;
  const progress = state.lessons[lesson.id];
  const draft = state.interviewDrafts[lesson.id] ?? lesson.interview.outline.map((line) => `- ${line}`).join("\n");

  return (
    <article>
      <p className="muted">Day {day.number} · {lesson.minutes} min</p>
      <h2>{lesson.title}</h2>
      <div className="row">
        <button type="button" className="btn" onClick={() => setLessonStatus(lesson.id, progress?.status === "completed" ? "in_progress" : "completed")}>
          {progress?.status === "completed" ? "Mark as still in progress" : "Mark lesson complete"}
        </button>
        <button type="button" className="btn-ghost" aria-pressed={progress?.bookmarked === true} onClick={() => toggleBookmark(lesson.id)}>Bookmark</button>
        <button type="button" className="btn-ghost" aria-pressed={progress?.revisit === true} onClick={() => toggleRevisit(lesson.id)}>
          {progress?.revisit ? "Flagged to revisit" : "Flag to revisit"}
        </button>
        <label>Confidence
          <select value={progress?.confidence ?? ""} onChange={(event) => setConfidence(lesson.id, Number(event.target.value))} aria-label="Self-reported confidence">
            <option value="" disabled>Not set</option>
            {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
          </select>
        </label>
      </div>
      <p className="fine">Opening this page does not mark it complete. Confidence is separate from the quiz score.</p>
      <nav className="section-nav" aria-label="Lesson sections">
        <a href="#overview">Overview</a>
        <a href="#explain">Explanation</a>
        <a href="#lab">Lab</a>
        <a href="#practice">Practice</a>
        <a href="#interview">Interview</a>
      </nav>
      <section id="overview">
        <h3>30-second overview</h3>
        <p>{lesson.overview}</p>
        <h3>Customer problem</h3>
        <p>{lesson.customerProblem}</p>
      </section>
      <section id="explain">
        <h3>First principles</h3>
        <div className="grid-3">
          <div className="card"><h4>Constraint</h4><p>{lesson.firstPrinciples.constraint}</p></div>
          <div className="card"><h4>Mechanism</h4><p>{lesson.firstPrinciples.mechanism}</p></div>
          <div className="card"><h4>Tradeoff</h4><p>{lesson.firstPrinciples.tradeoff}</p></div>
        </div>
        <h3>{lesson.walkthrough.title}</h3>
        <p>{lesson.walkthrough.summary}</p>
        <Walkthrough steps={lesson.walkthrough.steps} />
        <Predict spec={lesson.predict} />
        <div className="callout needs-verification">
          <h3>Failure case: {lesson.failure.title}</h3>
          <ul>{lesson.failure.symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul>
          <p><strong>Recovery. </strong>{lesson.failure.recovery}</p>
        </div>
        <details className="depth"><summary>Quick explanation</summary><Blocks blocks={lesson.depth.quick} /></details>
        <details className="depth"><summary>How it works</summary><Blocks blocks={lesson.depth.how} /></details>
        <details className="depth"><summary>Go deeper</summary><Blocks blocks={lesson.depth.deeper} /></details>
        <h3>Customer value</h3>
        <ul>{lesson.customerValue.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>
        <p>{lesson.customerValue.outcome}</p>
        <SourceList ids={lesson.sourceIds} />
      </section>
      <section id="lab">
        <h3>Interactive lab</h3>
        {lesson.labId ? <Lab id={lesson.labId} /> : <p>The hands-on lab for this day is on the lesson that carries it. Use the predict control above on this lesson, then open the lab lesson in the same day.</p>}
      </section>
      <section id="practice">
        <h3>Practice</h3>
        <PracticeList lessonId={lesson.id} questions={lesson.practice} />
      </section>
      <section id="interview">
        <h3>Interview answer</h3>
        <p>{lesson.interview.prompt}</p>
        <label className="field">Your editable outline
          <textarea className="notes-box" rows={8} value={draft} onChange={(event) => setDraft(lesson.id, event.target.value)} />
        </label>
        <aside className="callout concept">
          <strong>Example response — not your work. </strong>
          {lesson.interview.exemplar}
        </aside>
      </section>
      <label className="field">Notes for this lesson
        <textarea className="notes-box" rows={5} value={state.notes[lesson.id] ?? ""} onChange={(event) => setNote(lesson.id, event.target.value)} />
      </label>
      <GlossaryPeek ids={lesson.glossaryIds} />
    </article>
  );
}

function Walkthrough({ steps }: { steps: { id: string; label: string; input: string; output: string; note: string }[] }) {
  return (
    <div className="steps">
      {steps.map((step, index) => (
        <InspectableStep key={step.id} step={step} index={index} />
      ))}
    </div>
  );
}

function InspectableStep({ step, index }: { step: { id: string; label: string; input: string; output: string; note: string }; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <details className="step" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{index + 1}. {step.label}</summary>
      <p><strong>Input. </strong>{step.input}</p>
      <p><strong>Output. </strong>{step.output}</p>
      <p className="fine">{step.note}</p>
    </details>
  );
}

function Lab({ id }: { id: LabId }) {
  if (id === "model-decision") return <ModelLab />;
  if (id === "tool-walkthrough") return <ToolLab />;
  if (id === "cost-calculator") return <CostLab />;
  if (id === "rollout-builder") return <RolloutLab />;
  if (id === "retrieval-pipeline") return <RetrievalLab />;
  if (id === "eval-workbench") return <EvalLab />;
  if (id === "code-workflow") return <CodeLab />;
  return <HealthLab />;
}
