import type { Day, GlossaryEntry } from "../types";

export type LessonHit = { lessonId: string; dayNumber: number; title: string; excerpt: string };
export type TermHit = { id: string; term: string; definition: string };

export function searchContent(query: string, days: Day[], glossary: GlossaryEntry[]): { lessons: LessonHit[]; terms: TermHit[] } {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return { lessons: [], terms: [] };
  const lessons: LessonHit[] = [];
  for (const day of days) {
    for (const lesson of day.lessons) {
      const hay = `${lesson.title} ${lesson.overview} ${lesson.customerProblem}`.toLowerCase();
      if (hay.includes(needle)) {
        lessons.push({
          lessonId: lesson.id,
          dayNumber: day.number,
          title: lesson.title,
          excerpt: lesson.overview,
        });
      }
    }
  }
  const terms = glossary
    .filter((entry) => `${entry.term} ${entry.definition}`.toLowerCase().includes(needle))
    .map((entry) => ({ id: entry.id, term: entry.term, definition: entry.definition }));
  return { lessons, terms };
}
