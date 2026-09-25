import { useParams } from "react-router-dom";
import { getLesson } from "../data/curriculum";
import { LessonView } from "../components/LessonView";
import { useLearning } from "../context/LearningContext";
import { useEffect } from "react";

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const { setLastRoute } = useLearning();

  useEffect(() => {
    if (lessonId) setLastRoute(`/lesson/${lessonId}`);
  }, [lessonId, setLastRoute]);

  if (!lesson) {
    return <p>Lesson not found.</p>;
  }
  return <LessonView lesson={lesson} />;
}
