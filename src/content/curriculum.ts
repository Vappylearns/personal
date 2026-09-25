import type { Day, Lesson } from "../types";
import day1 from "./days/day1";
import day2 from "./days/day2";
import day3 from "./days/day3";
import day4 from "./days/day4";
import day5 from "./days/day5";
import day6 from "./days/day6";
import day7 from "./days/day7";

export const days: Day[] = [day1, day2, day3, day4, day5, day6, day7];

export function allLessons(): Lesson[] {
  return days.flatMap((day) => day.lessons);
}

export function findLesson(id: string): { day: Day; lesson: Lesson } | null {
  for (const day of days) {
    const lesson = day.lessons.find((item) => item.id === id);
    if (lesson) return { day, lesson };
  }
  return null;
}

export function findQuestion(questionId: string): { day: Day; lesson: Lesson; question: Lesson["practice"][number] } | null {
  for (const day of days) {
    for (const lesson of day.lessons) {
      const question = lesson.practice.find((item) => item.id === questionId);
      if (question) return { day, lesson, question };
    }
  }
  return null;
}

export const titleIndex: Record<string, string> = {
  "day1-recommendation": "Day 1 model recommendation",
  "day2-sequence": "Day 2 request sequence",
  "day3-cost-note": "Day 3 cost comparison",
  "day4-rollout": "Day 4 rollout plan",
  "day5-diagnosis": "Day 5 failure diagnosis",
  "day6-release": "Day 6 release recommendation",
  "day6-adoption": "Day 6 adoption measurement",
  "day7-account-plan": "Day 7 account action plan",
};

for (const lesson of allLessons()) titleIndex[lesson.id] = lesson.title;
