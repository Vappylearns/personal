import type { Question } from "../types";
import { useLearning } from "../state/LearningContext";

export function PracticeList({ lessonId, questions }: { lessonId: string; questions: Question[] }) {
  const { state, answerQuestion } = useLearning();
  return (
    <div>
      {questions.map((question) => {
        const attempt = state.quizzes[question.id];
        return (
          <fieldset key={question.id} className="card">
            <legend>{question.prompt}</legend>
            {question.choices.map((choice) => {
              const selected = attempt?.selectedChoiceId === choice.id;
              const cls = selected ? (choice.correct ? "choice good" : "choice bad") : "choice";
              return (
                <button key={choice.id} type="button" className={cls} onClick={() => answerQuestion(lessonId, question.id, choice.id)} aria-pressed={selected}>
                  {choice.text}
                  {selected ? <span className="fine"> {choice.correct ? "Correct." : "Not the best answer."} {choice.why}</span> : null}
                </button>
              );
            })}
            {attempt ? <p className="fine">Attempts: {attempt.attempts}. You can choose again.</p> : <p className="fine">Choose an answer. A wrong choice is saved for review.</p>}
          </fieldset>
        );
      })}
    </div>
  );
}
