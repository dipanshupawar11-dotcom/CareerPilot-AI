const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// =========================================================
// GEMINI CONFIG
// =========================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

// =========================================================
// HELPERS
// =========================================================

function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          item === null ||
          item === undefined
        ) {
          return "";
        }

        if (typeof item === "string") {
          return item;
        }

        if (
          typeof item === "object"
        ) {
          return Object.values(item)
            .map((value) =>
              String(value)
            )
            .join(" ");
        }

        return String(item);
      })
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (
    typeof value === "object"
  ) {
    return Object.entries(value)
      .map(
        ([key, value]) =>
          `${key}: ${value}`
      )
      .join("\n")
      .trim();
  }

  return String(value).trim();
}

// =========================================================
// CLEAN JSON
// =========================================================

function cleanJsonResponse(text) {
  if (!text) {
    return "";
  }

  let cleaned = text.trim();

  cleaned = cleaned.replace(
    /^```json\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /^```\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /\s*```$/i,
    ""
  );

  return cleaned.trim();
}

// =========================================================
// TEST
// GET /api/interview/test
// =========================================================

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message:
      "AI Interview API is working",

    gemini_configured:
      Boolean(GEMINI_API_KEY),

    model:
      GEMINI_MODEL,
  });
});

// =========================================================
// START AI INTERVIEW
// POST /api/interview/start
// =========================================================

router.post(
  "/start",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "========================================"
      );
      console.log(
        "🤖 CAREERPILOT AI INTERVIEW"
      );
      console.log(
        "========================================"
      );

      // =====================================================
      // CHECK API KEY
      // =====================================================

      if (
        !GEMINI_API_KEY ||
        !ai
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Gemini API key is missing. Add GEMINI_API_KEY to backend/.env",
        });
      }

      // =====================================================
      // REQUEST BODY
      // =====================================================

      const body =
        req.body || {};

      const resume =
        body.resume &&
        typeof body.resume ===
          "object"
          ? body.resume
          : {};

      const job =
        body.job &&
        typeof body.job ===
          "object"
          ? body.job
          : {};

      const preparationType =
        normalizeText(
          body.preparation_type
        ) ||
        "Technical Interview";

      const selectedLanguage =
        normalizeText(
          body.language
        );

      // =====================================================
      // ALLOWED TYPES
      // =====================================================

      const allowedTypes = [
        "Technical Interview",
        "HR Interview",
        "DSA",
        "SQL",
        "Group Discussion",
      ];

      const selectedType =
        allowedTypes.includes(
          preparationType
        )
          ? preparationType
          : "Technical Interview";

      // =====================================================
      // RESUME DATA
      // =====================================================

      const resumeName =
        normalizeText(
          resume.name
        ) ||
        "Candidate";

      const resumeSkills =
        normalizeText(
          resume.skills
        ) ||
        "Not provided";

      const resumeSummary =
        normalizeText(
          resume.summary
        ) ||
        "Not provided";

      const resumeProjects =
        normalizeText(
          resume.projects
        ) ||
        "Not provided";

      const resumeEducation =
        normalizeText(
          resume.education
        ) ||
        "Not provided";

      const resumeExperience =
        normalizeText(
          resume.experience
        ) ||
        "Not provided";

      const resumeCertifications =
        normalizeText(
          resume.certifications
        ) ||
        "Not provided";

      // =====================================================
      // JOB DATA
      // =====================================================

      const jobTitle =
        normalizeText(
          job.title
        ) ||
        "General Interview";

      const jobCompany =
        normalizeText(
          job.company
        ) ||
        "Not provided";

      const jobDescription =
        normalizeText(
          job.description
        ) ||
        "Not provided";

      // =====================================================
      // LANGUAGE
      // =====================================================

      let languageInstruction =
        "No programming language was selected.";

      if (
        selectedLanguage
      ) {
        languageInstruction = `
The candidate selected this programming language:

${selectedLanguage}

If the interview type is Technical Interview
or DSA, the question MUST be related to:

${selectedLanguage}

Do NOT switch to another programming language.
`;
      }

      // =====================================================
      // PROMPT
      // =====================================================

      const prompt = `
You are CareerPilot AI.

You are an expert interview preparation coach
for fresher and junior software developer interviews.

Generate EXACTLY ONE interview question.

==================================================
INTERVIEW TYPE
==================================================

${selectedType}

==================================================
PROGRAMMING LANGUAGE
==================================================

${languageInstruction}

==================================================
CANDIDATE
==================================================

Name:
${resumeName}

Skills:
${resumeSkills}

Summary:
${resumeSummary}

Projects:
${resumeProjects}

Education:
${resumeEducation}

Experience:
${resumeExperience}

Certifications:
${resumeCertifications}

==================================================
JOB
==================================================

Title:
${jobTitle}

Company:
${jobCompany}

Description:
${jobDescription}

==================================================
RULES
==================================================

1. Generate exactly ONE question.

2. The question MUST match:
   ${selectedType}

3. Candidate is a fresher/junior developer.

4. Difficulty must be Beginner or Intermediate.

5. Technical Interview:
   Use the candidate's real skills.
   Use the selected programming language.

6. HR Interview:
   Ask one realistic fresher HR question.
   Do not ask a technical question.

7. DSA:
   Ask exactly one DSA problem.
   Use the selected programming language.
   Include difficulty.

8. SQL:
   Ask exactly one practical SQL/database question.

9. Group Discussion:
   Give exactly one GD topic.
   Ask the candidate to discuss it.

10. Do not give the answer.

11. Do not ask multiple questions.

12. expected_answer_points must contain
    3 to 5 useful points.

13. Keep hint short.

14. Return ONLY JSON.

15. Do not use markdown.

==================================================
REQUIRED JSON
==================================================

{
  "question": "One interview question",
  "difficulty": "Beginner",
  "topic": "Python",
  "expected_answer_points": [
    "Important point 1",
    "Important point 2",
    "Important point 3"
  ],
  "hint": "Short helpful hint"
}
`;

      // =====================================================
      // LOG
      // =====================================================

      console.log(
        "Preparation:",
        selectedType
      );

      console.log(
        "Language:",
        selectedLanguage ||
          "Not selected"
      );

      console.log(
        "Candidate:",
        resumeName
      );

      console.log(
        "Job:",
        jobTitle
      );

      console.log(
        "Gemini Model:",
        GEMINI_MODEL
      );

      // =====================================================
      // GEMINI REQUEST
      // =====================================================

      const response =
        await ai.models.generateContent({
          model:
            GEMINI_MODEL,

          contents:
            prompt,

          config: {
            temperature: 0.7,

            responseMimeType:
              "application/json",
          },
        });

      // =====================================================
      // GET RESPONSE TEXT
      // =====================================================

      let text = "";

      if (
        response &&
        typeof response.text ===
          "string"
      ) {
        text =
          response.text;
      } else if (
        response &&
        typeof response.text ===
          "function"
      ) {
        text =
          response.text();
      }

      text =
        normalizeText(text);

      console.log(
        "Gemini response received."
      );

      if (!text) {
        return res.status(502).json({
          success: false,
          message:
            "Gemini returned an empty response.",
        });
      }

      // =====================================================
      // CLEAN JSON
      // =====================================================

      const cleanedText =
        cleanJsonResponse(text);

      // =====================================================
      // PARSE JSON
      // =====================================================

      let result;

      try {
        result =
          JSON.parse(
            cleanedText
          );
      } catch (error) {
        console.error(
          "Gemini JSON parse error:",
          error
        );

        console.error(
          "Raw Gemini response:",
          text
        );

        return res.status(502).json({
          success: false,
          message:
            "Gemini returned invalid JSON.",
        });
      }

      // =====================================================
      // VALIDATE
      // =====================================================

      if (
        !result ||
        typeof result !==
          "object" ||
        !normalizeText(
          result.question
        )
      ) {
        return res.status(502).json({
          success: false,
          message:
            "Gemini returned an invalid interview question.",
        });
      }

      // =====================================================
      // FINAL QUESTION
      // =====================================================

      const finalQuestion = {
        question:
          normalizeText(
            result.question
          ),

        difficulty:
          normalizeText(
            result.difficulty
          ) ||
          "Beginner",

        topic:
          normalizeText(
            result.topic
          ) ||
          selectedLanguage ||
          selectedType,

        expected_answer_points:
          Array.isArray(
            result.expected_answer_points
          )
            ? result
                .expected_answer_points
                .map((point) =>
                  normalizeText(
                    point
                  )
                )
                .filter(Boolean)
            : [],

        hint:
          normalizeText(
            result.hint
          ) ||
          "Think about the core concepts related to this topic.",
      };

      // =====================================================
      // SUCCESS
      // =====================================================

      console.log(
        "✅ Question generated successfully."
      );

      console.log(
        "Question:",
        finalQuestion.question
      );

      console.log(
        "========================================"
      );

      return res.status(200).json({
        success: true,

        message:
          "AI interview question generated successfully.",

        model:
          GEMINI_MODEL,

        preparation_type:
          selectedType,

        language:
          selectedLanguage ||
          null,

        candidate:
          resumeName,

        job: {
          title:
            jobTitle,

          company:
            jobCompany,
        },

        question:
          finalQuestion,
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
        "❌ AI INTERVIEW ERROR"
      );
      console.error(
        "========================================"
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Status:",
        error.status ||
          "Unknown"
      );

      console.error(
        "Code:",
        error.code ||
          "Unknown"
      );

      console.error(
        "Model:",
        GEMINI_MODEL
      );

      console.error(
        "========================================"
      );

      const errorText =
        String(
          error.message || ""
        ).toLowerCase();

      let message =
        "AI interview preparation failed.";

      if (
        error.status === 401 ||
        errorText.includes(
          "api key"
        ) ||
        errorText.includes(
          "unauthorized"
        )
      ) {
        message =
          "Gemini API key is invalid or missing.";
      } else if (
        error.status === 429 ||
        errorText.includes(
          "quota"
        ) ||
        errorText.includes(
          "rate limit"
        )
      ) {
        message =
          "Gemini API quota or rate limit exceeded.";
      } else if (
        errorText.includes(
          "not found"
        ) ||
        errorText.includes(
          "unavailable"
        ) ||
        errorText.includes(
          "model"
        )
      ) {
        message =
          `Gemini model "${GEMINI_MODEL}" is unavailable.`;
      }

      return res.status(
        error.status >= 400 &&
          error.status < 600
          ? error.status
          : 500
      ).json({
        success: false,

        message,

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