import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LearningProvider } from "./context/LearningContext";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { SearchPage } from "./pages/SearchPage";
import { ReviewPage } from "./pages/ReviewPage";
import { InterviewPage } from "./pages/InterviewPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <LearningProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LearningProvider>
  );
}
