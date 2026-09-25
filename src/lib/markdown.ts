import type { LearningState } from "./persistence";

export function notesMarkdown(state: LearningState, titles: Record<string, string>): string {
  const lines = ["# AI Deployment Learning Lab notes", "", "These notes were written in the local lab. Exemplar answers are not included.", ""];
  const noteIds = Object.keys(state.notes).filter((id) => state.notes[id].trim());
  lines.push("## Lesson notes");
  if (!noteIds.length) lines.push("", "_No lesson notes yet._");
  for (const id of noteIds) {
    lines.push("", `### ${titles[id] ?? id}`, "", state.notes[id].trim());
  }
  lines.push("", "## Evidence drafts");
  const artifactIds = Object.keys(state.artifacts).filter((id) => state.artifacts[id].trim());
  if (!artifactIds.length) lines.push("", "_No evidence drafts yet._");
  for (const id of artifactIds) {
    lines.push("", `### ${titles[id] ?? id}`, "", state.artifacts[id].trim());
  }
  lines.push("", "## Interview drafts");
  const draftIds = Object.keys(state.interviewDrafts).filter((id) => state.interviewDrafts[id].trim());
  if (!draftIds.length) lines.push("", "_No interview drafts yet._");
  for (const id of draftIds) {
    lines.push("", `### ${titles[id] ?? id}`, "", state.interviewDrafts[id].trim());
  }
  lines.push("");
  return lines.join("\n");
}
