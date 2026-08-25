import { useEffect, useState } from "react";

// =====================================================
// BACKEND URL
// =====================================================

const BACKEND_URL = import.meta.env.VITE_API_URL;

const JOBS_PER_PAGE = 20;

// =====================================================
// EXPERIENCE OPTIONS
// =====================================================

const EXPERIENCE_OPTIONS = [
  {
    value: "fresher",
    label: "Fresher / 0–1 Years",
    icon: "🎓",
  },
  {
    value: "1-3",
    label: "1–3 Years",
    icon: "💼",
  },
  {
    value: "3+",
    label: "3+ Years",
    icon: "🚀",
  },
  {
    value: "all",
    label: "All Experience Levels",
    icon: "🌎",
  },
];

function JobRecommendations() {
  // =====================================================
  // JOB DATA
  // =====================================================

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  // =====================================================
  // EXPERIENCE
  // =====================================================

  const [experienceLevel, setExperienceLevel] = useState("all");

  // =====================================================
  // LOAD JOBS
  // =====================================================

  const loadJobs = async (
    customFilters = null,
    requestedPage = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const filters =
        customFilters || {
          search,
          jobType,
          workMode,
          location,
          skills,
          experienceLevel,
        };

      const params = new URLSearchParams();

      // ===================================================
      // SEARCH
      // ===================================================

      if (filters.search?.trim()) {
        params.append(
          "search",
          filters.search.trim()
        );
      }

      // ===================================================
      // JOB TYPE
      // ===================================================

      if (filters.jobType) {
        params.append(
          "jobType",
          filters.jobType
        );
      }

      // ===================================================
      // WORK MODE
      // ===================================================

      if (filters.workMode) {
        params.append(
          "workMode",
          filters.workMode
        );
      }

      // ===================================================
      // LOCATION
      // ===================================================

      if (filters.location?.trim()) {
        params.append(
          "location",
          filters.location.trim()
        );
      }

      // ===================================================
      // SKILLS
      // ===================================================

      if (filters.skills?.trim()) {
        params.append(
          "skills",
          filters.skills.trim()
        );
      }

      // ===================================================
      // EXPERIENCE
      // ===================================================

      if (filters.experienceLevel) {
        params.append(
          "experienceLevel",
          filters.experienceLevel
        );
      }

      // ===================================================
      // PAGINATION
      // ===================================================

      params.append(
        "page",
        String(requestedPage)
      );

      params.append(
        "limit",
        String(JOBS_PER_PAGE)
      );

      const url =
        `${BACKEND_URL}/api/jobs/recommendations?${params.toString()}`;

      console.log(
        "===================================="
      );

      console.log(
        "JOB REQUEST:",
        url
      );

      console.log(
        "FILTERS:",
        filters
      );

      console.log(
        "PAGE:",
        requestedPage
      );

      console.log(
        "===================================="
      );

      // ===================================================
      // FETCH
      // ===================================================

      const response = await fetch(url);

      const text = await response.text();

      console.log(
        "HTTP STATUS:",
        response.status
      );

      console.log(
        "RAW BACKEND RESPONSE:",
        text
      );

      // ===================================================
      // PARSE JSON
      // ===================================================

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned invalid JSON."
        );
      }

      // ===================================================
      // HTTP ERROR
      // ===================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Server error: ${response.status}`
        );
      }

      // ===================================================
      // API ERROR
      // ===================================================

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load jobs."
        );
      }

      // ===================================================
      // JOB DATA
      // ===================================================

      const receivedJobs =
        Array.isArray(result.data)
          ? result.data
          : [];

      setJobs(receivedJobs);

      // ===================================================
      // TOTAL
      // ===================================================

      const backendTotal =
        Number(result.total) || 0;

      setTotalJobs(backendTotal);

      // ===================================================
      // PAGINATION
      // ===================================================

      if (result.pagination) {
        const backendPage =
          Number(
            result.pagination.page
          ) || requestedPage;

        const backendLimit =
          Number(
            result.pagination.limit
          ) || JOBS_PER_PAGE;

        const backendTotalPages =
          Number(
            result.pagination.total_pages
          ) || 0;

        setCurrentPage(
          backendPage
        );

        setTotalPages(
          backendTotalPages
        );

        setHasNextPage(
          Boolean(
            result.pagination
              .has_next_page
          )
        );

        setHasPreviousPage(
          Boolean(
            result.pagination
              .has_previous_page
          )
        );

        console.log(
          "PAGINATION:",
          {
            page: backendPage,
            limit: backendLimit,
            totalPages:
              backendTotalPages,
            hasNext:
              result.pagination
                .has_next_page,
            hasPrevious:
              result.pagination
                .has_previous_page,
          }
        );
      } else {
        const calculatedTotalPages =
          Math.ceil(
            backendTotal /
              JOBS_PER_PAGE
          );

        setCurrentPage(
          requestedPage
        );

        setTotalPages(
          calculatedTotalPages
        );

        setHasPreviousPage(
          requestedPage > 1
        );

        setHasNextPage(
          requestedPage <
            calculatedTotalPages
        );
      }
    } catch (err) {
      console.error(
        "Job Recommendation Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load jobs."
      );

      setJobs([]);
      setTotalJobs(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FIRST LOAD
  // =====================================================

  useEffect(() => {
    loadJobs(null, 1);
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const filters = {
      search,
      jobType,
      workMode,
      location,
      skills,
      experienceLevel,
    };

    setCurrentPage(1);

    loadJobs(
      filters,
      1
    );
  };

  // =====================================================
  // EXPERIENCE CHANGE
  // =====================================================

  const handleExperienceChange = (
    value
  ) => {
    setExperienceLevel(
      value
    );

    const filters = {
      search,
      jobType,
      workMode,
      location,
      skills,
      experienceLevel:
        value,
    };

    setCurrentPage(1);

    loadJobs(
      filters,
      1
    );
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    const emptyFilters = {
      search: "",
      jobType: "",
      workMode: "",
      location: "",
      skills: "",
      experienceLevel:
        "all",
    };

    setSearch("");
    setJobType("");
    setWorkMode("");
    setLocation("");
    setSkills("");
    setExperienceLevel(
      "all"
    );

    setCurrentPage(1);

    loadJobs(
      emptyFilters,
      1
    );
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter"
    ) {
      handleSearch();
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  const goToPage = (
    page
  ) => {
    if (loading) {
      return;
    }

    if (page < 1) {
      return;
    }

    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      return;
    }

    const filters = {
      search,
      jobType,
      workMode,
      location,
      skills,
      experienceLevel,
    };

    setCurrentPage(page);

    loadJobs(
      filters,
      page
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const handlePrevious = () => {
    if (
      hasPreviousPage &&
      currentPage > 1
    ) {
      goToPage(
        currentPage - 1
      );
    }
  };

  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {
    if (
      hasNextPage &&
      currentPage <
        totalPages
    ) {
      goToPage(
        currentPage + 1
      );
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getMatchedSkills = (
    job
  ) =>
    Array.isArray(
      job.matched_skills
    )
      ? job.matched_skills
      : [];

  const getImproveSkills = (
    job
  ) =>
    Array.isArray(
      job.skills_to_improve
    )
      ? job.skills_to_improve
      : [];

  const getJobSkills = (
    job
  ) =>
    Array.isArray(
      job.skills
    )
      ? job.skills
      : [];

  // =====================================================
  // FORMAT JOB TYPE
  // =====================================================

  const formatJobType = (
    value
  ) => {
    if (
      !value ||
      value ===
        "Not specified"
    ) {
      return "Not specified";
    }

    return String(value)
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // FORMAT WORK MODE
  // =====================================================

  const formatWorkMode = (
    value
  ) => {
    if (
      !value ||
      value ===
        "Not specified"
    ) {
      return "Not specified";
    }

    return String(value)
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // FORMAT EXPERIENCE
  // =====================================================

  const formatExperience = (
    job
  ) => {
    const min =
      job.experience_min;

    const max =
      job.experience_max;

    if (
      min !== null &&
      min !== undefined &&
      max !== null &&
      max !== undefined
    ) {
      if (
        Number(min) === 0 &&
        Number(max) <= 1
      ) {
        return "Fresher / 0–1 Years";
      }

      return `${min}–${max} years`;
    }

    if (
      min !== null &&
      min !== undefined
    ) {
      if (
        Number(min) === 0
      ) {
        return "Fresher / Entry Level";
      }

      return `${min}+ years`;
    }

    switch (
      job.experience_level
    ) {
      case "fresher":
        return "Fresher / Entry Level";

      case "1-3":
        return "1–3 Years";

      case "3+":
        return "3+ Years";

      case "all":
        return "Experience not specified";

      default:
        return "Experience not specified";
    }
  };

  // =====================================================
  // FORMAT SALARY
  // =====================================================

  const formatSalary = (
    job
  ) => {
    if (
      job.salary &&
      job.salary !==
        "Not specified"
    ) {
      return job.salary;
    }

    if (
      job.salary_min !==
        null &&
      job.salary_min !==
        undefined &&
      job.salary_max !==
        null &&
      job.salary_max !==
        undefined
    ) {
      return `${job.salary_min} - ${job.salary_max}`;
    }

    if (
      job.salary_min !==
        null &&
      job.salary_min !==
        undefined
    ) {
      return `From ${job.salary_min}`;
    }

    return "Not specified";
  };

  // =====================================================
  // MATCH COLOR
  // =====================================================

  const getMatchColor = (
    score
  ) => {
    if (score >= 70) {
      return "#16a34a";
    }

    if (score >= 40) {
      return "#f59e0b";
    }

    return "#94a3b8";
  };

  // =====================================================
  // EXPERIENCE COLOR
  // =====================================================

  const getExperienceColor = (
    level
  ) => {
    if (
      level ===
      "fresher"
    ) {
      return {
        background:
          "#dcfce7",
        color:
          "#166534",
      };
    }

    if (
      level ===
      "1-3"
    ) {
      return {
        background:
          "#dbeafe",
        color:
          "#1d4ed8",
      };
    }

    if (
      level ===
      "3+"
    ) {
      return {
        background:
          "#fef3c7",
        color:
          "#92400e",
      };
    }

    return {
      background:
        "#f1f5f9",
      color:
        "#475569",
    };
  };

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const getPageNumbers = () => {
    if (
      totalPages <= 1
    ) {
      return [];
    }

    if (
      totalPages <= 7
    ) {
      return Array.from(
        {
          length:
            totalPages,
        },
        (_, index) =>
          index + 1
      );
    }

    if (
      currentPage <= 4
    ) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    if (
      currentPage >=
      totalPages - 3
    ) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers =
    getPageNumbers();

  // =====================================================
  // CURRENT EXPERIENCE
  // =====================================================

  const selectedExperience =
    EXPERIENCE_OPTIONS.find(
      (item) =>
        item.value ===
        experienceLevel
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "linear-gradient(180deg,#f8fafc,#eef2ff)",
        padding:
          "32px 20px",
        fontFamily:
          "Inter, Arial, sans-serif",
        color:
          "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth:
            "1250px",
          margin:
            "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            marginBottom:
              "28px",
          }}
        >
          <button
            onClick={() =>
              (window.location.href =
                "/dashboard")
            }
            style={{
              border:
                "none",
              background:
                "transparent",
              cursor:
                "pointer",
              fontSize:
                "15px",
              color:
                "#475569",
              padding: 0,
              marginBottom:
                "18px",
            }}
          >
            ← Back to Dashboard
          </button>

          <h1
            style={{
              fontSize:
                "36px",
              margin:
                "0 0 8px",
              fontWeight:
                "800",
              letterSpacing:
                "-1px",
            }}
          >
            Find Your Next Job
          </h1>

          <p
            style={{
              margin: 0,
              color:
                "#64748b",
              fontSize:
                "16px",
            }}
          >
            Find real job opportunities
            based on your skills,
            location and experience level.
          </p>
        </div>

        {/* SEARCH PANEL */}

        <div
          style={{
            background:
              "white",
            borderRadius:
              "20px",
            padding:
              "25px",
            boxShadow:
              "0 10px 35px rgba(15,23,42,0.07)",
            marginBottom:
              "28px",
            border:
              "1px solid #e2e8f0",
          }}
        >
          {/* MAIN SEARCH */}

          <div
            style={{
              display:
                "flex",
              gap:
                "10px",
              marginBottom:
                "22px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              style={{
                flex:
                  "1 1 500px",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Search jobs, companies, skills..."
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "15px 18px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius:
                    "11px",
                  fontSize:
                    "15px",
                  outline:
                    "none",
                }}
              />
            </div>

            <button
              onClick={
                handleSearch
              }
              disabled={
                loading
              }
              style={{
                background:
                  loading
                    ? "#93c5fd"
                    : "#2563eb",
                color:
                  "white",
                border:
                  "none",
                padding:
                  "0 25px",
                minHeight:
                  "50px",
                borderRadius:
                  "11px",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "700",
                fontSize:
                  "15px",
              }}
            >
              🔍 Search Jobs
            </button>
          </div>

          {/* EXPERIENCE */}

          <div
            style={{
              marginBottom:
                "22px",
            }}
          >
            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "700",
                fontSize:
                  "14px",
                marginBottom:
                  "10px",
              }}
            >
              🎓 Experience Level
            </label>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap:
                  "10px",
              }}
            >
              {EXPERIENCE_OPTIONS.map(
                (option) => {
                  const active =
                    experienceLevel ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      onClick={() =>
                        handleExperienceChange(
                          option.value
                        )
                      }
                      disabled={
                        loading
                      }
                      style={{
                        padding:
                          "13px 14px",
                        border:
                          active
                            ? "2px solid #2563eb"
                            : "1px solid #cbd5e1",
                        background:
                          active
                            ? "#eff6ff"
                            : "white",
                        color:
                          active
                            ? "#1d4ed8"
                            : "#475569",
                        borderRadius:
                          "11px",
                        cursor:
                          loading
                            ? "not-allowed"
                            : "pointer",
                        fontWeight:
                          active
                            ? "800"
                            : "600",
                        textAlign:
                          "left",
                      }}
                    >
                      <span
                        style={{
                          marginRight:
                            "7px",
                        }}
                      >
                        {
                          option.icon
                        }
                      </span>

                      {
                        option.label
                      }
                    </button>
                  );
                }
              )}
            </div>

            <div
              style={{
                marginTop:
                  "10px",
                padding:
                  "10px 12px",
                background:
                  "#f8fafc",
                borderRadius:
                  "9px",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Showing:{" "}
              <strong
                style={{
                  color:
                    "#1d4ed8",
                }}
              >
                {
                  selectedExperience?.label
                }
              </strong>
            </div>
          </div>

          {/* OTHER FILTERS */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap:
                "15px",
            }}
          >
            {/* LOCATION */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                📍 Location
              </label>

              <input
                type="text"
                value={
                  location
                }
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Bangalore, Mumbai..."
                style={
                  inputStyle
                }
              />
            </div>

            {/* JOB TYPE */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                💼 Job Type
              </label>

              <select
                value={
                  jobType
                }
                onChange={(e) =>
                  setJobType(
                    e.target.value
                  )
                }
                style={
                  selectStyle
                }
              >
                <option value="">
                  All Job Types
                </option>

                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>
              </select>
            </div>

            {/* WORK MODE */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                🏢 Work Mode
              </label>

              <select
                value={
                  workMode
                }
                onChange={(e) =>
                  setWorkMode(
                    e.target.value
                  )
                }
                style={
                  selectStyle
                }
              >
                <option value="">
                  All Work Modes
                </option>

                <option value="Remote">
                  Remote
                </option>

                <option value="Hybrid">
                  Hybrid
                </option>

                <option value="On-site">
                  On-site
                </option>
              </select>
            </div>

            {/* SKILLS */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                🛠️ Skills
              </label>

              <input
                type="text"
                value={
                  skills
                }
                onChange={(e) =>
                  setSkills(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Python, React, SQL..."
                style={
                  inputStyle
                }
              />
            </div>
          </div>

          {/* CLEAR */}

          <div
            style={{
              marginTop:
                "18px",
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "15px",
              flexWrap:
                "wrap",
            }}
          >
            <span
              style={{
                fontSize:
                  "13px",
                color:
                  "#64748b",
              }}
            >
              🔎 Real job listings
              are fetched from Adzuna
              and filtered by experience.
            </span>

            <button
              onClick={
                handleClear
              }
              disabled={
                loading
              }
              style={{
                border:
                  "1px solid #cbd5e1",
                background:
                  "white",
                color:
                  "#475569",
                padding:
                  "9px 16px",
                borderRadius:
                  "8px",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "600",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ERROR */}

        {!loading &&
          error && (
            <div
              style={{
                background:
                  "#fee2e2",
                color:
                  "#991b1b",
                padding:
                  "18px",
                borderRadius:
                  "12px",
                marginBottom:
                  "25px",
                border:
                  "1px solid #fecaca",
              }}
            >
              <strong>
                Unable to load jobs
              </strong>

              <div
                style={{
                  marginTop:
                    "6px",
                }}
              >
                {error}
              </div>

              <button
                onClick={() =>
                  loadJobs(
                    null,
                    currentPage
                  )
                }
                style={{
                  marginTop:
                    "12px",
                  border:
                    "none",
                  background:
                    "#991b1b",
                  color:
                    "white",
                  padding:
                    "8px 14px",
                  borderRadius:
                    "7px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Retry
              </button>
            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div
            style={{
              background:
                "white",
              padding:
                "45px 20px",
              borderRadius:
                "16px",
              textAlign:
                "center",
              marginBottom:
                "25px",
            }}
          >
            <div
              style={{
                fontSize:
                  "34px",
                marginBottom:
                  "12px",
              }}
            >
              🔎
            </div>

            <h2
              style={{
                margin:
                  "0 0 8px",
              }}
            >
              Finding matching jobs...
            </h2>

            <p
              style={{
                color:
                  "#64748b",
                margin: 0,
              }}
            >
              Checking real job listings
              for your selected experience level.
            </p>
          </div>
        )}

        {/* SUMMARY */}

        {!loading &&
          !error && (
            <div
              style={{
                marginBottom:
                  "18px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
                gap:
                  "10px",
              }}
            >
              <div
                style={{
                  color:
                    "#475569",
                }}
              >
                Showing{" "}
                <strong>
                  {jobs.length}
                </strong>{" "}
                jobs

                {totalJobs >
                  0 && (
                  <>
                    {" "}
                    from{" "}
                    <strong>
                      {
                        totalJobs
                      }
                    </strong>{" "}
                    results
                  </>
                )}
              </div>

              <div
                style={{
                  background:
                    "#eff6ff",
                  color:
                    "#1d4ed8",
                  padding:
                    "7px 12px",
                  borderRadius:
                    "20px",
                  fontSize:
                    "13px",
                  fontWeight:
                    "700",
                }}
              >
                {
                  selectedExperience?.icon
                }{" "}
                {
                  selectedExperience?.label
                }
              </div>
            </div>
          )}

        {/* NO JOBS */}

        {!loading &&
          !error &&
          jobs.length ===
            0 && (
            <div
              style={{
                background:
                  "white",
                padding:
                  "60px 25px",
                borderRadius:
                  "16px",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  fontSize:
                    "48px",
                  marginBottom:
                    "15px",
                }}
              >
                🔍
              </div>

              <h2>
                No matching jobs found
              </h2>

              <p
                style={{
                  color:
                    "#64748b",
                  marginBottom:
                    "20px",
                }}
              >
                Try another experience
                level, location, skill
                or job title.
              </p>

              <button
                onClick={
                  handleClear
                }
                style={{
                  background:
                    "#2563eb",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "11px 20px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* JOB CARDS */}

        {!loading &&
          !error &&
          jobs.length >
            0 && (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(360px,1fr))",
                gap:
                  "20px",
              }}
            >
              {jobs.map(
                (
                  job,
                  index
                ) => {
                  const matchedSkills =
                    getMatchedSkills(
                      job
                    );

                  const improveSkills =
                    getImproveSkills(
                      job
                    );

                  const jobSkills =
                    getJobSkills(
                      job
                    );

                  const score =
                    Number(
                      job.match_score
                    ) || 0;

                  const experienceStyle =
                    getExperienceColor(
                      job.experience_level
                    );

                  return (
                    <div
                      key={
                        job.id ||
                        `${currentPage}-${index}`
                      }
                      style={{
                        background:
                          "white",
                        borderRadius:
                          "17px",
                        padding:
                          "24px",
                        boxShadow:
                          "0 5px 20px rgba(15,23,42,0.06)",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        border:
                          "1px solid #e2e8f0",
                      }}
                    >
                      {/* TITLE */}

                      <h2
                        style={{
                          fontSize:
                            "20px",
                          lineHeight:
                            "1.4",
                          color:
                            "#0f172a",
                          margin:
                            "0 0 7px",
                        }}
                      >
                        {job.title ||
                          "Job Position"}
                      </h2>

                      {/* COMPANY */}

                      <div
                        style={{
                          color:
                            "#2563eb",
                          fontWeight:
                            "700",
                          fontSize:
                            "15px",
                          marginBottom:
                            "14px",
                        }}
                      >
                        {job.company ||
                          "Company not specified"}
                      </div>

                      {/* EXPERIENCE BADGE */}

                      <div
                        style={{
                          display:
                            "inline-flex",
                          alignSelf:
                            "flex-start",
                          background:
                            experienceStyle.background,
                          color:
                            experienceStyle.color,
                          padding:
                            "7px 11px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "12px",
                          fontWeight:
                            "800",
                          marginBottom:
                            "16px",
                        }}
                      >
                        🎓{" "}
                        {formatExperience(
                          job
                        )}
                      </div>

                      {/* JOB INFO */}

                      <div
                        style={{
                          color:
                            "#475569",
                          fontSize:
                            "14px",
                          lineHeight:
                            "1.9",
                          marginBottom:
                            "18px",
                        }}
                      >
                        <div>
                          📍{" "}
                          {job.location ||
                            "Location not specified"}
                        </div>

                        <div>
                          💰{" "}
                          {formatSalary(
                            job
                          )}
                        </div>

                        <div>
                          💼{" "}
                          {formatJobType(
                            job.job_type
                          )}
                        </div>

                        <div>
                          🏢{" "}
                          {formatWorkMode(
                            job.work_mode
                          )}
                        </div>
                      </div>

                      {/* EXPERIENCE REASON */}

                      {job.experience_reason && (
                        <div
                          style={{
                            background:
                              "#f8fafc",
                            border:
                              "1px solid #e2e8f0",
                            padding:
                              "10px 12px",
                            borderRadius:
                              "9px",
                            marginBottom:
                              "17px",
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          <strong>
                            Experience check:
                          </strong>{" "}
                          {
                            job.experience_reason
                          }
                        </div>
                      )}

                      {/* MATCH CONFIDENCE */}

                      {job.experience_confidence && (
                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                            marginBottom:
                              "14px",
                          }}
                        >
                          Experience confidence:{" "}
                          <strong>
                            {
                              job.experience_confidence
                            }
                          </strong>
                        </div>
                      )}

                      {/* MATCH SCORE */}

                      <div
                        style={{
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e2e8f0",
                          padding:
                            "12px",
                          borderRadius:
                            "9px",
                          marginBottom:
                            "18px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            marginBottom:
                              "7px",
                          }}
                        >
                          <strong>
                            Resume / Skill Match
                          </strong>

                          <strong
                            style={{
                              color:
                                getMatchColor(
                                  score
                                ),
                            }}
                          >
                            {score}%
                          </strong>
                        </div>

                        <div
                          style={{
                            height:
                              "7px",
                            background:
                              "#e2e8f0",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  score,
                                  0
                                ),
                                100
                              )}%`,
                              height:
                                "100%",
                              background:
                                getMatchColor(
                                  score
                                ),
                            }}
                          />
                        </div>
                      </div>

                      {/* MATCHED SKILLS */}

                      {matchedSkills.length >
                        0 && (
                        <div
                          style={{
                            marginBottom:
                              "17px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize:
                                "14px",
                              margin:
                                "0 0 9px",
                              color:
                                "#15803d",
                            }}
                          >
                            ✅ Matched Skills
                          </h3>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap:
                                "7px",
                            }}
                          >
                            {matchedSkills.map(
                              (
                                skill,
                                skillIndex
                              ) => (
                                <span
                                  key={
                                    skillIndex
                                  }
                                  style={{
                                    background:
                                      "#dcfce7",
                                    color:
                                      "#166534",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "20px",
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  {
                                    skill
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* IMPROVE SKILLS */}

                      {improveSkills.length >
                        0 && (
                        <div
                          style={{
                            marginBottom:
                              "17px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize:
                                "14px",
                              margin:
                                "0 0 9px",
                              color:
                                "#b45309",
                            }}
                          >
                            ⚠️ Skills to Improve
                          </h3>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap:
                                "7px",
                            }}
                          >
                            {improveSkills.map(
                              (
                                skill,
                                skillIndex
                              ) => (
                                <span
                                  key={
                                    skillIndex
                                  }
                                  style={{
                                    background:
                                      "#fef3c7",
                                    color:
                                      "#92400e",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "20px",
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  {
                                    skill
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* REQUIRED SKILLS */}

                      {jobSkills.length >
                        0 && (
                        <div
                          style={{
                            marginBottom:
                              "18px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize:
                                "14px",
                              margin:
                                "0 0 9px",
                              color:
                                "#334155",
                            }}
                          >
                            🛠️ Required Skills
                          </h3>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap:
                                "7px",
                            }}
                          >
                            {jobSkills.map(
                              (
                                skill,
                                skillIndex
                              ) => (
                                <span
                                  key={
                                    skillIndex
                                  }
                                  style={{
                                    background:
                                      "#eff6ff",
                                    color:
                                      "#1d4ed8",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "20px",
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  {
                                    skill
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* SOURCE */}

                      {job.source && (
                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#94a3b8",
                            marginBottom:
                              "12px",
                          }}
                        >
                          Source:{" "}
                          {job.source}
                        </div>
                      )}

                      {/* DESCRIPTION */}

                      <p
                        style={{
                          color:
                            "#64748b",
                          lineHeight:
                            "1.6",
                          fontSize:
                            "14px",
                          margin:
                            "0 0 20px",
                          flexGrow:
                            1,
                        }}
                      >
                        {job.description ||
                          "No description available."}
                      </p>

                      {/* APPLY */}

                      {job.apply_url ? (
                        <a
                          href={
                            job.apply_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display:
                              "block",
                            textAlign:
                              "center",
                            background:
                              "#2563eb",
                            color:
                              "white",
                            padding:
                              "12px",
                            borderRadius:
                              "9px",
                            textDecoration:
                              "none",
                            fontWeight:
                              "700",
                          }}
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <button
                          disabled
                          style={{
                            width:
                              "100%",
                            background:
                              "#cbd5e1",
                            color:
                              "#475569",
                            border:
                              "none",
                            padding:
                              "12px",
                            borderRadius:
                              "9px",
                            fontWeight:
                              "600",
                          }}
                        >
                          Apply Link Not Available
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

        {/* PAGINATION */}

        {!loading &&
          !error &&
          jobs.length >
            0 &&
          totalPages >
            1 && (
            <div
              style={{
                background:
                  "white",
                marginTop:
                  "30px",
                padding:
                  "20px",
                borderRadius:
                  "16px",
                border:
                  "1px solid #e2e8f0",
                display:
                  "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                gap:
                  "8px",
                flexWrap:
                  "wrap",
              }}
            >
              {/* PREVIOUS */}

              <button
                onClick={
                  handlePrevious
                }
                disabled={
                  loading ||
                  !hasPreviousPage
                }
                style={{
                  ...pageButtonStyle,
                  background:
                    !hasPreviousPage
                      ? "#f1f5f9"
                      : "white",
                  color:
                    !hasPreviousPage
                      ? "#94a3b8"
                      : "#334155",
                }}
              >
                ← Previous
              </button>

              {/* PAGE NUMBERS */}

              {pageNumbers.map(
                (
                  page,
                  index
                ) => {
                  if (
                    page ===
                    "..."
                  ) {
                    return (
                      <span
                        key={`dots-${index}`}
                        style={{
                          padding:
                            "10px 6px",
                          color:
                            "#64748b",
                          fontWeight:
                            "600",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  const active =
                    page ===
                    currentPage;

                  return (
                    <button
                      key={
                        page
                      }
                      onClick={() =>
                        goToPage(
                          page
                        )
                      }
                      disabled={
                        loading
                      }
                      style={{
                        minWidth:
                          "42px",
                        padding:
                          "10px 12px",
                        border:
                          active
                            ? "1px solid #2563eb"
                            : "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          active
                            ? "#2563eb"
                            : "white",
                        color:
                          active
                            ? "white"
                            : "#334155",
                        cursor:
                          loading
                            ? "not-allowed"
                            : "pointer",
                        fontWeight:
                          "600",
                      }}
                    >
                      {
                        page
                      }
                    </button>
                  );
                }
              )}

              {/* NEXT */}

              <button
                onClick={
                  handleNext
                }
                disabled={
                  loading ||
                  !hasNextPage
                }
                style={{
                  ...pageButtonStyle,
                  background:
                    !hasNextPage
                      ? "#f1f5f9"
                      : "white",
                  color:
                    !hasNextPage
                      ? "#94a3b8"
                      : "#334155",
                }}
              >
                Next →
              </button>
            </div>
          )}

        {/* FOOTER */}

        {!loading &&
          !error &&
          totalJobs >
            0 && (
            <div
              style={{
                textAlign:
                  "center",
                color:
                  "#64748b",
                fontSize:
                  "13px",
                marginTop:
                  "15px",
                marginBottom:
                  "20px",
              }}
            >
              Page{" "}
              <strong>
                {
                  currentPage
                }
              </strong>{" "}
              of{" "}
              <strong>
                {
                  totalPages
                }
              </strong>{" "}
              •{" "}
              <strong>
                {
                  totalJobs
                }
              </strong>{" "}
              matching jobs
            </div>
          )}
      </div>
    </div>
  );
}

// =====================================================
// COMMON STYLES
// =====================================================

const labelStyle = {
  display:
    "block",
  fontWeight:
    "600",
  fontSize:
    "14px",
  marginBottom:
    "7px",
};

const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "11px 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius:
    "8px",
  fontSize:
    "14px",
  outline:
    "none",
  background:
    "white",
};

const selectStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "11px 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius:
    "8px",
  fontSize:
    "14px",
  background:
    "white",
  cursor:
    "pointer",
};

const pageButtonStyle = {
  padding:
    "10px 16px",
  border:
    "1px solid #cbd5e1",
  borderRadius:
    "8px",
  cursor:
    "pointer",
  fontWeight:
    "600",
};

export default JobRecommendations;