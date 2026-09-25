import { useLearning } from "../context/LearningContext";
import { interviewToMarkdown, notesToMarkdown } from "../lib/exportMarkdown";

export function SettingsPage() {
  const { exportJson, importJson, resetAll, state, storageOk } = useLearning();

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1>Progress & export</h1>
      {!storageOk && (
        <p role="alert">localStorage unavailable — progress may not persist.</p>
      )}
      <div className="card">
        <button type="button" className="btn" onClick={() => download("learning-progress.json", exportJson())}>
          Export progress JSON
        </button>
        <button type="button" className="btn" onClick={() => download("notes.md", notesToMarkdown(state))}>
          Export notes Markdown
        </button>
        <button type="button" className="btn" onClick={() => download("interview.md", interviewToMarkdown(state))}>
          Export interview Markdown
        </button>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <label htmlFor="import-json">Import progress JSON (replaces current data)</label>
        <textarea id="import-json" rows={6} style={{ width: "100%" }} />
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: "0.5rem" }}
          onClick={() => {
            const el = document.getElementById("import-json") as HTMLTextAreaElement;
            if (window.confirm("Replace all local progress with imported file?")) {
              const ok = importJson(el.value);
              alert(ok ? "Import successful" : "Invalid JSON");
            }
          }}
        >
          Import
        </button>
        <button
          type="button"
          className="btn"
          style={{ marginLeft: "0.5rem" }}
          onClick={() => {
            if (window.confirm("Reset all progress?")) resetAll();
          }}
        >
          Reset all data
        </button>
      </div>
    </div>
  );
}
