import { useEffect, useMemo, useState } from "react";
import { days, findLesson, titleIndex } from "../content/curriculum";
import { glossary } from "../content/glossary";
import { interviewPrompts } from "../content/interview";
import { sources } from "../config/sources";
import { notesMarkdown } from "../lib/markdown";
import { exportEnvelope, type LearningState } from "../lib/persistence";
import { searchContent } from "../lib/search";
import { readImport, useLearning } from "../state/LearningContext";
import { PracticeList } from "./Practice";

export function Dashboard({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { state } = useLearning();
  const lessons = days.flatMap((day) => day.lessons);
  const completed = lessons.filter((lesson) => state.lessons[lesson.id]?.status === "completed");
  const revisit = lessons.filter((lesson) => state.lessons[lesson.id]?.revisit || (state.lessons[lesson.id]?.confidence ?? 5) <= 2 && state.lessons[lesson.id]?.confidence);
  const resume = state.lastLessonId && findLesson(state.lastLessonId) ? state.lastLessonId : lessons.find((lesson) => state.lessons[lesson.id]?.status !== "completed")?.id ?? lessons[0].id;
  return (
    <div>
      <h2>Seven-day path</h2>
      <p>Vipul, this is a practice lab for enterprise AI deployment. Finishing it is not a prediction of interview success and not proof of job readiness.</p>
      <div className="row">
        <button type="button" className="btn" onClick={() => onOpen(resume)}>Resume</button>
        <span className="badge">{completed.length} of {lessons.length} lessons marked complete</span>
      </div>
      <div className="day-grid">
        {days.map((day) => {
          const done = day.lessons.filter((lesson) => state.lessons[lesson.id]?.status === "completed").length;
          return (
            <article key={day.id} className="card">
              <h3>Day {day.number}</h3>
              <p><strong>{day.title}</strong></p>
              <p className="fine">{day.summary}</p>
              <p className="fine">{done}/{day.lessons.length} complete · about 90–120 minutes</p>
              <button type="button" className="btn-ghost" onClick={() => onOpen(day.lessons[0].id)}>Open day</button>
            </article>
          );
        })}
      </div>
      <h3>Suggested agendas</h3>
      {days.map((day) => (
        <details key={day.id}>
          <summary>Day {day.number}: {day.title}</summary>
          <ol>{day.agenda.map((item) => <li key={item.item}>{item.minutes} min — {item.item}</li>)}</ol>
        </details>
      ))}
      <h3>Topics to revisit</h3>
      {revisit.length ? (
        <ul>{revisit.map((lesson) => <li key={lesson.id}><button type="button" className="text-link" onClick={() => onOpen(lesson.id)}>{lesson.title}</button></li>)}</ul>
      ) : <p>Nothing is flagged, and no completed-or-started lesson has confidence of 1 or 2. Flag a topic from its lesson page when you want it here.</p>}
    </div>
  );
}

export function GlossaryPage({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const [query, setQuery] = useState("");
  const items = glossary.filter((entry) => `${entry.term} ${entry.definition}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div>
      <h2>Glossary</h2>
      <label className="field">Search terms
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {items.length === 0 ? <p>No terms match that search.</p> : null}
      <dl>
        {items.map((entry) => (
          <div key={entry.id} className="card">
            <dt><strong>{entry.term}</strong></dt>
            <dd>{entry.definition} {entry.lessonId ? <button type="button" className="text-link" onClick={() => onOpen(entry.lessonId!)}>Open lesson</button> : null}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ReviewPage({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { state } = useLearning();
  const open = Object.values(state.reviews).filter((item) => !item.resolved);
  return (
    <div>
      <h2>Review queue</h2>
      <p>Incorrect practice answers land here. A later correct answer resolves that item. Flagged lessons stay until you clear the flag.</p>
      {open.length === 0 ? <p>The queue is empty. Miss a practice question or flag a lesson to add one.</p> : null}
      {open.map((item) => {
        const found = item.questionId ? findLesson(item.lessonId) : null;
        const question = found?.lesson.practice.find((entry) => entry.id === item.questionId);
        return (
          <article key={item.id} className="card">
            <p><span className="badge">{item.reason}</span> {titleIndex[item.lessonId] ?? item.lessonId}</p>
            {question ? <PracticeList lessonId={item.lessonId} questions={[question]} /> : <button type="button" className="btn" onClick={() => onOpen(item.lessonId)}>Open flagged lesson</button>}
          </article>
        );
      })}
    </div>
  );
}

export function InterviewPage() {
  const { state, setDraft, toggleCheck } = useLearning();
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(90);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <div>
      <h2>Interview practice</h2>
      <p>The timer is a clock, not an examiner. The checklist is your self-assessment. This page does not score the meaning of your text and does not estimate an offer.</p>
      <div className="card">
        <p aria-live="polite">Time left: {remaining}s</p>
        <label className="field">Seconds
          <input type="number" min={30} max={300} value={seconds} onChange={(event) => { const next = Number(event.target.value); setSeconds(next); if (!running) setRemaining(next); }} />
        </label>
        <div className="row">
          <button type="button" className="btn" onClick={() => setRunning(true)}>Start</button>
          <button type="button" className="btn-ghost" onClick={() => setRunning(false)}>Pause</button>
          <button type="button" className="btn-ghost" onClick={() => { setRunning(false); setRemaining(seconds); }}>Reset timer</button>
        </div>
      </div>
      {interviewPrompts.map((prompt) => {
        const draft = state.interviewDrafts[prompt.id] ?? prompt.scaffold;
        const checks = state.interviewChecks[prompt.id] ?? {};
        return (
          <article key={prompt.id} className="card">
            <h3>{prompt.prompt}</h3>
            <label className="field">Your draft
              <textarea className="notes-box" rows={8} value={draft} onChange={(event) => setDraft(prompt.id, event.target.value)} />
            </label>
            <fieldset>
              <legend>Self-assessment rubric</legend>
              {prompt.rubric.map((item) => (
                <label key={item.id} style={{ display: "block" }}>
                  <input type="checkbox" checked={checks[item.id] === true} onChange={() => toggleCheck(prompt.id, item.id)} /> {item.label}
                </label>
              ))}
            </fieldset>
            <aside className="callout concept"><strong>Example response — not your work. </strong>{prompt.exemplar}</aside>
          </article>
        );
      })}
    </div>
  );
}

export function DataPage() {
  const { state, replaceState, resetState } = useLearning();
  const [importText, setImportText] = useState("");
  const [pending, setPending] = useState<LearningState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const markdown = useMemo(() => notesMarkdown(state, titleIndex), [state]);

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function reviewImport() {
    const parsed = readImport(importText);
    if (!parsed.ok) {
      setPending(null);
      setMessage(parsed.error);
      return;
    }
    setPending(parsed.state);
    setMessage("Import replaces the learning record in this browser: progress, notes, quiz attempts, bookmarks, and drafts. Review it, then confirm.");
  }

  return (
    <div>
      <h2>Notes and progress files</h2>
      <p>Nothing here is uploaded. Markdown is for notes and interview drafts. JSON is the versioned learning record.</p>
      <div className="row">
        <button type="button" className="btn" onClick={() => download("learning-notes.md", markdown, "text/markdown")}>Download notes markdown</button>
        <button type="button" className="btn" onClick={() => download("learning-progress.json", exportEnvelope(state), "application/json")}>Download progress JSON</button>
        <button type="button" className="btn-ghost" onClick={() => setConfirmReset(true)}>Reset local progress</button>
      </div>
      {confirmReset ? (
        <div className="callout needs-verification" role="alert">
          <p>Reset deletes progress, notes, and drafts stored by this lab in the browser.</p>
          <button type="button" className="btn-danger" onClick={() => { resetState(); setConfirmReset(false); setMessage("Local progress was reset."); }}>Confirm reset</button>
          <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
        </div>
      ) : null}
      <label className="field">Paste a progress JSON file
        <textarea className="import-box" rows={8} value={importText} onChange={(event) => setImportText(event.target.value)} />
      </label>
      <button type="button" className="btn" onClick={reviewImport}>Review import</button>
      {message ? <p role="status">{message}</p> : null}
      {pending ? (
        <div className="callout concept">
          <p>Ready to replace the current record with schema version {pending.schemaVersion}. Lessons in the file: {Object.keys(pending.lessons).length}.</p>
          <button type="button" className="btn-danger" onClick={() => { replaceState(pending); setPending(null); setMessage("Import replaced the local learning record."); }}>Confirm replace</button>
          <button type="button" className="btn-ghost" onClick={() => setPending(null)}>Cancel import</button>
        </div>
      ) : null}
      <h3>Markdown preview</h3>
      <pre className="json">{markdown}</pre>
    </div>
  );
}

export function SourcesPage() {
  return (
    <div>
      <h2>Source registry</h2>
      <p>Product-specific claims in the lessons point here. Concepts and illustrative numbers are labeled in the lesson, not listed as citations.</p>
      {sources.map((source) => (
        <article key={source.id} className="card">
          <h3><a href={source.url}>{source.title}</a></h3>
          <p className="fine">Verified {source.verifiedOn}</p>
          <ul>{source.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

export function SearchBox({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const [query, setQuery] = useState("");
  const hits = searchContent(query, days, glossary);
  const visible = query.trim().length >= 2;
  return (
    <div className="search-wrap">
      <label className="search">Search lessons and glossary
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try caching, RAG, idempotency" />
      </label>
      {visible ? (
        <div className="search-pop" role="region" aria-label="Search results">
          {hits.lessons.length + hits.terms.length === 0 ? <p>No lessons or glossary terms match.</p> : null}
          {hits.lessons.map((hit) => (
            <button key={hit.lessonId} type="button" className="text-link" onClick={() => { onOpen(hit.lessonId); setQuery(""); }}>
              Day {hit.dayNumber}: {hit.title}
            </button>
          ))}
          {hits.terms.map((term) => <p key={term.id} className="fine"><strong>{term.term}.</strong> {term.definition}</p>)}
        </div>
      ) : null}
    </div>
  );
}
