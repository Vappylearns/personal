import { allLessons } from "../data/curriculum";
import { useLearning } from "../context/LearningContext";

export function ReviewPage() {
  const { state, masterReview } = useLearning();
  const items = state.reviewQueue.filter((r) => !r.masteredAt);

  return (
    <div>
      <h1>Review queue</h1>
      <p>Questions answered incorrectly or flagged for revisit.</p>
      <ul>
        {items.map((item) => {
          const lesson = allLessons.find((l) => l.id === item.lessonId);
          const question = lesson?.practice.find((q) => q.id === item.questionId);
          return (
            <li key={item.questionId} className="card" style={{ marginBottom: "0.75rem", listStyle: "none" }}>
              <p><strong>{lesson?.title}</strong></p>
              <p>{question?.prompt ?? item.questionId}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => masterReview(item.lessonId, item.questionId)}
              >
                Mark reviewed
              </button>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && <p>Queue empty — nice work.</p>}
    </div>
  );
}
