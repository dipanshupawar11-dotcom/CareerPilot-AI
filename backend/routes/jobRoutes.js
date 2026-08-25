const express = require("express");
const router = express.Router();

require("dotenv").config();

// =========================================================
// CONFIG
// =========================================================

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

const DEFAULT_COUNTRY = "in";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const SEARCH_PAGES = 10;
const MAX_RAW_JOBS = 500;

// =========================================================
// EXPERIENCE LEVELS
// =========================================================

const EXPERIENCE_LEVELS = {
  fresher: "fresher",
  junior: "1-3",
  experienced: "3+",
  all: "all",
};

// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s.+#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// =========================================================
// JOB TEXT
// =========================================================

function getJobText(job) {
  return normalizeText(
    [
      job.title,
      job.description,
      job.category?.label,
      job.category?.tag,
      job.company?.display_name,
      job.location?.display_name,
      Array.isArray(job.location?.area)
        ? job.location.area.join(" ")
        : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
}

// =========================================================
// EXPERIENCE DETECTION
// =========================================================

function detectExperience(job) {
  const title = normalizeText(job.title);
  const description = normalizeText(job.description);
  const text = `${title} ${description}`;

  // -------------------------------------------------------
  // FRESHER / ENTRY LEVEL
  // -------------------------------------------------------

  const fresherPatterns = [
    /\bfresher\b/i,
    /\bfreshers\b/i,
    /\bfreshers can apply\b/i,
    /\bno experience\b/i,
    /\bwithout experience\b/i,
    /\bentry level\b/i,
    /\bentry-level\b/i,
    /\bgraduate trainee\b/i,
    /\bgraduate engineer trainee\b/i,
    /\bengineering trainee\b/i,
    /\btrainee\b/i,
    /\brecent graduate\b/i,
    /\brecent graduates\b/i,
    /\bgraduates can apply\b/i,
    /\bintern\b/i,
    /\binternship\b/i,
    /\bapprentice\b/i,
    /\bapprenticeship\b/i,
  ];

  for (const pattern of fresherPatterns) {
    if (pattern.test(text)) {
      return {
        level: EXPERIENCE_LEVELS.fresher,
        minYears: 0,
        maxYears: 1,
        confidence: "high",
        reason: "Fresher / entry-level requirement detected",
      };
    }
  }

  // -------------------------------------------------------
  // EXPERIENCE RANGE
  // -------------------------------------------------------

  const rangePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/gi,
  ];

  for (const pattern of rangePatterns) {
    const match = pattern.exec(text);

    if (!match) continue;

    const minYears = Number(match[1]);
    const maxYears = Number(match[2]);

    if (Number.isNaN(minYears) || Number.isNaN(maxYears)) {
      continue;
    }

    if (minYears === 0 && maxYears <= 2) {
      return {
        level: EXPERIENCE_LEVELS.fresher,
        minYears,
        maxYears,
        confidence: "high",
        reason: `${minYears}-${maxYears} years experience`,
      };
    }

    if (minYears < 3 && maxYears <= 3) {
      return {
        level: EXPERIENCE_LEVELS.junior,
        minYears,
        maxYears,
        confidence: "high",
        reason: `${minYears}-${maxYears} years experience`,
      };
    }

    if (minYears >= 3) {
      return {
        level: EXPERIENCE_LEVELS.experienced,
        minYears,
        maxYears,
        confidence: "high",
        reason: `${minYears}-${maxYears} years experience`,
      };
    }

    if (minYears < 3 && maxYears > 3) {
      return {
        level: EXPERIENCE_LEVELS.junior,
        minYears,
        maxYears,
        confidence: "medium",
        reason: `${minYears}-${maxYears} years experience`,
      };
    }
  }

  // -------------------------------------------------------
  // MINIMUM EXPERIENCE
  // -------------------------------------------------------

  const minimumPatterns = [
    /(\d+(?:\.\d+)?)\s*\+\s*(?:years?|yrs?)/gi,
    /(?:minimum|min|at least)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/gi,
    /(?:experience|required|exp)[^.]{0,80}?(\d+(?:\.\d+)?)\s*\+\s*(?:years?|yrs?)/gi,
  ];

  for (const pattern of minimumPatterns) {
    const match = pattern.exec(text);

    if (!match) continue;

    const minYears = Number(match[1]);

    if (Number.isNaN(minYears)) continue;

    if (minYears <= 1) {
      return {
        level: EXPERIENCE_LEVELS.fresher,
        minYears,
        maxYears: 1,
        confidence: "high",
        reason: `${minYears}+ years experience`,
      };
    }

    if (minYears < 3) {
      return {
        level: EXPERIENCE_LEVELS.junior,
        minYears,
        maxYears: null,
        confidence: "high",
        reason: `${minYears}+ years experience`,
      };
    }

    return {
      level: EXPERIENCE_LEVELS.experienced,
      minYears,
      maxYears: null,
      confidence: "high",
      reason: `${minYears}+ years experience`,
    };
  }

  // -------------------------------------------------------
  // SIMPLE EXPERIENCE
  // -------------------------------------------------------

  const simplePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/gi,
    /experience\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/gi,
  ];

  for (const pattern of simplePatterns) {
    const match = pattern.exec(text);

    if (!match) continue;

    const years = Number(match[1]);

    if (Number.isNaN(years)) continue;

    if (years <= 1) {
      return {
        level: EXPERIENCE_LEVELS.fresher,
        minYears: years,
        maxYears: 1,
        confidence: "medium",
        reason: `${years} years experience`,
      };
    }

    if (years < 3) {
      return {
        level: EXPERIENCE_LEVELS.junior,
        minYears: years,
        maxYears: null,
        confidence: "medium",
        reason: `${years} years experience`,
      };
    }

    return {
      level: EXPERIENCE_LEVELS.experienced,
      minYears: years,
      maxYears: null,
      confidence: "medium",
      reason: `${years} years experience`,
    };
  }

  // -------------------------------------------------------
  // SENIOR TITLES
  // -------------------------------------------------------

  if (
    /\bsenior\b/i.test(title) ||
    /\bsr\.?\b/i.test(title) ||
    /\blead\b/i.test(title) ||
    /\bprincipal\b/i.test(title) ||
    /\bmanager\b/i.test(title) ||
    /\barchitect\b/i.test(title) ||
    /\bdirector\b/i.test(title)
  ) {
    return {
      level: EXPERIENCE_LEVELS.experienced,
      minYears: 3,
      maxYears: null,
      confidence: "medium",
      reason: "Senior-level job title detected",
    };
  }

  // -------------------------------------------------------
  // JUNIOR TITLES
  // -------------------------------------------------------

  if (
    /\bjunior\b/i.test(title) ||
    /\bjr\.?\b/i.test(title) ||
    /\bassociate\b/i.test(title)
  ) {
    return {
      level: EXPERIENCE_LEVELS.junior,
      minYears: 1,
      maxYears: 3,
      confidence: "medium",
      reason: "Junior / associate-level job title detected",
    };
  }

  // -------------------------------------------------------
  // FRESHER TITLES
  // -------------------------------------------------------

  if (
    /\btrainee\b/i.test(title) ||
    /\bgraduate\b/i.test(title) ||
    /\bgraduate engineer\b/i.test(title) ||
    /\bsoftware engineer trainee\b/i.test(title) ||
    /\bdeveloper trainee\b/i.test(title) ||
    /\bengineering trainee\b/i.test(title) ||
    /\bentry level\b/i.test(title)
  ) {
    return {
      level: EXPERIENCE_LEVELS.fresher,
      minYears: 0,
      maxYears: 1,
      confidence: "medium",
      reason: "Fresher-friendly job title detected",
    };
  }

  // -------------------------------------------------------
  // UNKNOWN
  // -------------------------------------------------------

  return {
    level: EXPERIENCE_LEVELS.all,
    minYears: null,
    maxYears: null,
    confidence: "low",
    reason: "No clear experience requirement found",
  };
}

// =========================================================
// EXPERIENCE MATCH
// =========================================================

function matchesExperience(job, requestedLevel) {
  if (!requestedLevel || requestedLevel === "all") {
    return true;
  }

  const experience = detectExperience(job);

  if (requestedLevel === "fresher") {
    return experience.level === EXPERIENCE_LEVELS.fresher;
  }

  if (requestedLevel === "1-3") {
    return experience.level === EXPERIENCE_LEVELS.junior;
  }

  if (requestedLevel === "3+") {
    return experience.level === EXPERIENCE_LEVELS.experienced;
  }

  return true;
}

// =========================================================
// COMMON SKILLS
// =========================================================

const COMMON_SKILLS = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c++",
  "c#",
  "react",
  "react.js",
  "next.js",
  "node",
  "node.js",
  "express",
  "django",
  "flask",
  "fastapi",
  "html",
  "html5",
  "css",
  "css3",
  "tailwind",
  "bootstrap",
  "sql",
  "mysql",
  "postgresql",
  "mongodb",
  "redis",
  "git",
  "github",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "power bi",
  "excel",
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "ai",
  "data analysis",
  "pandas",
  "numpy",
  "scikit-learn",
  "tensorflow",
  "pytorch",
  "dsa",
  "rest api",
  "api",
  "pytest",
  "jenkins",
  "linux",
  "angular",
  "vue",
  "figma",
  "spring",
  "spring boot",
  "php",
  "laravel",
  "ruby",
  "rails",
];

// =========================================================
// SKILL ALIASES
// =========================================================

const SKILL_ALIASES = {
  js: "javascript",
  javascript: "javascript",

  reactjs: "react",
  "react.js": "react",
  react: "react",

  nodejs: "node",
  "node.js": "node",
  node: "node",

  html5: "html",
  html: "html",

  css3: "css",
  css: "css",

  mysql: "mysql",
  sql: "sql",

  postgres: "postgresql",
  postgresql: "postgresql",

  mongodb: "mongodb",
  mongo: "mongodb",

  py: "python",
  python: "python",

  powerbi: "power bi",
  "power bi": "power bi",

  ml: "machine learning",
  "machine learning": "machine learning",

  ai: "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
};

// =========================================================
// NORMALIZE SKILL
// =========================================================

function normalizeSkill(skill) {
  const normalized = normalizeText(skill);

  return SKILL_ALIASES[normalized] || normalized;
}

// =========================================================
// ESCAPE REGEX
// =========================================================

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =========================================================
// EXTRACT JOB SKILLS
// =========================================================

function extractSkills(job) {
  const text = getJobText(job);
  const detected = [];

  for (const skill of COMMON_SKILLS) {
    const normalizedSkill = normalizeSkill(skill);

    const regex = new RegExp(
      `(^|\\s|[^a-z0-9])${escapeRegex(
        skill
      )}(?=\\s|$|[^a-z0-9])`,
      "i"
    );

    if (regex.test(text)) {
      detected.push(normalizedSkill);
    }
  }

  return [...new Set(detected)];
}

// =========================================================
// USER SKILLS
// =========================================================

function parseSkills(skills) {
  return String(skills || "")
    .split(/[,|]/)
    .map((skill) => normalizeSkill(skill))
    .filter(Boolean);
}

// =========================================================
// MATCHED SKILLS
// =========================================================

function getMatchedSkills(job, requestedSkills) {
  const userSkills = parseSkills(requestedSkills);
  const jobSkills = extractSkills(job);

  return userSkills.filter((userSkill) =>
    jobSkills.some(
      (jobSkill) =>
        jobSkill === userSkill ||
        jobSkill.includes(userSkill) ||
        userSkill.includes(jobSkill)
    )
  );
}

// =========================================================
// MATCH SCORE
// =========================================================

function calculateMatchScore(job, requestedSkills) {
  const userSkills = parseSkills(requestedSkills);

  if (userSkills.length === 0) {
    return 0;
  }

  const matchedSkills = getMatchedSkills(
    job,
    requestedSkills
  );

  return Math.round(
    (matchedSkills.length / userSkills.length) * 100
  );
}

// =========================================================
// LOCATION
// =========================================================

function getLocation(job) {
  if (job.location?.display_name) {
    return job.location.display_name;
  }

  if (Array.isArray(job.location?.area)) {
    return job.location.area.join(", ");
  }

  return "Location not specified";
}

// =========================================================
// WORK MODE
// =========================================================

function getWorkMode(job) {
  const text = getJobText(job);

  if (
    /\bremote\b/i.test(text) ||
    /\bwork from home\b/i.test(text) ||
    /\bwfh\b/i.test(text)
  ) {
    return "Remote";
  }

  if (/\bhybrid\b/i.test(text)) {
    return "Hybrid";
  }

  if (
    /\bon[- ]site\b/i.test(text) ||
    /\bonsite\b/i.test(text) ||
    /\boffice\b/i.test(text)
  ) {
    return "On-site";
  }

  return "Not specified";
}

// =========================================================
// JOB TYPE
// =========================================================

function getJobType(job) {
  const text = getJobText(job);

  if (
    /\bintern(ship)?\b/i.test(text) ||
    /\bapprentice(ship)?\b/i.test(text)
  ) {
    return "Internship";
  }

  if (/\bpart[- ]time\b/i.test(text)) {
    return "Part-time";
  }

  if (/\bcontract\b/i.test(text)) {
    return "Contract";
  }

  if (
    /\bfull[- ]time\b/i.test(text) ||
    /\bfull time\b/i.test(text)
  ) {
    return "Full-time";
  }

  return "Not specified";
}

// =========================================================
// FRESHER PRIORITY
// =========================================================

function getFresherPriority(job) {
  const title = normalizeText(job.title);
  const text = getJobText(job);

  let score = 0;

  if (/\bintern(ship)?\b/i.test(title)) {
    score += 120;
  }

  if (/\btrainee\b/i.test(title)) {
    score += 110;
  }

  if (/\bgraduate\b/i.test(title)) {
    score += 100;
  }

  if (/\bentry[\s-]?level\b/i.test(title)) {
    score += 100;
  }

  if (/\bjunior\b/i.test(title)) {
    score += 70;
  }

  if (/\bfresher\b/i.test(text)) {
    score += 120;
  }

  if (/\bentry[\s-]?level\b/i.test(text)) {
    score += 100;
  }

  if (/\b0\s*(?:-|to)\s*1\s*years?\b/i.test(text)) {
    score += 120;
  }

  if (/\b0\s*(?:-|to)\s*2\s*years?\b/i.test(text)) {
    score += 100;
  }

  return score;
}

// =========================================================
// FORMAT JOB
// =========================================================

function formatJob(job, requestedSkills) {
  const experience = detectExperience(job);

  const requiredSkills = extractSkills(job);

  const matchedSkills = getMatchedSkills(
    job,
    requestedSkills
  );

  const skillsToImprove = requiredSkills.filter(
    (skill) =>
      !matchedSkills.some(
        (matched) =>
          skill === matched ||
          skill.includes(matched) ||
          matched.includes(skill)
      )
  );

  return {
    id: job.id || null,

    title: job.title || "Job Position",

    company:
      job.company?.display_name ||
      "Company not specified",

    location: getLocation(job),

    country: "India",

    salary:
      job.salary_min && job.salary_max
        ? `${job.salary_min} - ${job.salary_max}`
        : job.salary_min
        ? `From ${job.salary_min}`
        : "Not specified",

    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,

    job_type: getJobType(job),

    work_mode: getWorkMode(job),

    description:
      job.description ||
      "No description available.",

    apply_url:
      job.redirect_url ||
      job.url ||
      null,

    source: "Adzuna",

    skills: requiredSkills,

    matched_skills: matchedSkills,

    skills_to_improve: skillsToImprove,

    match_score: calculateMatchScore(
      job,
      requestedSkills
    ),

    experience_level: experience.level,

    experience_min: experience.minYears,

    experience_max: experience.maxYears,

    experience_reason: experience.reason,

    experience_confidence:
      experience.confidence,

    fresher_priority:
      getFresherPriority(job),

    created: job.created || null,
  };
}

// =========================================================
// BUILD ADZUNA URL
// =========================================================

function buildAdzunaUrl({
  search,
  location,
  page,
  limit,
}) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error(
      "Adzuna credentials are missing."
    );
  }

  const params = new URLSearchParams();

  params.set("app_id", ADZUNA_APP_ID);
  params.set("app_key", ADZUNA_APP_KEY);

  params.set(
    "results_per_page",
    String(Math.min(limit, MAX_LIMIT))
  );

  params.set(
    "content-type",
    "application/json"
  );

  // Search keyword
  if (search) {
    params.set("what", search);
  }

  // IMPORTANT:
  // Do NOT send "Worldwide" to Adzuna as `where`.
  if (
    location &&
    location.toLowerCase() !== "worldwide" &&
    location.toLowerCase() !== "all"
  ) {
    params.set("where", location);
  }

  return (
    `https://api.adzuna.com/v1/api/jobs/${DEFAULT_COUNTRY}/search/${page}` +
    `?${params.toString()}`
  );
}

// =========================================================
// FETCH ADZUNA PAGE
// =========================================================

async function fetchAdzunaPage({
  search,
  location,
  page,
  limit,
}) {
  const url = buildAdzunaUrl({
    search,
    location,
    page,
    limit,
  });

  console.log(
    "ADZUNA REQUEST:",
    url.replace(
      ADZUNA_APP_KEY,
      "***"
    )
  );

  const response = await fetch(url);

  const text = await response.text();

  if (!response.ok) {
    console.error(
      "ADZUNA STATUS:",
      response.status
    );

    console.error(
      "ADZUNA RESPONSE:",
      text
    );

    let message =
      "Adzuna API request failed.";

    try {
      const errorData = JSON.parse(text);

      message =
        errorData?.display ||
        errorData?.error ||
        message;
    } catch {
      // Ignore JSON parse error
    }

    throw new Error(
      `${message} HTTP ${response.status}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Adzuna returned invalid JSON."
    );
  }
}

// =========================================================
// REMOVE DUPLICATES
// =========================================================

function removeDuplicateJobs(jobs) {
  const map = new Map();

  for (const job of jobs) {
    const fallbackKey =
      `${job.title || ""}-${job.company?.display_name || ""}-${job.location?.display_name || ""}`;

    const key = String(
      job.id || fallbackKey
    ).toLowerCase();

    if (!map.has(key)) {
      map.set(key, job);
    }
  }

  return [...map.values()];
}

// =========================================================
// BUILD SEARCH QUERY
// =========================================================

function buildSearchQuery(search, skills) {
  const parts = [];

  if (search) {
    parts.push(search);
  }

  if (skills) {
    const skillList = parseSkills(skills);

    if (skillList.length) {
      parts.push(
        skillList
          .slice(0, 5)
          .join(" ")
      );
    }
  }

  return parts.join(" ").trim();
}

// =========================================================
// GET /recommendations
// =========================================================

router.get(
  "/recommendations",
  async (req, res) => {
    try {
      // =====================================================
      // ENV CHECK
      // =====================================================

      if (
        !ADZUNA_APP_ID ||
        !ADZUNA_APP_KEY
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Adzuna credentials missing. Check backend/.env",
        });
      }

      // =====================================================
      // QUERY PARAMETERS
      // Supports both camelCase and snake_case
      // =====================================================

      const search = String(
        req.query.search || ""
      ).trim();

      const location = String(
        req.query.location || ""
      ).trim();

      const skills = String(
        req.query.skills || ""
      ).trim();

      const jobType = String(
        req.query.jobType ||
          req.query.job_type ||
          ""
      ).trim();

      const workMode = String(
        req.query.workMode ||
          req.query.work_mode ||
          ""
      ).trim();

      const requestedExperience =
        String(
          req.query.experienceLevel ||
            req.query.experience_level ||
            "all"
        )
          .trim()
          .toLowerCase();

      let page =
        Number(req.query.page) || 1;

      let limit =
        Number(req.query.limit) ||
        DEFAULT_LIMIT;

      if (page < 1) {
        page = 1;
      }

      if (limit < 1) {
        limit = DEFAULT_LIMIT;
      }

      if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
      }

      // =====================================================
      // EXPERIENCE
      // =====================================================

      const allowedLevels = [
        "fresher",
        "1-3",
        "3+",
        "all",
      ];

      const experienceLevel =
        allowedLevels.includes(
          requestedExperience
        )
          ? requestedExperience
          : "all";

      // =====================================================
      // LOG REQUEST
      // =====================================================

      console.log(
        "\n============================================"
      );

      console.log(
        "JOB SEARCH REQUEST"
      );

      console.log(
        "Search:",
        search || "(empty)"
      );

      console.log(
        "Location:",
        location || "(all)"
      );

      console.log(
        "Skills:",
        skills || "(none)"
      );

      console.log(
        "Job Type:",
        jobType || "(all)"
      );

      console.log(
        "Work Mode:",
        workMode || "(all)"
      );

      console.log(
        "Experience:",
        experienceLevel
      );

      console.log(
        "Page:",
        page
      );

      console.log(
        "Limit:",
        limit
      );

      console.log(
        "============================================"
      );

      // =====================================================
      // SEARCH QUERY
      // =====================================================

      const adzunaSearch =
        buildSearchQuery(
          search,
          skills
        );

      // =====================================================
      // FETCH STRATEGY
      // =====================================================

      const pagesToFetch =
        experienceLevel === "all"
          ? Math.max(1, page)
          : SEARCH_PAGES;

      const allJobs = [];

      let adzunaCount = 0;

      // =====================================================
      // FETCH ADZUNA PAGES
      // =====================================================

      for (
        let i = 1;
        i <= pagesToFetch;
        i++
      ) {
        if (
          allJobs.length >=
          MAX_RAW_JOBS
        ) {
          break;
        }

        const data =
          await fetchAdzunaPage({
            search: adzunaSearch,
            location,
            page: i,
            limit,
          });

        if (
          typeof data.count ===
          "number"
        ) {
          adzunaCount =
            data.count;
        }

        const jobs =
          Array.isArray(
            data.results
          )
            ? data.results
            : [];

        console.log(
          `ADZUNA PAGE ${i}:`,
          jobs.length,
          "jobs"
        );

        allJobs.push(...jobs);

        if (
          jobs.length < limit
        ) {
          break;
        }
      }

      console.log(
        "ADZUNA TOTAL COUNT:",
        adzunaCount
      );

      console.log(
        "RAW JOBS:",
        allJobs.length
      );

      // =====================================================
      // DEDUPLICATE
      // =====================================================

      const uniqueJobs =
        removeDuplicateJobs(
          allJobs
        );

      console.log(
        "UNIQUE JOBS:",
        uniqueJobs.length
      );

      // =====================================================
      // FILTER
      // =====================================================

      const filteredJobs =
        uniqueJobs.filter(
          (job) => {
            // EXPERIENCE
            if (
              !matchesExperience(
                job,
                experienceLevel
              )
            ) {
              return false;
            }

            // JOB TYPE
            if (
              jobType &&
              jobType.toLowerCase() !==
                "all"
            ) {
              const detectedType =
                getJobType(job);

              if (
                detectedType.toLowerCase() !==
                jobType.toLowerCase()
              ) {
                return false;
              }
            }

            // WORK MODE
            if (
              workMode &&
              workMode.toLowerCase() !==
                "all"
            ) {
              const detectedMode =
                getWorkMode(job);

              if (
                detectedMode.toLowerCase() !==
                workMode.toLowerCase()
              ) {
                return false;
              }
            }

            return true;
          }
        );

      console.log(
        "FILTERED JOBS:",
        filteredJobs.length
      );

      // =====================================================
      // FORMAT
      // =====================================================

      let formattedJobs =
        filteredJobs.map(
          (job) =>
            formatJob(
              job,
              skills
            )
        );

      // =====================================================
      // SORT
      // =====================================================

      formattedJobs.sort(
        (a, b) => {
          // Fresher priority
          if (
            experienceLevel ===
            "fresher"
          ) {
            const priorityDifference =
              b.fresher_priority -
              a.fresher_priority;

            if (
              priorityDifference !==
              0
            ) {
              return priorityDifference;
            }
          }

          // Skill match
          if (skills) {
            const scoreDifference =
              b.match_score -
              a.match_score;

            if (
              scoreDifference !==
              0
            ) {
              return scoreDifference;
            }
          }

          // Newest first
          const dateA =
            a.created
              ? new Date(
                  a.created
                ).getTime()
              : 0;

          const dateB =
            b.created
              ? new Date(
                  b.created
                ).getTime()
              : 0;

          return dateB - dateA;
        }
      );

      // =====================================================
      // PAGINATION
      // =====================================================

      let pageJobs = [];

      let totalFiltered = 0;

      let totalPages = 0;

      if (
        experienceLevel ===
        "all"
      ) {
        const start =
          (page - 1) * limit;

        const end =
          start + limit;

        pageJobs =
          formattedJobs.slice(
            start,
            end
          );

        totalFiltered =
          adzunaCount ||
          formattedJobs.length;

        totalPages =
          Math.ceil(
            totalFiltered /
              limit
          );
      } else {
        totalFiltered =
          formattedJobs.length;

        totalPages =
          Math.ceil(
            totalFiltered /
              limit
          );

        const start =
          (page - 1) * limit;

        const end =
          start + limit;

        pageJobs =
          formattedJobs.slice(
            start,
            end
          );
      }

      // =====================================================
      // RESPONSE
      // =====================================================

      return res.json({
        success: true,

        data: pageJobs,

        total: totalFiltered,

        adzuna_total:
          adzunaCount,

        filtered_total:
          formattedJobs.length,

        pagination: {
          page,
          limit,
          total_pages:
            totalPages,

          has_next_page:
            page < totalPages,

          has_previous_page:
            page > 1,
        },

        filters: {
          search,
          location,
          skills,
          jobType,
          workMode,
          experienceLevel,
        },

        source: "Adzuna",
      });
    } catch (error) {
      console.error(
        "\n============================================"
      );

      console.error(
        "JOB RECOMMENDATION ERROR"
      );

      console.error(error);

      console.error(
        "============================================"
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to fetch job recommendations.",

        source: "Adzuna",
      });
    }
  }
);

// =========================================================
// TEST ROUTE
// =========================================================

router.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Job routes are working.",
    });
  }
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;