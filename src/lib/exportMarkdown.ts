import type { LearningStateV1 } from "../types/learning";
import { allLessons } from "../data/curriculum";

export function notesToMarkdown(state: LearningStateV1): string {
  const lines = ["# AI Deployment Learning Lab — Notes", ""];
  for (const lesson of allLessons) {
    const note = state.notes[lesson.id];
    if (note?.trim()) {
      lines.push(`## ${lesson.title}`, "", note.trim(), "");
    }
  }
  return lines.join("\n");
}

export function interviewToMarkdown(state: LearningStateV1): string {
  const lines = ["# Interview practice drafts", ""];
  for (const [id, draft] of Object.entries(state.interviewDrafts)) {
    if (draft.content.trim()) {
      lines.push(`## ${id}`, "", draft.content.trim(), "");
    }
  }
  return lines.join("\n");
}
