const supabase = require("../config/supabase");

// =========================================================
// JOB DATABASE
// =========================================================

const jobs = [
  {
    id: 1,
    title: "Python Developer",
    company: "Tech Solutions",
    location: "Bangalore, India",
    country: "India",
    salary: "₹4 - ₹8 LPA",
    job_type: "Full-time",
    work_mode: "On-site",
    skills: ["Python", "FastAPI", "SQL", "Git"],
    description:
      "Python developer role focused on backend development, REST APIs and database integration.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 2,
    title: "React.js Developer",
    company: "Web Technologies",
    location: "Bangalore, India",
    country: "India",
    salary: "₹5 - ₹9 LPA",
    job_type: "Full-time",
    work_mode: "Hybrid",
    skills: ["React.js", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
    description:
      "Frontend developer role focused on building modern React applications.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 3,
    title: "Full Stack Developer",
    company: "CareerTech",
    location: "Remote",
    country: "Worldwide",
    salary: "₹6 - ₹10 LPA",
    job_type: "Full-time",
    work_mode: "Remote",
    skills: ["React.js", "Node.js", "FastAPI", "SQL", "GitHub"],
    description:
      "Full stack development role involving frontend, backend APIs and databases.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 4,
    title: "Python Backend Intern",
    company: "AI Labs",
    location: "Pune, India",
    country: "India",
    salary: "₹15,000 - ₹25,000/month",
    job_type: "Internship",
    work_mode: "Hybrid",
    skills: ["Python", "FastAPI", "SQL", "Git"],
    description:
      "Backend internship focused on Python, APIs and database development.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 5,
    title: "Frontend Developer Intern",
    company: "Digital Works",
    location: "Hyderabad, India",
    country: "India",
    salary: "₹15,000 - ₹30,000/month",
    job_type: "Internship",
    work_mode: "On-site",
    skills: ["React.js", "JavaScript", "HTML5", "CSS3"],
    description:
      "Frontend internship working on React-based web applications.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 6,
    title: "Node.js Developer",
    company: "Cloud Systems",
    location: "Mumbai, India",
    country: "India",
    salary: "₹5 - ₹10 LPA",
    job_type: "Full-time",
    work_mode: "Remote",
    skills: ["Node.js", "Express", "JavaScript", "SQL", "Git"],
    description:
      "Backend role involving Node.js, REST APIs and SQL databases.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 7,
    title: "Data Analyst",
    company: "Data Insights",
    location: "Delhi, India",
    country: "India",
    salary: "₹4 - ₹8 LPA",
    job_type: "Full-time",
    work_mode: "Hybrid",
    skills: ["SQL", "Python", "Excel", "Power BI", "Data Analysis"],
    description:
      "Data analyst role involving SQL, Excel, Power BI and data analysis.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 8,
    title: "AI/ML Engineer",
    company: "Future AI",
    location: "Remote",
    country: "Worldwide",
    salary: "$60,000 - $100,000",
    job_type: "Full-time",
    work_mode: "Remote",
    skills: ["Python", "Machine Learning", "Artificial Intelligence", "SQL"],
    description:
      "AI/ML engineering role focused on Python and machine learning systems.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 9,
    title: "Full Stack Developer Intern",
    company: "Startup Hub",
    location: "Chennai, India",
    country: "India",
    salary: "₹12,000 - ₹25,000/month",
    job_type: "Internship",
    work_mode: "On-site",
    skills: ["React.js", "Node.js", "JavaScript", "SQL", "GitHub"],
    description:
      "Full stack internship involving React, Node.js and databases.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 10,
    title: "Freelance React Developer",
    company: "Global Freelance",
    location: "Worldwide",
    country: "Worldwide",
    salary: "$20 - $40/hour",
    job_type: "Freelance",
    work_mode: "Remote",
    skills: ["React.js", "JavaScript", "HTML5", "CSS3", "GitHub"],
    description:
      "Remote freelance React development opportunities for global clients.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 11,
    title: "Software Engineer",
    company: "Global Tech",
    location: "Worldwide",
    country: "Worldwide",
    salary: "$70,000 - $120,000",
    job_type: "Full-time",
    work_mode: "Remote",
    skills: ["Python", "JavaScript", "SQL", "Git", "API"],
    description:
      "Software engineering role working on scalable web applications and APIs.",
    apply_url: "https://www.linkedin.com/jobs/",
  },

  {
    id: 12,
    title: "Web Developer",
    company: "Creative Digital",
    location: "Pune, India",
    country: "India",
    salary: "₹3 - ₹7 LPA",
    job_type: "Contract",
    work_mode: "Remote",
    skills: ["HTML5", "CSS3", "JavaScript", "React.js"],
    description:
      "Web development contract role focused on modern frontend technologies.",
    apply_url: "https://www.linkedin.com/jobs/",
  },
];

// =========================================================
// NORMALIZE SKILL
// =========================================================

function normalizeSkill(skill) {
  return String(skill || "")
    .toLowerCase()
    .replace(/\.js/g, "js")
    .replace(/[^a-z0-9+#]/g, "");
}

// =========================================================
// EXTRACT RESUME SKILLS
// =========================================================

function extractResumeSkills(resume) {
  const possibleFields = [
    resume?.technical_skills,
    resume?.technicalSkills,
    resume?.skills,
    resume?.skill,
  ];

  let skills = [];

  for (const field of possibleFields) {
    if (!field) continue;

    if (Array.isArray(field)) {
      skills.push(...field);
    } else if (typeof field === "string") {
      skills.push(
        ...field
          .split(/[,|\n]/)
          .map((skill) => skill.trim())
          .filter(Boolean)
      );
    } else if (typeof field === "object") {
      skills.push(...Object.values(field).flat());
    }
  }

  // Also search common resume text fields
  const textFields = [
    resume?.summary,
    resume?.professional_summary,
    resume?.professionalSummary,
    resume?.projects,
    resume?.experience,
  ];

  const text = textFields
    .filter(Boolean)
    .map((value) => JSON.stringify(value))
    .join(" ");

  if (text) {
    const commonSkills = [
      "Python",
      "JavaScript",
      "Java",
      "C++",
      "C#",
      "React",
      "React.js",
      "Node.js",
      "Express",
      "FastAPI",
      "Django",
      "Flask",
      "HTML",
      "HTML5",
      "CSS",
      "CSS3",
      "Tailwind CSS",
      "SQL",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Git",
      "GitHub",
      "API",
      "Power BI",
      "Excel",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Analysis",
    ];

    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    }
  }

  return [...new Set(skills.map((skill) => String(skill).trim()).filter(Boolean))];
}

// =========================================================
// CALCULATE MATCH SCORE
// =========================================================

function calculateMatchScore(resumeSkills, jobSkills) {
  if (!resumeSkills.length || !jobSkills.length) {
    return 0;
  }

  const userSkills = new Set(
    resumeSkills.map(normalizeSkill)
  );

  let matched = 0;

  for (const skill of jobSkills) {
    if (userSkills.has(normalizeSkill(skill))) {
      matched++;
    }
  }

  return Math.round((matched / jobSkills.length) * 100);
}

// =========================================================
// GET JOB RECOMMENDATIONS
// =========================================================

const getJobRecommendations = async (req, res) => {
  try {
    const {
      user_id,
      search = "",
      location = "Worldwide",
      job_type = "All",
      work_mode = "All",
    } = req.query;

    let resume = null;

    // =====================================================
    // LOAD USER RESUME
    // =====================================================

    if (user_id) {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

      if (error) {
        console.error("Resume Fetch Error:", error);
      } else {
        resume = data;
      }
    }

    const resumeSkills = extractResumeSkills(resume || {});

    // =====================================================
    // FILTER JOBS
    // =====================================================

    let filteredJobs = jobs.filter((job) => {
      // Search filter
      if (search.trim()) {
        const searchText = search.toLowerCase();

        const searchableText = `
          ${job.title}
          ${job.company}
          ${job.location}
          ${job.skills.join(" ")}
          ${job.description}
        `.toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      // Location filter
      if (
        location &&
        location !== "Worldwide" &&
        location !== "All"
      ) {
        const selectedLocation = location.toLowerCase();

        const jobLocation = job.location.toLowerCase();
        const jobCountry = job.country.toLowerCase();

        if (
          !jobLocation.includes(selectedLocation) &&
          !jobCountry.includes(selectedLocation)
        ) {
          return false;
        }
      }

      // Job type filter
      if (
        job_type &&
        job_type !== "All"
      ) {
        if (
          job.job_type.toLowerCase() !==
          job_type.toLowerCase()
        ) {
          return false;
        }
      }

      // Work mode filter
      if (
        work_mode &&
        work_mode !== "All"
      ) {
        if (
          job.work_mode.toLowerCase() !==
          work_mode.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    });

    // =====================================================
    // MATCH SCORE
    // =====================================================

    filteredJobs = filteredJobs.map((job) => {
      const matchScore = calculateMatchScore(
        resumeSkills,
        job.skills
      );

      const matchedSkills = job.skills.filter((skill) =>
        resumeSkills.some(
          (resumeSkill) =>
            normalizeSkill(resumeSkill) ===
            normalizeSkill(skill)
        )
      );

      const skillsToImprove = job.skills.filter(
        (skill) => !matchedSkills.includes(skill)
      );

      return {
        ...job,
        match_score: matchScore,
        matched_skills: matchedSkills,
        skills_to_improve: skillsToImprove,
      };
    });

    // Best matching jobs first
    filteredJobs.sort(
      (a, b) => b.match_score - a.match_score
    );

    return res.json({
      success: true,
      resume_skills: resumeSkills,
      total: filteredJobs.length,
      filters: {
        search,
        location,
        job_type,
        work_mode,
      },
      data: filteredJobs,
    });
  } catch (error) {
    console.error(
      "Job Recommendation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load job recommendations",
    });
  }
};

module.exports = {
  getJobRecommendations,
};