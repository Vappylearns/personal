import { useState } from "react";
import type { PredictSpec } from "../types";

export function Predict({ spec }: { spec: PredictSpec }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [optionId, setOptionId] = useState(spec.initialOptionId);
  const option = spec.options.find((item) => item.id === optionId) ?? spec.options[0];
  return (
    <div className="card">
      <h3>Predict, then change</h3>
      <p>{spec.prompt}</p>
      <div className="row" role="group" aria-label="Prediction">
        {spec.choices.map((item) => (
          <button key={item.id} type="button" className="btn-ghost" aria-pressed={choice === item.id} onClick={() => setChoice(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      {choice ? (
        <p className={choice === spec.correctChoiceId ? "callout verified" : "callout needs-verification"}>
          {choice === spec.correctChoiceId ? "That matches the mechanism. " : "Compare that with the mechanism. "}
          {spec.rationale}
        </p>
      ) : null}
      <label className="field">
        <span>{spec.controlLabel}</span>
        <select value={option.id} onChange={(event) => setOptionId(event.target.value)}>
          {spec.options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid-2">
        <div>
          <h4>What you should observe</h4>
          <p>{option.observation}</p>
        </div>
        <div>
          <h4>Why</h4>
          <p>{option.outcome}</p>
        </div>
      </div>
      <button type="button" className="btn-ghost" onClick={() => { setChoice(null); setOptionId(spec.initialOptionId); }}>
        Reset this exercise
      </button>
    </div>
  );
}
