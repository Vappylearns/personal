import { useState } from "react";
import type { PracticeQuestion } from "../types/learning";

export interface PracticeSectionProps {
  questions: PracticeQuestion[];
  onAnswer: (questionId: string, choiceId: string, correct: boolean) => void;
  onFlag?: (questionId: string) => void;
}

export function PracticeSection({ questions, onAnswer, onFlag }: PracticeSectionProps) {
  const [activeId, setActiveId] = useState(questions[0]?.id ?? "");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const active = questions.find((q) => q.id === activeId) ?? questions[0];

  function submitChoice(question: PracticeQuestion, choiceId: string) {
    const correct = choiceId === question.correctChoiceId;
    setSelected((s) => ({ ...s, [question.id]: choiceId }));
    setRevealed((r) => ({ ...r, [question.id]: true }));
    onAnswer(question.id, choiceId, correct);
  }

  if (!active) {
    return (
      <section className="card" aria-label="Practice questions">
        <p>No practice questions for this lesson.</p>
      </section>
    );
  }

  return (
    <section className="card" aria-label="Practice questions">
      <nav aria-label="Question list" style={{ marginBottom: "1rem" }}>
        <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0 }}>
          {questions.map((q, i) => (
            <li key={q.id}>
              <button
                type="button"
                className={q.id === active.id ? "btn btn-primary" : "btn"}
                aria-current={q.id === active.id ? "true" : undefined}
                onClick={() => setActiveId(q.id)}
              >
                Q{i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <h3 id={`practice-${active.id}`}>{active.prompt}</h3>
      <fieldset aria-labelledby={`practice-${active.id}`} style={{ border: 0, padding: 0, margin: "1rem 0" }}>
        <legend className="sr-only">Answer choices</legend>
        {active.choices.map((choice) => {
          const checked = selected[active.id] === choice.id;
          return (
            <label
              key={choice.id}
              style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}
            >
              <input
                type="radio"
                name={`practice-${active.id}`}
                value={choice.id}
                checked={checked}
                disabled={Boolean(revealed[active.id])}
                onChange={() => submitChoice(active, choice.id)}
              />
              {choice.label}
            </label>
          );
        })}
      </fieldset>

      {onFlag && (
        <button type="button" className="btn btn-ghost" onClick={() => onFlag(active.id)}>
          Flag for review queue
        </button>
      )}

      {revealed[active.id] && (
        <div role="status" aria-live="polite" className="card" style={{ marginTop: "1rem", background: "var(--color-bg)" }}>
          {selected[active.id] === active.correctChoiceId ? (
            <p><strong>Correct.</strong> {active.explanation}</p>
          ) : (
            <p>
              <strong>Not quite.</strong> {active.mistakeHint}
              <br />
              {active.explanation}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
