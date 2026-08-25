import "./App.css";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobRecommendations from "./pages/JobRecommendations";
import CareerRoadmap from "./pages/CareerRoadmap";
import JobPreparation from "./pages/JobPreparation";
import CareerAssistant from "./pages/CareerAssistant";

function App() {
  const currentPath = window.location.pathname;

  // =========================================================
  // PASSWORD RESET
  // =========================================================

  if (currentPath === "/reset-password") {
    return <ResetPassword />;
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (
    currentPath === "/" ||
    currentPath === "/login"
  ) {
    return <Login />;
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  if (currentPath === "/dashboard") {
    return <Dashboard />;
  }

  // =========================================================
  // RESUME BUILDER
  // =========================================================

  if (currentPath === "/resume-builder") {
    return <ResumeBuilder />;
  }

  // =========================================================
  // CAREER ROADMAP
  // =========================================================

  if (currentPath === "/career-roadmap") {
    return <CareerRoadmap />;
  }

  // =========================================================
  // AI CAREER ASSISTANT
  // =========================================================

  if (currentPath === "/career-assistant") {
    return <CareerAssistant />;
  }

  // =========================================================
  // JOB PREPARATION
  // =========================================================

  if (currentPath === "/job-preparation") {
    return <JobPreparation />;
  }

  // =========================================================
  // JOB RECOMMENDATIONS
  // =========================================================

  if (currentPath === "/job-recommendations") {
    return <JobRecommendations />;
  }

  // =========================================================
  // DEFAULT
  // =========================================================

  return <Login />;
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default App;