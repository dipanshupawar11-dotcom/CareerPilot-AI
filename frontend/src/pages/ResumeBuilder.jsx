import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// =========================================================
// API CONFIG
// =========================================================

const BACKEND_URL = import.meta.env.VITE_API_URL;
const AI_URL =
  import.meta.env.VITE_AI_SERVICE_URL ||
  "http://localhost:8000";

const API_URL = `${BACKEND_URL}/api/resume`;
const AI_ANALYZE_URL = `${AI_URL}/api/analyze-resume`;

const STORAGE_KEY = "careerpilot_resume";

// =========================================================
// INITIAL FORM DATA
// =========================================================

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  location: "",

  linkedin: "",
  github: "",
  portfolio: "",

  summary: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
};

// =========================================================
// HELPER
// =========================================================

const isResumeEmpty = (resume) => {
  if (!resume) return true;

  const fields = [
    "name",
    "email",
    "phone",
    "location",
    "linkedin",
    "github",
    "portfolio",
    "summary",
    "education",
    "skills",
    "projects",
    "experience",
    "certifications",
  ];

  return fields.every(
    (field) =>
      !String(resume[field] || "").trim()
  );
};

// =========================================================
// RESUME BUILDER
// =========================================================

function ResumeBuilder() {
  const [formData, setFormData] =
    useState(initialFormData);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [clearing, setClearing] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [currentUserId, setCurrentUserId] =
    useState(null);

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const getCurrentUser = async () => {
    try {
      const {
        data,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Supabase User Error:",
          userError
        );

        return null;
      }

      if (!data?.user) {
        console.warn(
          "No logged-in user found."
        );

        return null;
      }

      return data.user;
    } catch (error) {
      console.error(
        "Get Current User Error:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // LOAD RESUME
  //
  // IMPORTANT:
  // Backend is the source of truth.
  // LocalStorage is only used as backup when backend
  // doesn't have a resume.
  // =========================================================

  useEffect(() => {
    const loadResume = async () => {
      let user = null;

      try {
        setLoading(true);
        setError("");

        // =====================================================
        // STEP 1: USER
        // =====================================================

        user = await getCurrentUser();

        if (!user?.id) {
          console.warn(
            "User not logged in."
          );

          localStorage.removeItem(
            STORAGE_KEY
          );

          setFormData(
            initialFormData
          );

          return;
        }

        setCurrentUserId(user.id);

        console.log(
          "Current user:",
          user.id
        );

        // =====================================================
        // STEP 2: BACKEND FIRST
        // =====================================================

        const resumeUrl =
          `${API_URL}?user_id=${encodeURIComponent(
            user.id
          )}`;

        console.log(
          "Fetching resume from backend:",
          resumeUrl
        );

        try {
          const response =
            await fetch(resumeUrl, {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            });

          let result = null;

          try {
            result =
              await response.json();
          } catch {
            result = null;
          }

          console.log(
            "Backend resume response:",
            result
          );

          // ===================================================
          // RESUME EXISTS IN BACKEND
          // ===================================================

          if (
            response.ok &&
            result?.success &&
            result?.data &&
            !isResumeEmpty(result.data)
          ) {
            const backendResume = {
              ...initialFormData,
              ...result.data,
            };

            setFormData(
              backendResume
            );

            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(
                backendResume
              )
            );

            console.log(
              "Resume loaded from backend."
            );

            return;
          }

          // ===================================================
          // BACKEND SAYS NO RESUME
          // ===================================================

          if (
            response.status === 404 ||
            !result?.data ||
            isResumeEmpty(result?.data)
          ) {
            console.log(
              "No resume found in backend."
            );
            // Load local backup when backend has no resume.
            const localResume =
              localStorage.getItem(
                STORAGE_KEY
              );

            if (localResume) {
              try {
                const parsedResume =
                  JSON.parse(
                    localResume
                  );

                const localData = {
                  ...initialFormData,
                  ...parsedResume,
                };

                setFormData(
                  localData
                );

                console.log(
                  "No backend resume. Loaded local backup."
                );
              } catch (localError) {
                console.error(
                  "Local resume parse error:",
                  localError
                );

                localStorage.removeItem(
                  STORAGE_KEY
                );

                setFormData(
                  initialFormData
                );
              }
            } else {
              setFormData(
                initialFormData
              );
            }

            return;
          }

          // ===================================================
          // BACKEND ERROR
          // ===================================================

          console.error(
            "Backend resume loading failed:",
            result
          );

        } catch (backendError) {
          console.error(
            "Backend unavailable:",
            backendError
          );

          // ===================================================
          // FALLBACK TO LOCAL STORAGE ONLY WHEN BACKEND
          // IS ACTUALLY UNAVAILABLE
          // ===================================================

          const localResume =
            localStorage.getItem(
              STORAGE_KEY
            );

          if (localResume) {
            try {
              const parsedResume =
                JSON.parse(
                  localResume
                );

              const localData = {
                ...initialFormData,
                ...parsedResume,
              };

              setFormData(
                localData
              );

              console.log(
                "Backend unavailable. Loaded local backup."
              );
            } catch (localError) {
              console.error(
                "Local resume parse error:",
                localError
              );

              localStorage.removeItem(
                STORAGE_KEY
              );

              setFormData(
                initialFormData
              );
            }
          } else {
            setFormData(
              initialFormData
            );
          }
        }

      } catch (err) {
        console.error(
          "Load Resume Error:",
          err
        );

        setError(
          "Unable to load resume."
        );

        setFormData(
          initialFormData
        );
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
    setError("");
    setAnalysis(null);
  };

  // =========================================================
  // SAVE RESUME
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      // =====================================================
      // GET USER
      // =====================================================

      const user =
        await getCurrentUser();

      if (!user?.id) {
        setError(
          "You are not logged in. Please login first."
        );

        return;
      }

      setCurrentUserId(
        user.id
      );

      // =====================================================
      // PREPARE DATA
      // =====================================================

      const resumePayload = {
        user_id: user.id,

        name:
          formData.name || "",

        email:
          formData.email || "",

        phone:
          formData.phone || "",

        location:
          formData.location || "",

        linkedin:
          formData.linkedin || "",

        github:
          formData.github || "",

        portfolio:
          formData.portfolio || "",

        summary:
          formData.summary || "",

        education:
          formData.education || "",

        skills:
          formData.skills || "",

        projects:
          formData.projects || "",

        experience:
          formData.experience || "",

        certifications:
          formData.certifications || "",
      };

      console.log(
        "Saving resume:",
        resumePayload
      );

      // =====================================================
      // SAVE BACKEND
      // =====================================================

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            resumePayload
          ),
        });

      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      console.log(
        "Save response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.detail ||
            `Failed to save resume. HTTP ${response.status}`
        );
      }

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Backend failed to save resume."
        );
      }

      // =====================================================
      // SAVE RETURNED DATA
      // =====================================================

      const savedResume = {
        ...initialFormData,
        ...(result?.data ||
          resumePayload),
      };

      setFormData(
        savedResume
      );

      // =====================================================
      // LOCAL BACKUP
      // =====================================================

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          savedResume
        )
      );

      setSaved(true);

      console.log(
        "================================="
      );

      console.log(
        "RESUME SAVED SUCCESSFULLY"
      );

      console.log(
        "USER:",
        user.id
      );

      console.log(
        "================================="
      );

    } catch (err) {
      console.error(
        "Save Resume Error:",
        err
      );

      // =====================================================
      // LOCAL BACKUP ONLY
      // =====================================================

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...formData,
          user_id:
            currentUserId,
        })
      );

      setError(
        err?.message ||
          "Resume saved locally, but backend save failed."
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // AI RESUME ANALYSIS
  // =========================================================

  const analyzeResume = async () => {
    try {
      setAnalyzing(true);
      setError("");
      setAnalysis(null);

      console.log(
        "Sending resume to AI:"
      );

      console.log(
        formData
      );

      const response =
        await fetch(
          AI_ANALYZE_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify(
              formData
            ),
          }
        );

      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      console.log(
        "AI analysis response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            "AI analysis failed."
        );
      }

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "AI analysis failed."
        );
      }

      if (!result?.analysis) {
        throw new Error(
          "AI service returned invalid analysis."
        );
      }

      setAnalysis(
        result.analysis
      );

    } catch (err) {
      console.error(
        "AI Analysis Error:",
        err
      );

      setError(
        err?.message ||
          "AI analysis failed. Make sure FastAPI is running on port 8000."
      );

    } finally {
      setAnalyzing(false);
    }
  };

  // =========================================================
  // CLEAR RESUME
  //
  // THIS IS THE IMPORTANT FIX
  // =========================================================

  const clearResume = async () => {
    const confirmClear =
      window.confirm(
        "Are you sure you want to completely delete your saved resume?"
      );

    if (!confirmClear) {
      return;
    }

    try {
      setClearing(true);
      setError("");
      setSaved(false);

      // =====================================================
      // GET USER
      // =====================================================

      const user =
        await getCurrentUser();

      if (!user?.id) {
        // Even without user, clear local data.
        localStorage.removeItem(
          STORAGE_KEY
        );

        setFormData(
          initialFormData
        );

        setAnalysis(null);

        return;
      }

      setCurrentUserId(
        user.id
      );

      console.log(
        "Deleting resume for user:",
        user.id
      );

      // =====================================================
      // STEP 1
      // DELETE FROM BACKEND / SUPABASE
      // =====================================================

      try {
        const deleteUrl =
          `${API_URL}?user_id=${encodeURIComponent(
            user.id
          )}`;

        const response =
          await fetch(
            deleteUrl,
            {
              method: "DELETE",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        let result = null;

        try {
          result =
            await response.json();
        } catch {
          result = null;
        }

        console.log(
          "Delete resume response:",
          result
        );

        if (!response.ok) {
          console.warn(
            "Backend delete endpoint returned:",
            response.status,
            result
          );
        } else {
          console.log(
            "Backend resume deleted successfully."
          );
        }

      } catch (deleteError) {
        console.error(
          "Backend delete error:",
          deleteError
        );
      }

      // =====================================================
      // STEP 2
      // DELETE LOCAL STORAGE
      // =====================================================

      localStorage.removeItem(
        STORAGE_KEY
      );

      // =====================================================
      // STEP 3
      // RESET REACT STATE
      // =====================================================

      setFormData(
        initialFormData
      );

      setAnalysis(null);
      setSaved(false);

      console.log(
        "Local resume deleted."
      );

      console.log(
        "Resume completely cleared."
      );

    } catch (err) {
      console.error(
        "Clear Resume Error:",
        err
      );

      // Still clear local data.
      localStorage.removeItem(
        STORAGE_KEY
      );

      setFormData(
        initialFormData
      );

      setAnalysis(null);

      setError(
        "Resume cleared locally. Backend deletion may need to be checked."
      );

    } finally {
      setClearing(false);
    }
  };

  // =========================================================
  // PRINT / PDF
  // =========================================================

  const printResume = () => {
    window.print();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="resume-builder-page">

        <div className="resume-form-card loading-card">

          <h1>
            Resume Builder
          </h1>

          <p>
            Loading your resume...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="resume-builder-page">

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="resume-form-card">

        <div className="resume-header">

          <h1>
            Resume Builder
          </h1>

          <p>
            Create a professional,
            ATS-friendly resume with
            CareerPilot AI.
          </p>

          {currentUserId && (
            <small>
              Account connected
            </small>
          )}

        </div>

        <form onSubmit={handleSubmit}>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="form-section">

            <h2>
              Personal Information
            </h2>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dipanshu Pawar"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />

              </div>

              <div className="form-field">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Bangalore, India"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              ONLINE PROFILES
          ================================================= */}

          <div className="form-section">

            <h2>
              Online Profiles
            </h2>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  LinkedIn URL
                </label>

                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                />

              </div>

              <div className="form-field">

                <label>
                  GitHub URL
                </label>

                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/your-username"
                />

              </div>

              <div className="form-field">

                <label>
                  Portfolio URL
                </label>

                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="form-section">

            <h2>
              Professional Summary
            </h2>

            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Write a professional 2-3 sentence summary..."
              rows="6"
            />

          </div>

          {/* =================================================
              EDUCATION
          ================================================= */}

          <div className="form-section">

            <h2>
              Education
            </h2>

            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder={`Bachelor of Technology in Computer Science Engineering
Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)
Expected Graduation: 2026
CGPA: 7.12`}
              rows="7"
            />

          </div>

          {/* =================================================
              SKILLS
          ================================================= */}

          <div className="form-section">

            <h2>
              Technical Skills
            </h2>

            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder={`Languages: Python, JavaScript (Basic), SQL
Frontend: React.js, HTML5, CSS3, Tailwind CSS
Backend: FastAPI, Node.js
Database: MySQL, MongoDB
Tools: Git, GitHub, VS Code
Data: Power BI, Microsoft Excel`}
              rows="8"
            />

          </div>

          {/* =================================================
              PROJECTS
          ================================================= */}

          <div className="form-section">

            <h2>
              Projects
            </h2>

            <textarea
              name="projects"
              value={formData.projects}
              onChange={handleChange}
              placeholder={`CareerPilot AI
â€¢ Developed an AI-powered career and resume platform.
â€¢ Built the frontend using React.js.
â€¢ Developed REST APIs using FastAPI and Node.js.
â€¢ Integrated Supabase for database management.
â€¢ Implemented ATS resume analysis.

Weather AI Agent
â€¢ Developed an AI-powered weather forecasting application.
â€¢ Integrated Open-Meteo API for real-time weather data.
â€¢ Added AI assistant functionality.`}
              rows="12"
            />

          </div>

          {/* =================================================
              EXPERIENCE
          ================================================= */}

          <div className="form-section">

            <h2>
              Experience
            </h2>

            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder={`Internship / Company Name | Role | Duration
â€¢ Developed web applications using React.js and Python.
â€¢ Worked with REST APIs and databases.
â€¢ Implemented features and fixed application issues.`}
              rows="9"
            />

          </div>

          {/* =================================================
              CERTIFICATIONS
          ================================================= */}

          <div className="form-section">

            <h2>
              Certifications
            </h2>

            <textarea
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder={`Python Programming Certification
SQL Certification
Web Development Certification`}
              rows="6"
            />

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="resume-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                clearing
              }
            >
              {saving
                ? "Saving..."
                : "Save Resume"}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={analyzeResume}
              disabled={
                analyzing ||
                clearing
              }
            >
              {analyzing
                ? "Analyzing..."
                : "ðŸ¤– Analyze Resume"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={printResume}
              disabled={clearing}
            >
              Download / Print PDF
            </button>

            {/* =================================================
                IMPORTANT CLEAR BUTTON
            ================================================= */}

            <button
              type="button"
              className="secondary-button"
              onClick={clearResume}
              disabled={
                clearing ||
                saving
              }
            >
              {clearing
                ? "Clearing..."
                : "ðŸ—‘ï¸ Clear Resume"}
            </button>

          </div>

          {/* =================================================
              SAVE MESSAGE
          ================================================= */}

          {saved && (
            <div className="success-message">
              âœ… Resume saved successfully!
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* =================================================
              AI ANALYSIS
          ================================================= */}

          {analysis && (

            <div className="ai-analysis-card">

              <h2>
                ðŸ¤– AI Resume Analysis
              </h2>

              <div className="analysis-score">

                <div>
                  <strong>
                    ATS Score
                  </strong>

                  <span>
                    {analysis.ats_score ?? 0}/100
                  </span>
                </div>

                <div>
                  <strong>
                    ATS Status
                  </strong>

                  <span>
                    {analysis.ats_status ||
                      "Unknown"}
                  </span>
                </div>

                <div>
                  <strong>
                    Name
                  </strong>

                  <span>
                    {analysis.name ||
                      "Not provided"}
                  </span>
                </div>

              </div>

              {/* FOUND KEYWORDS */}

              <div className="analysis-section">

                <h3>
                  Detected Keywords
                </h3>

                {analysis.found_keywords?.length >
                0 ? (

                  <div className="skills-list">

                    {analysis.found_keywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                        >
                          {keyword}
                        </span>
                      )
                    )}

                  </div>

                ) : (
                  <p>
                    No technical keywords detected.
                  </p>
                )}

              </div>

              {/* MISSING KEYWORDS */}

              <div className="analysis-section">

                <h3>
                  Missing Keywords
                </h3>

                {analysis.missing_keywords?.length >
                0 ? (

                  <div className="skills-list">

                    {analysis.missing_keywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                        >
                          {keyword}
                        </span>
                      )
                    )}

                  </div>

                ) : (
                  <p>
                    ðŸŽ‰ No major keywords are missing.
                  </p>
                )}

              </div>

              {/* SUGGESTIONS */}

              <div className="analysis-section">

                <h3>
                  Suggestions
                </h3>

                {analysis.suggestions?.length >
                0 ? (

                  <ul>

                    {analysis.suggestions.map(
                      (suggestion, index) => (
                        <li
                          key={index}
                        >
                          {suggestion}
                        </li>
                      )
                    )}

                  </ul>

                ) : (
                  <p>
                    ðŸŽ‰ Your resume looks good!
                  </p>
                )}

              </div>

              {/* SECTIONS */}

              <div className="analysis-section">

                <h3>
                  Resume Sections
                </h3>

                <ul>

                  <li>
                    Personal Information:{" "}
                    {analysis.sections
                      ?.personal_information
                      ? "âœ… Complete"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Online Profiles:{" "}
                    {analysis.sections
                      ?.online_profiles
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Professional Summary:{" "}
                    {analysis.sections
                      ?.summary
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Education:{" "}
                    {analysis.sections
                      ?.education
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Technical Skills:{" "}
                    {analysis.sections
                      ?.skills
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Projects:{" "}
                    {analysis.sections
                      ?.projects
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Experience:{" "}
                    {analysis.sections
                      ?.experience
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                  <li>
                    Certifications:{" "}
                    {analysis.sections
                      ?.certifications
                      ? "âœ… Added"
                      : "âŒ Missing"}
                  </li>

                </ul>

              </div>

            </div>

          )}

        </form>

      </div>

      {/* =====================================================
          LIVE RESUME PREVIEW
      ===================================================== */}

      <div className="resume-preview-container">

        <div className="preview-title">

          <h2>
            Live Resume Preview
          </h2>

          <p>
            Your resume updates automatically
            as you type.
          </p>

        </div>

        <div className="resume-paper">

          {/* HEADER */}

          <header className="resume-paper-header">

            <h1>
              {formData.name ||
                "YOUR NAME"}
            </h1>

            <div className="resume-contact-row">

              {formData.email && (
                <span>
                  {formData.email}
                </span>
              )}

              {formData.phone && (
                <span>
                  {formData.phone}
                </span>
              )}

              {formData.location && (
                <span>
                  {formData.location}
                </span>
              )}

            </div>

            <div className="resume-links-row">

              {formData.linkedin && (
                <a
                  href={formData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}

              {formData.github && (
                <a
                  href={formData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}

              {formData.portfolio && (
                <a
                  href={formData.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                </a>
              )}

            </div>

          </header>

          {/* SUMMARY */}

          {formData.summary && (
            <section className="resume-section">

              <h3>
                PROFESSIONAL SUMMARY
              </h3>

              <p>
                {formData.summary}
              </p>

            </section>
          )}

          {/* EDUCATION */}

          {formData.education && (
            <section className="resume-section">

              <h3>
                EDUCATION
              </h3>

              <p className="preserve-lines">
                {formData.education}
              </p>

            </section>
          )}

          {/* SKILLS */}

          {formData.skills && (
            <section className="resume-section">

              <h3>
                TECHNICAL SKILLS
              </h3>

              <p className="preserve-lines">
                {formData.skills}
              </p>

            </section>
          )}

          {/* PROJECTS */}

          {formData.projects && (
            <section className="resume-section">

              <h3>
                PROJECTS
              </h3>

              <p className="preserve-lines">
                {formData.projects}
              </p>

            </section>
          )}

          {/* EXPERIENCE */}

          {formData.experience && (
            <section className="resume-section">

              <h3>
                EXPERIENCE
              </h3>

              <p className="preserve-lines">
                {formData.experience}
              </p>

            </section>
          )}

          {/* CERTIFICATIONS */}

          {formData.certifications && (
            <section className="resume-section">

              <h3>
                CERTIFICATIONS
              </h3>

              <p className="preserve-lines">
                {formData.certifications}
              </p>

            </section>
          )}

        </div>

      </div>

    </div>
  );
}

export default ResumeBuilder;
