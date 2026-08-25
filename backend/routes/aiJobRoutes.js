const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// =========================================================
// GEMINI CONFIG
// =========================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

// =========================================================
// HOME
// GET /api/ai-jobs
// =========================================================

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI Job Matching API is working",

    endpoints: {
      test: "/api/ai-jobs/test",
      match: "/api/ai-jobs/match",
    },

    gemini_configured: Boolean(GEMINI_API_KEY),
  });
});

// =========================================================
// TEST
// GET /api/ai-jobs/test
// =========================================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI Job routes are working",
    gemini_configured: Boolean(GEMINI_API_KEY),
  });
});

// =========================================================
// NORMALIZE TEXT
// =========================================================

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

// =========================================================
// NORMALIZE SKILLS
// =========================================================

const normalizeSkills = (skills) => {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  }

  return String(skills)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

// =========================================================
// BUILD RESUME TEXT
// =========================================================

const buildResumeText = (resume = {}) => {
  const skills = normalizeSkills(resume.skills);

  return `
Name:
${resume.name || ""}

Skills:
${skills.join(", ")}

Summary:
${resume.summary || ""}

Education:
${resume.education || ""}

Experience:
${resume.experience || ""}

Projects:
${resume.projects || ""}

Certifications:
${resume.certifications || ""}
`.trim();
};

// =========================================================
// BUILD JOB TEXT
// =========================================================

const buildJobText = (job = {}) => {
  return `
Job ID:
${job.id || ""}

Title:
${job.title || ""}

Company:
${job.company || ""}

Location:
${job.location || ""}

Description:
${job.description || ""}

Job Type:
${job.job_type || ""}

Work Mode:
${job.work_mode || ""}

Category:
${job.category || ""}
`.trim();
};

// =========================================================
// BASIC VALIDATION
// =========================================================

const validateJobs = (jobs) => {
  if (!Array.isArray(jobs)) {
    return false;
  }

  if (jobs.length === 0) {
    return false;
  }

  return true;
};

// =========================================================
// GEMINI JSON PARSER
// =========================================================

const parseGeminiJSON = (text) => {
  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleanText = String(text).trim();

  // -------------------------------------------------------
  // Remove markdown code fence
  // -------------------------------------------------------

  cleanText = cleanText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // -------------------------------------------------------
  // Direct JSON
  // -------------------------------------------------------

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    // Continue below
  }

  // -------------------------------------------------------
  // Find JSON object
  // -------------------------------------------------------

  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    const jsonText = cleanText.substring(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error(
        "Gemini JSON parse failed."
      );

      console.error(
        "Gemini response:",
        cleanText
      );

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }
  }

  console.error(
    "Gemini response:",
    cleanText
  );

  throw new Error(
    "Gemini returned invalid JSON."
  );
};

// =========================================================
// BUILD GEMINI PROMPT
// =========================================================

const buildGeminiPrompt = (
  resume,
  jobs
) => {
  const resumeText =
    buildResumeText(resume);

  const jobsText = jobs
    .map((job, index) => {
      return `
================ JOB ${index + 1} ================

${buildJobText(job)}

====================================================
`;
    })
    .join("\n");

  return `
You are CareerPilot AI, an expert AI career and recruitment assistant.

Your task is to analyze a candidate's resume against real job listings.

IMPORTANT:
- Match the candidate based on skills, experience, projects, education and job requirements.
- Do NOT blindly give a high score.
- Be realistic.
- Identify missing skills.
- Explain why the candidate matches or does not match.
- Give practical recommendations.
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT add text before or after JSON.

CANDIDATE RESUME
================

${resumeText}

JOB LISTINGS
============

${jobsText}

Return exactly this JSON structure:

{
  "overall_summary": "Short summary of the candidate's job market fit.",
  "recommended_job_ids": ["job-id-1"],
  "matches": [
    {
      "job_id": "job-id-1",
      "match_score": 85,
      "match_level": "Strong Match",
      "reason": "Why this job matches the candidate.",
      "matched_skills": [
        "Python",
        "SQL"
      ],
      "missing_skills": [
        "Docker"
      ],
      "strengths": [
        "Strong Python knowledge"
      ],
      "improvements": [
        "Learn Docker"
      ],
      "interview_focus": [
        "Python",
        "SQL",
        "REST APIs"
      ]
    }
  ]
}

MATCH SCORE RULES:

90-100 = Excellent Match
80-89 = Strong Match
70-79 = Good Match
60-69 = Moderate Match
40-59 = Weak Match
0-39 = Poor Match

Return one match object for every supplied job.
`;
};

// =========================================================
// POST /api/ai-jobs/match
// =========================================================

router.post(
  "/match",
  async (req, res) => {
    try {
      // =====================================================
      // REQUEST BODY
      // =====================================================

      const {
        resume = {},
        jobs = [],
      } = req.body || {};

      // =====================================================
      // CHECK GEMINI
      // =====================================================

      if (!GEMINI_API_KEY || !ai) {
        return res.status(500).json({
          success: false,

          message:
            "Gemini API key is missing. Add GEMINI_API_KEY to backend/.env",
        });
      }

      // =====================================================
      // CHECK JOBS
      // =====================================================

      if (!validateJobs(jobs)) {
        return res.status(400).json({
          success: false,

          message:
            "At least one job is required.",
        });
      }

      // =====================================================
      // LIMIT JOBS
      // =====================================================
      //
      // Don't send hundreds of jobs to Gemini.
      //
      // We process maximum 20 jobs in one AI request.
      //
      // =====================================================

      const jobsForAI =
        jobs.slice(0, 20);

      // =====================================================
      // DEBUG
      // =====================================================

      console.log("");
      console.log(
        "========================================"
      );
      console.log(
        "CAREERPILOT AI JOB MATCHING"
      );
      console.log(
        "========================================"
      );

      console.log(
        "Resume:",
        resume?.name || "Unknown"
      );

      console.log(
        "Resume Skills:",
        normalizeSkills(
          resume?.skills
        ).join(", ") ||
          "None"
      );

      console.log(
        "Jobs received:",
        jobs.length
      );

      console.log(
        "Jobs sent to Gemini:",
        jobsForAI.length
      );

      console.log(
        "Gemini Model:",
        "gemini-3.6-flash"
      );

      console.log(
        "========================================"
      );
      console.log("");

      // =====================================================
      // BUILD PROMPT
      // =====================================================

      const prompt =
        buildGeminiPrompt(
          resume,
          jobsForAI
        );

      // =====================================================
      // CALL GEMINI
      // =====================================================

      console.log(
        "Calling Gemini AI..."
      );

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.6-flash",

          contents: prompt,

          config: {
            temperature: 0.2,

            responseMimeType:
              "application/json",
          },
        });

      // =====================================================
      // GEMINI RESPONSE
      // =====================================================

      const responseText =
        response.text || "";

      console.log(
        "Gemini response received."
      );

      // =====================================================
      // PARSE JSON
      // =====================================================

      const aiResult =
        parseGeminiJSON(
          responseText
        );

      // =====================================================
      // VALIDATE RESULT
      // =====================================================

      if (
        !aiResult ||
        !Array.isArray(
          aiResult.matches
        )
      ) {
        return res.status(502).json({
          success: false,

          message:
            "Gemini returned an invalid matching structure.",

          raw_response:
            responseText,
        });
      }

      // =====================================================
      // MAP AI RESULT BACK TO ORIGINAL JOBS
      // =====================================================

      const enhancedMatches =
        aiResult.matches.map(
          (match) => {
            const originalJob =
              jobsForAI.find(
                (job) =>
                  String(job.id) ===
                  String(
                    match.job_id
                  )
              );

            return {
              ...match,

              job:
                originalJob || null,
            };
          }
        );

      // =====================================================
      // SORT BY SCORE
      // =====================================================

      enhancedMatches.sort(
        (a, b) =>
          Number(
            b.match_score || 0
          ) -
          Number(
            a.match_score || 0
          )
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      return res.json({
        success: true,

        message:
          "AI job matching completed successfully.",

        model:
          "gemini-3.6-flash",

        resume: {
          name:
            resume?.name || "",

          skills:
            normalizeSkills(
              resume?.skills
            ),
        },

        jobs_received:
          jobs.length,

        jobs_analyzed:
          jobsForAI.length,

        overall_summary:
          aiResult.overall_summary ||
          "",

        recommended_job_ids:
          aiResult.recommended_job_ids ||
          [],

        matches:
          enhancedMatches,
      });
    } catch (error) {
      // =====================================================
      // ERROR
      // =====================================================

      console.error("");
      console.error(
        "========================================"
      );
      console.error(
        "AI JOB MATCHING ERROR"
      );
      console.error(
        "========================================"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );
      console.error("");

      return res.status(500).json({
        success: false,

        message:
          "AI job matching failed.",

        error:
          error.message,
      });
    }
  }
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;
