import type { GlossaryEntry, Lesson } from "../types/learning";

export function searchLessons(lessons: Lesson[], query: string): Lesson[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.overview30s.toLowerCase().includes(q) ||
      l.glossaryTerms.some((t) => t.toLowerCase().includes(q)),
  );
}

export function searchGlossary(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return entries.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q),
  );
}
