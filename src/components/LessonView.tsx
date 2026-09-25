import { useEffect, useState } from "react";
import type { Lesson } from "../types/learning";
import { getSource } from "../config/sources";
import { useLearning } from "../context/LearningContext";
import { LabRouter } from "./LabRouter";
import { PracticeSection } from "./PracticeSection";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const { markLessonVisited, completeLesson, setNote, toggleBookmark, state, recordQuiz, flagReview } =
    useLearning();
  const [depth, setDepth] = useState<"quick" | "how" | "deep">("quick");
  const [evidence, setEvidence] = useState(
    state.lessonProgress[lesson.id]?.evidenceDraft ?? "",
  );

  useEffect(() => {
    markLessonVisited(lesson.id);
  }, [lesson.id, markLessonVisited]);

  const bookmarked = state.bookmarks.includes(lesson.id);

  return (
    <article className="lesson-view">
      <header>
        <h1>{lesson.title}</h1>
        <p className="muted">{lesson.overview30s}</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => toggleBookmark(lesson.id)}>
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => completeLesson(lesson.id)}>
            Mark lesson complete
          </button>
        </div>
      </header>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Customer problem</h2>
        <p>{lesson.customerProblem}</p>
        <h3>First principles</h3>
        <ul>
          <li><strong>Constraint:</strong> {lesson.firstPrinciples.constraint}</li>
          <li><strong>Mechanism:</strong> {lesson.firstPrinciples.mechanism}</li>
          <li><strong>Trade-off:</strong> {lesson.firstPrinciples.tradeoff}</li>
        </ul>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Visual walkthrough</h2>
        <ol>
          {lesson.walkthroughSteps.map((s) => (
            <li key={s.label}>
              <strong>{s.label}:</strong> {s.detail}
            </li>
          ))}
        </ol>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Explanation</h2>
        <div role="tablist" aria-label="Detail level" style={{ display: "flex", gap: "0.5rem" }}>
          {(["quick", "how", "deep"] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`btn ${depth === d ? "btn-primary" : ""}`}
              onClick={() => setDepth(d)}
            >
              {d === "quick" ? "Quick" : d === "how" ? "How it works" : "Go deeper"}
            </button>
          ))}
        </div>
        <p style={{ marginTop: "1rem" }}>
          {depth === "quick" && lesson.quickExplanation}
          {depth === "how" && lesson.howItWorks}
          {depth === "deep" && lesson.goDeeper}
        </p>
      </section>

      {lesson.labId && (
        <section style={{ marginTop: "1rem" }}>
          <h2>Interactive lab</h2>
          <LabRouter labId={lesson.labId} />
        </section>
      )}

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Failure case</h2>
        <p><strong>Breakdown:</strong> {lesson.failureCase.breakdown}</p>
        <p><strong>Symptoms:</strong> {lesson.failureCase.symptoms}</p>
        <p><strong>Recovery:</strong> {lesson.failureCase.recovery}</p>
      </section>

      <PracticeSection
        questions={lesson.practice}
        onAnswer={(qid, choiceId, correct) => {
          recordQuiz({
            questionId: qid,
            lessonId: lesson.id,
            choiceId,
            correct,
          });
        }}
        onFlag={(qid) => flagReview(lesson.id, qid)}
      />

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Customer value</h2>
        <p>{lesson.customerValue}</p>
      </section>

      {lesson.interviewPrep && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>Interview prep</h2>
          <p><strong>Prompt:</strong> {lesson.interviewPrep.prompt}</p>
          <p><strong>Scaffold:</strong> {lesson.interviewPrep.scaffold}</p>
          <p><strong>Example response (illustrative):</strong> {lesson.interviewPrep.exemplar}</p>
          <ul>
            {lesson.interviewPrep.rubric.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Your evidence artifact</h2>
        <label htmlFor="evidence-draft">Draft your module evidence</label>
        <textarea
          id="evidence-draft"
          rows={5}
          style={{ width: "100%", marginTop: "0.5rem" }}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Sources</h2>
        <ul>
          {lesson.sourceIds.map((sid) => {
            const src = getSource(sid);
            if (!src) return null;
            return (
              <li key={sid}>
                <a href={src.url} target="_blank" rel="noreferrer">{src.title}</a>
                — {src.status === "verified" ? `Verified ${src.verifiedOn}` : "Needs verification"}
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <label htmlFor="lesson-notes">Lesson notes</label>
        <textarea
          id="lesson-notes"
          rows={4}
          style={{ width: "100%" }}
          value={state.notes[lesson.id] ?? ""}
          onChange={(e) => setNote(lesson.id, e.target.value)}
        />
      </section>
    </article>
  );
}
