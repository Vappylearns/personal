import { useEffect, useState } from "react";
import { days, findLesson } from "./content/curriculum";
import { LessonPage } from "./components/LessonPage";
import { Dashboard, DataPage, GlossaryPage, InterviewPage, ReviewPage, SearchBox, SourcesPage } from "./components/Pages";
import { useLearning } from "./state/LearningContext";

type Route =
  | { name: "dashboard" }
  | { name: "lesson"; lessonId: string }
  | { name: "glossary" }
  | { name: "review" }
  | { name: "interview" }
  | { name: "data" }
  | { name: "sources" };

function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts[0] === "lesson" && parts[1]) return { name: "lesson", lessonId: decodeURIComponent(parts[1]) };
  if (parts[0] === "glossary" || parts[0] === "review" || parts[0] === "interview" || parts[0] === "data" || parts[0] === "sources") {
    return { name: parts[0] };
  }
  return { name: "dashboard" };
}

function hrefFor(route: Route): string {
  if (route.name === "lesson") return `#/lesson/${encodeURIComponent(route.lessonId)}`;
  if (route.name === "dashboard") return "#/";
  return `#/${route.name}`;
}

export function App() {
  const { warning, clearWarning, state } = useLearning();
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [navOpen, setNavOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: Route) {
    window.location.hash = hrefFor(next);
    setNavOpen(false);
    const main = document.getElementById("main");
    main?.focus();
  }

  const lesson = route.name === "lesson" ? findLesson(route.lessonId) : null;
  const note = lesson ? state.notes[lesson.lesson.id] ?? "" : "";

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {warning ? (
        <div className="warning-banner" role="status">
          {warning} <button type="button" className="btn-ghost" onClick={clearWarning}>Dismiss</button>
        </div>
      ) : null}
      <header className="app-header">
        <div className="brand">
          <p className="brand-kicker">Local study workspace</p>
          <h1>AI Deployment Learning Lab</h1>
        </div>
        <div className="header-tools">
          <button type="button" className="btn-ghost panel-toggle" aria-expanded={navOpen} onClick={() => setNavOpen((value) => !value)}>Days</button>
          <button type="button" className="btn-ghost panel-toggle" aria-expanded={sideOpen} onClick={() => setSideOpen((value) => !value)}>Notes</button>
          <SearchBox onOpen={(lessonId) => go({ name: "lesson", lessonId })} />
        </div>
      </header>
      <div className="layout">
        <nav className={navOpen ? "nav open" : "nav"} aria-label="Study days">
          <div className="top-links">
            <button type="button" className="text-link" onClick={() => go({ name: "dashboard" })}>Dashboard</button>
            <button type="button" className="text-link" onClick={() => go({ name: "review" })}>Review</button>
            <button type="button" className="text-link" onClick={() => go({ name: "interview" })}>Interview</button>
            <button type="button" className="text-link" onClick={() => go({ name: "glossary" })}>Glossary</button>
            <button type="button" className="text-link" onClick={() => go({ name: "sources" })}>Sources</button>
            <button type="button" className="text-link" onClick={() => go({ name: "data" })}>Export</button>
          </div>
          {days.map((day) => (
            <details key={day.id} className="nav-group" open={lesson?.day.id === day.id}>
              <summary>Day {day.number}. {day.title}</summary>
              {day.lessons.map((item) => (
                <a key={item.id} href={hrefFor({ name: "lesson", lessonId: item.id })} aria-current={route.name === "lesson" && route.lessonId === item.id ? "page" : undefined} onClick={() => setNavOpen(false)}>
                  {state.lessons[item.id]?.status === "completed" ? "Done · " : state.lessons[item.id]?.bookmarked ? "Saved · " : ""}{item.title}
                </a>
              ))}
            </details>
          ))}
        </nav>
        <main id="main" className="main" tabIndex={-1}>
          {route.name === "dashboard" ? <Dashboard onOpen={(lessonId) => go({ name: "lesson", lessonId })} /> : null}
          {route.name === "lesson" ? <LessonPage lessonId={route.lessonId} /> : null}
          {route.name === "glossary" ? <GlossaryPage onOpen={(lessonId) => go({ name: "lesson", lessonId })} /> : null}
          {route.name === "review" ? <ReviewPage onOpen={(lessonId) => go({ name: "lesson", lessonId })} /> : null}
          {route.name === "interview" ? <InterviewPage /> : null}
          {route.name === "data" ? <DataPage /> : null}
          {route.name === "sources" ? <SourcesPage /> : null}
        </main>
        <aside className={sideOpen ? "side open" : "side"} aria-label="Notes and glossary">
          <h2>Notes</h2>
          {lesson ? <p className="fine">{note.trim() ? note : "Notes you type on this lesson appear here and in the markdown export."}</p> : <p className="fine">Open a lesson to pin notes. The glossary page lists every term.</p>}
          <h3>How to use a day</h3>
          <p className="fine">Read the overview, predict, then move a control. Mark the lesson complete only when you can explain the mechanism. Quizzes and confidence are tracked separately.</p>
        </aside>
      </div>
    </>
  );
}
