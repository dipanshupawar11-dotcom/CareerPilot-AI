const express = require("express");
const cors = require("cors");
require("dotenv").config();

const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const careerRoadmapRoutes = require("./routes/careerRoadmapRoutes");
const aiJobRoutes = require("./routes/aiJobRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

// =========================================================
// APP
// =========================================================

const app = express();

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

// =========================================================
// HOME
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI Backend is running",
  });
});

// =========================================================
// BACKEND TEST
// =========================================================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Frontend and Backend are connected",
  });
});

// =========================================================
// RESUME ROUTES
// =========================================================

app.use(
  "/api/resume",
  resumeRoutes
);

// =========================================================
// JOB ROUTES
// =========================================================

app.use(
  "/api/jobs",
  jobRoutes
);

// =========================================================
// CAREER ROADMAP ROUTES
// =========================================================

app.use(
  "/api/career-roadmap",
  careerRoadmapRoutes
);

// =========================================================
// AI JOB MATCHING ROUTES
// =========================================================
//
// GET
// /api/ai-jobs
//
// GET
// /api/ai-jobs/test
//
// POST
// /api/ai-jobs/match
//
// =========================================================

app.use(
  "/api/ai-jobs",
  aiJobRoutes
);

// =========================================================
// AI INTERVIEW / JOB PREPARATION ROUTES
// =========================================================
//
// GET
// /api/interview/test
//
// POST
// /api/interview/start
//
// Supports:
//
// Technical Interview
// HR Interview
// DSA
// SQL
// Group Discussion
//
// =========================================================

app.use(
  "/api/interview",
  interviewRoutes
);

// =========================================================
// 404 ROUTE
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "========================================"
    );

    console.error(
      "CareerPilot AI Server Error"
    );

    console.error(
      "========================================"
    );

    console.error(err);

    console.error(
      "========================================"
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV ===
        "development"
          ? err.message
          : undefined,
    });
  }
);

// =========================================================
// SERVER
// =========================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "========================================"
    );

    console.log(
      "🚀 CareerPilot AI Backend"
    );

    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // BACKEND TEST
    // -----------------------------------------------------

    console.log(
      "✅ Backend Test:"
    );

    console.log(
      `http://localhost:${PORT}/api/test`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // RESUME API
    // -----------------------------------------------------

    console.log(
      "📄 Resume API:"
    );

    console.log(
      `http://localhost:${PORT}/api/resume`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // JOB API
    // -----------------------------------------------------

    console.log(
      "💼 Job API:"
    );

    console.log(
      `http://localhost:${PORT}/api/jobs`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // CAREER ROADMAP API
    // -----------------------------------------------------

    console.log(
      "🎯 Career Roadmap API:"
    );

    console.log(
      `http://localhost:${PORT}/api/career-roadmap`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // AI JOB MATCHING API
    // -----------------------------------------------------

    console.log(
      "🤖 AI Job Matching API:"
    );

    console.log(
      `http://localhost:${PORT}/api/ai-jobs`
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // AI INTERVIEW / JOB PREPARATION
    // -----------------------------------------------------

    console.log(
      "💼 Job Preparation API:"
    );

    console.log(
      `http://localhost:${PORT}/api/interview`
    );

    console.log(
      "Test:"
    );

    console.log(
      `http://localhost:${PORT}/api/interview/test`
    );

    console.log(
      "Start AI Interview:"
    );

    console.log(
      `POST http://localhost:${PORT}/api/interview/start`
    );

    console.log(
      "========================================"
    );
  }
);