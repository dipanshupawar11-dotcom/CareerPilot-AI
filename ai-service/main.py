from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from google import genai

from google.genai import types

from dotenv import load_dotenv

import os

import re

import time


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Primary model
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.7-flash"
)

# Fallback model if primary model temporarily fails
GEMINI_FALLBACK_MODEL = os.getenv(
    "GEMINI_FALLBACK_MODEL",
    "gemini-3.6-flash"
)


# =========================================================
# GEMINI CLIENT
# =========================================================

gemini_client = None

if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="CareerPilot AI Service",
    version="0.5.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# KEYWORDS
# =========================================================

KNOWN_KEYWORDS = [

    # Programming Languages
    "python",
    "javascript",
    "typescript",
    "java",
    "c",
    "c++",
    "c#",
    "go",
    "golang",
    "rust",
    "kotlin",
    "swift",
    "php",
    "ruby",

    # Frontend
    "html",
    "html5",
    "css",
    "css3",
    "react",
    "react.js",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "vue.js",
    "tailwind",

    # Backend
    "node.js",
    "nodejs",
    "express",
    "django",
    "flask",
    "fastapi",
    "spring",
    "spring boot",
    ".net",
    "laravel",

    # Database
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "oracle",
    "sqlite",

    # Cloud / DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "jenkins",
    "terraform",
    "linux",

    # Tools
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "postman",

    # AI / ML
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai",
    "data science",
    "data analysis",
    "nlp",
    "computer vision",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "numpy",
    "pandas",

    # Data
    "power bi",
    "excel",
    "tableau",

    # General
    "api",
    "rest api",
    "graphql",
    "microservices"
]


# =========================================================
# PROFESSIONAL WORDS
# =========================================================

PROFESSIONAL_WORDS = [
    "developed",
    "built",
    "created",
    "implemented",
    "designed",
    "engineered",
    "deployed",
    "optimized",
    "improved",
    "managed",
    "integrated",
    "automated",
    "analyzed",
    "achieved",
    "experience",
    "project",
    "application",
    "system",
    "website",
    "using",
    "technologies",
    "responsible",
    "lead",
    "team"
]


# =========================================================
# GARBAGE VALUES
# =========================================================

GARBAGE_VALUES = {
    "",
    "na",
    "n/a",
    "none",
    "null",
    "test",
    "testing",
    "asdf",
    "asdasd",
    "dsadsad",
    "aasdsa",
    "dasad",
    "sasad",
    "uhhjhb",
    "bhbh",
    "fcgfcgcvg",
    "fhgtff",
    "vgghh",
    "gfgcc"
}


# =========================================================
# HELPERS
# =========================================================

def clean_text(value):

    if value is None:
        return ""

    return str(value).strip()


def normalize_text(value):

    return clean_text(value).lower()


def word_count(text):

    return len(
        re.findall(
            r"\b[\w+#.-]+\b",
            clean_text(text)
        )
    )


def is_garbage(text):

    text = normalize_text(text)

    if not text:
        return True

    if text in GARBAGE_VALUES:
        return True

    words = re.findall(
        r"[a-zA-Z]+",
        text
    )

    if not words:
        return True

    if len(text) < 5:
        return True

    compact = re.sub(
        r"\s+",
        "",
        text
    )

    if compact and len(set(compact)) <= 2:
        return True

    return False


def valid_email(email):

    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return bool(
        re.match(
            pattern,
            clean_text(email)
        )
    )


def valid_phone(phone):

    digits = re.sub(
        r"\D",
        "",
        clean_text(phone)
    )

    return 10 <= len(digits) <= 15


def valid_url(url):

    url = clean_text(url).lower()

    return (
        url.startswith("http://")
        or url.startswith("https://")
    )


# =========================================================
# FIXED KEYWORD DETECTION
# =========================================================

def keyword_pattern(keyword):

    """
    Creates a safe regex pattern for a technical keyword.

    This prevents substring matching such as:

    java -> javascript
    c -> c++
    c -> c#
    html -> html5
    react -> react.js
    """

    keyword = normalize_text(keyword)

    escaped = re.escape(keyword)

    # Keywords containing special characters such as:
    # c++, c#, .net, react.js, next.js, node.js
    # need normal non-word boundaries.
    if any(
        character in keyword
        for character in ["+", "#", ".", " "]
    ):
        return (
            r"(?<![a-z0-9])"
            + escaped
            + r"(?![a-z0-9])"
        )

    # Normal words.
    #
    # The dot is intentionally included in the blocked
    # characters so:
    #
    # react does NOT independently match react.js
    # html does NOT independently match html5
    #
    # while javascript does NOT match java.
    return (
        r"(?<![a-z0-9])"
        + escaped
        + r"(?![a-z0-9.#])"
    )


def find_keywords(text):

    text = normalize_text(text)

    found = []

    for keyword in KNOWN_KEYWORDS:

        pattern = keyword_pattern(keyword)

        if re.search(
            pattern,
            text,
            flags=re.IGNORECASE
        ):
            found.append(keyword)

    return found


def meaningful_section(
    text,
    minimum_words
):

    if is_garbage(text):
        return False

    return (
        word_count(text)
        >= minimum_words
    )


def quality_score(
    text,
    minimum_words,
    professional_bonus=True
):

    text = clean_text(text)

    if is_garbage(text):
        return 0

    words = word_count(text)

    if words < minimum_words:
        return 25

    score = 50

    if words >= minimum_words + 5:
        score += 10

    if words >= minimum_words + 10:
        score += 10

    if words >= minimum_words + 20:
        score += 10

    if professional_bonus:

        normalized = normalize_text(text)

        matches = sum(
            1
            for word in PROFESSIONAL_WORDS
            if word in normalized
        )

        if matches >= 1:
            score += 5

        if matches >= 3:
            score += 5

    return min(score, 100)


# =========================================================
# NORMALIZE SKILLS
# =========================================================

def normalize_skills(skills):

    if isinstance(skills, list):

        return [
            clean_text(skill).strip()
            for skill in skills
            if clean_text(skill)
        ]

    if isinstance(skills, str):

        return [
            skill.strip()
            for skill in skills.split(",")
            if skill.strip()
        ]

    return []


# =========================================================
# GEMINI ERROR HELPERS
# =========================================================

def is_temporary_gemini_error(error):

    error_text = str(error).lower()

    temporary_errors = [
        "503",
        "unavailable",
        "high demand",
        "temporarily",
        "overloaded",
        "deadline exceeded",
        "429",
        "resource exhausted"
    ]

    return any(
        item in error_text
        for item in temporary_errors
    )


def generate_gemini_response(
    prompt,
    system_instruction
):

    if gemini_client is None:

        raise RuntimeError(
            "Gemini AI is not configured."
        )

    models_to_try = [
        GEMINI_MODEL
    ]

    if (
        GEMINI_FALLBACK_MODEL
        and GEMINI_FALLBACK_MODEL != GEMINI_MODEL
    ):

        models_to_try.append(
            GEMINI_FALLBACK_MODEL
        )

    last_error = None

    for index, model_name in enumerate(
        models_to_try
    ):

        try:

            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    max_output_tokens=1200
                )
            )

            answer = clean_text(
                getattr(response, "text", "")
            )

            if answer:

                return {
                    "answer": answer,
                    "model": model_name
                }

            raise RuntimeError(
                "Gemini returned an empty response."
            )

        except Exception as error:

            last_error = error

            if index == len(models_to_try) - 1:
                break

            if is_temporary_gemini_error(error):

                time.sleep(1)

                continue

            continue

    raise last_error


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message":
            "CareerPilot AI Service is running",
        "version":
            "0.5.0",
        "ai":
            "Gemini",
        "ai_enabled":
            gemini_client is not None,
        "model":
            GEMINI_MODEL,
        "fallback_model":
            GEMINI_FALLBACK_MODEL
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "success": True,
        "status":
            "healthy",
        "ai_enabled":
            gemini_client is not None,
        "model":
            GEMINI_MODEL,
        "fallback_model":
            GEMINI_FALLBACK_MODEL
    }


# =========================================================
# ANALYZE RESUME
# =========================================================

@app.post("/api/analyze-resume")
def analyze_resume(resume: dict):

    try:

        # -------------------------------------------------
        # GET DATA
        # -------------------------------------------------

        name = clean_text(
            resume.get("name")
        )

        email = clean_text(
            resume.get("email")
        )

        phone = clean_text(
            resume.get("phone")
        )

        location = clean_text(
            resume.get("location")
        )

        linkedin = clean_text(
            resume.get("linkedin")
        )

        github = clean_text(
            resume.get("github")
        )

        portfolio = clean_text(
            resume.get("portfolio")
        )

        summary = clean_text(
            resume.get("summary")
        )

        education = clean_text(
            resume.get("education")
        )

        skills = clean_text(
            resume.get("skills")
        )

        projects = clean_text(
            resume.get("projects")
        )

        experience = clean_text(
            resume.get("experience")
        )

        certifications = clean_text(
            resume.get("certifications")
        )

        # -------------------------------------------------
        # COMPLETE RESUME TEXT
        # -------------------------------------------------

        resume_text = " ".join([
            name,
            summary,
            education,
            skills,
            projects,
            experience,
            certifications
        ])

        total_words = word_count(
            resume_text
        )

        # FIXED KEYWORD DETECTION
        found_keywords = find_keywords(
            resume_text
        )

        # FIXED MISSING KEYWORDS
        missing_keywords = [
            keyword
            for keyword in KNOWN_KEYWORDS
            if keyword not in found_keywords
        ]

        # -------------------------------------------------
        # DETECTED SKILLS
        # -------------------------------------------------

        detected_skills = find_keywords(
            skills
            + " "
            + projects
            + " "
            + experience
        )

        # -------------------------------------------------
        # SUGGESTIONS
        # -------------------------------------------------

        suggestions = []

        # -------------------------------------------------
        # PERSONAL INFORMATION
        # -------------------------------------------------

        personal_score = 0

        if not is_garbage(name):

            personal_score += 5

        else:

            suggestions.append(
                "Add your full professional name."
            )

        if valid_email(email):

            personal_score += 5

        else:

            suggestions.append(
                "Add a valid professional email address."
            )

        if valid_phone(phone):

            personal_score += 5

        else:

            suggestions.append(
                "Add a valid phone number."
            )

        # -------------------------------------------------
        # LOCATION
        # -------------------------------------------------

        location_score = 0

        if not is_garbage(location):

            location_score = 3

        else:

            suggestions.append(
                "Add your city and country/location."
            )

        # -------------------------------------------------
        # ONLINE PROFILES
        # -------------------------------------------------

        profile_count = 0

        if valid_url(linkedin):
            profile_count += 1

        if valid_url(github):
            profile_count += 1

        if valid_url(portfolio):
            profile_count += 1

        profile_score = min(
            profile_count * 2,
            5
        )

        if profile_count == 0:

            suggestions.append(
                "Add your LinkedIn profile."
            )

            suggestions.append(
                "Add your GitHub profile."
            )

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        summary_quality = quality_score(
            summary,
            minimum_words=15
        )

        summary_score = round(
            summary_quality * 0.15
        )

        if summary_quality == 0:

            suggestions.append(
                "Add a meaningful professional summary of 2-3 sentences."
            )

        elif summary_quality < 60:

            suggestions.append(
                "Improve your professional summary with your skills, experience and career goals."
            )

        # -------------------------------------------------
        # EDUCATION
        # -------------------------------------------------

        education_quality = quality_score(
            education,
            minimum_words=5,
            professional_bonus=False
        )

        education_score = round(
            education_quality * 0.10
        )

        if education_quality == 0:

            suggestions.append(
                "Add your degree, institution and graduation year."
            )

        # -------------------------------------------------
        # SKILLS
        # -------------------------------------------------

        skill_count = len(
            set(detected_skills)
        )

        skill_score = min(
            skill_count,
            15
        )

        if skill_count == 0:

            suggestions.append(
                "Add relevant technical skills such as Python, Java, JavaScript, React, SQL, C++ or other skills relevant to your target role."
            )

        elif skill_count < 5:

            suggestions.append(
                "Add more relevant technical skills to improve ATS keyword coverage."
            )

        # -------------------------------------------------
        # PROJECTS
        # -------------------------------------------------

        project_quality = quality_score(
            projects,
            minimum_words=10
        )

        project_keywords = find_keywords(
            projects
        )

        project_score = round(
            project_quality * 0.10
        )

        project_score += min(
            len(set(project_keywords)),
            5
        )

        project_score = min(
            project_score,
            15
        )

        if project_quality == 0:

            suggestions.append(
                "Add at least one meaningful technical project with technologies and achievements."
            )

        elif project_quality < 60:

            suggestions.append(
                "Improve project descriptions by explaining what you built, technologies used and measurable results."
            )

        # -------------------------------------------------
        # EXPERIENCE
        # -------------------------------------------------

        experience_quality = quality_score(
            experience,
            minimum_words=10
        )

        experience_score = round(
            experience_quality * 0.10
        )

        if experience_quality == 0:

            suggestions.append(
                "Add internship or work experience if available."
            )

        elif experience_quality < 60:

            suggestions.append(
                "Describe your responsibilities, technologies and measurable achievements."
            )

        # -------------------------------------------------
        # CERTIFICATIONS
        # -------------------------------------------------

        certification_score = 0

        if not is_garbage(certifications):

            certification_score = 5

        else:

            suggestions.append(
                "Add relevant certifications if you have them."
            )

        # -------------------------------------------------
        # KEYWORD SCORE
        # -------------------------------------------------

        keyword_count = len(
            set(found_keywords)
        )

        keyword_score = min(
            round(
                (
                    keyword_count
                    / len(KNOWN_KEYWORDS)
                ) * 15
            ),
            15
        )

        # -------------------------------------------------
        # TOTAL SCORE
        # -------------------------------------------------

        score = (
            personal_score
            + location_score
            + profile_score
            + summary_score
            + education_score
            + skill_score
            + project_score
            + experience_score
            + certification_score
            + keyword_score
        )

        # -------------------------------------------------
        # QUALITY PENALTY
        # -------------------------------------------------

        section_checks = [

            meaningful_section(
                summary,
                15
            ),

            meaningful_section(
                education,
                5
            ),

            meaningful_section(
                skills,
                3
            ),

            meaningful_section(
                projects,
                10
            ),

            meaningful_section(
                experience,
                10
            ),

            meaningful_section(
                certifications,
                2
            )
        ]

        meaningful_sections = sum(
            1
            for item in section_checks
            if item
        )

        if meaningful_sections <= 1:

            score = min(
                score,
                35
            )

        elif meaningful_sections == 2:

            score = min(
                score,
                50
            )

        elif meaningful_sections == 3:

            score = min(
                score,
                65
            )

        score = max(
            0,
            min(
                round(score),
                100
            )
        )

        # -------------------------------------------------
        # CATEGORY
        # -------------------------------------------------

        if score >= 85:

            category = "Excellent"

        elif score >= 70:

            category = "Good"

        elif score >= 50:

            category = "Needs Improvement"

        else:

            category = "Weak"

        # -------------------------------------------------
        # SECTIONS
        # -------------------------------------------------

        sections = {

            "personal_information":
                (
                    not is_garbage(name)
                    and valid_email(email)
                    and valid_phone(phone)
                ),

            "online_profiles":
                profile_count > 0,

            "summary":
                summary_quality >= 50,

            "education":
                education_quality >= 50,

            "skills":
                skill_count >= 2,

            "projects":
                project_quality >= 50,

            "experience":
                experience_quality >= 50,

            "certifications":
                not is_garbage(certifications)
        }

        # -------------------------------------------------
        # GENERAL SUGGESTIONS
        # -------------------------------------------------

        if total_words < 150:

            suggestions.append(
                "Your resume is very short. Add more specific achievements, project details and relevant experience."
            )

        elif total_words < 250:

            suggestions.append(
                "Consider adding more measurable achievements and detailed project descriptions."
            )

        if keyword_count < 5:

            suggestions.append(
                "Add more job-relevant technical keywords that match your target job description."
            )

        elif keyword_count < 10:

            suggestions.append(
                "Compare your resume with the target job description and add missing relevant keywords."
            )

        suggestions = list(
            dict.fromkeys(
                suggestions
            )
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "message":
                "Resume analyzed successfully.",

            "analysis": {

                "ats_score":
                    score,

                "category":
                    category,

                "ats_status":
                    category,

                "word_count":
                    total_words,

                "name":
                    name,

                "email":
                    email,

                "phone":
                    phone,

                "location":
                    location,

                "detected_skills":
                    detected_skills,

                "found_keywords":
                    found_keywords,

                "missing_keywords":
                    missing_keywords,

                "suggestions":
                    suggestions,

                "sections":
                    sections
            }
        }

    except Exception as e:

        return {

            "success": False,

            "message":
                "Resume analysis failed.",

            "error":
                str(e)
        }


# =========================================================
# CAREER ROADMAP
# =========================================================

@app.post("/api/career-roadmap")
def career_roadmap(data: dict):

    try:

        # -------------------------------------------------
        # GET INPUT
        # -------------------------------------------------

        goal = clean_text(
            data.get("goal")
        )

        experience = clean_text(
            data.get("experience")
        ).lower()

        skills = data.get(
            "skills",
            []
        )

        user_skills = normalize_skills(
            skills
        )

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not goal:

            return {
                "success": False,
                "message":
                    "Career goal is required."
            }

        if not experience:

            experience = "beginner"

        goal_lower = goal.lower()

        # =================================================
        # PYTHON ROADMAP
        # =================================================

        if "python" in goal_lower:

            roadmap = [

                {
                    "phase": 1,
                    "title": "Python Fundamentals",
                    "duration": "2 Weeks",
                    "topics": [
                        "Variables",
                        "Data Types",
                        "Strings",
                        "Lists",
                        "Tuples",
                        "Sets",
                        "Dictionaries",
                        "Operators"
                    ],
                    "projects": [
                        "Calculator",
                        "Number Guessing Game"
                    ]
                },

                {
                    "phase": 2,
                    "title": "Control Flow & Functions",
                    "duration": "2 Weeks",
                    "topics": [
                        "if else",
                        "for loop",
                        "while loop",
                        "Functions",
                        "Lambda",
                        "Recursion",
                        "Exception Handling"
                    ],
                    "projects": [
                        "Student Management System",
                        "Banking Console Application"
                    ]
                },

                {
                    "phase": 3,
                    "title": "Advanced Python",
                    "duration": "3 Weeks",
                    "topics": [
                        "OOP",
                        "File Handling",
                        "JSON",
                        "CSV",
                        "Modules",
                        "Packages",
                        "Virtual Environment"
                    ],
                    "projects": [
                        "Employee Management System",
                        "Expense Tracker"
                    ]
                },

                {
                    "phase": 4,
                    "title": "SQL & Databases",
                    "duration": "2 Weeks",
                    "topics": [
                        "SQL Basics",
                        "SELECT",
                        "WHERE",
                        "JOIN",
                        "GROUP BY",
                        "Subqueries",
                        "MySQL"
                    ],
                    "projects": [
                        "Student Database",
                        "Job Portal Database"
                    ]
                },

                {
                    "phase": 5,
                    "title": "Backend Development",
                    "duration": "3 Weeks",
                    "topics": [
                        "FastAPI",
                        "REST API",
                        "HTTP Methods",
                        "Authentication",
                        "CRUD",
                        "Database Integration"
                    ],
                    "projects": [
                        "Job API",
                        "Resume API"
                    ]
                },

                {
                    "phase": 6,
                    "title": "AI & Machine Learning",
                    "duration": "4 Weeks",
                    "topics": [
                        "NumPy",
                        "Pandas",
                        "Matplotlib",
                        "Machine Learning Basics",
                        "Model Training",
                        "Model Evaluation",
                        "AI APIs"
                    ],
                    "projects": [
                        "AI Resume Analyzer",
                        "AI Career Assistant"
                    ]
                },

                {
                    "phase": 7,
                    "title": "Job Preparation",
                    "duration": "2 Weeks",
                    "topics": [
                        "Python Interview Questions",
                        "SQL Interview Questions",
                        "DSA Basics",
                        "HR Questions",
                        "Resume Optimization",
                        "Mock Interviews"
                    ],
                    "projects": [
                        "Final Portfolio Project"
                    ]
                }
            ]

        # =================================================
        # WEB / FULL STACK
        # =================================================

        elif (
            "web" in goal_lower
            or "frontend" in goal_lower
            or "full stack" in goal_lower
        ):

            roadmap = [

                {
                    "phase": 1,
                    "title": "HTML & CSS",
                    "duration": "2 Weeks",
                    "topics": [
                        "HTML5",
                        "Semantic HTML",
                        "CSS3",
                        "Flexbox",
                        "Grid",
                        "Responsive Design"
                    ],
                    "projects": [
                        "Portfolio Website",
                        "Landing Page"
                    ]
                },

                {
                    "phase": 2,
                    "title": "JavaScript",
                    "duration": "3 Weeks",
                    "topics": [
                        "Variables",
                        "Data Types",
                        "Functions",
                        "Arrays",
                        "Objects",
                        "DOM",
                        "Events",
                        "Fetch API",
                        "Async JavaScript"
                    ],
                    "projects": [
                        "Weather App",
                        "Todo Application"
                    ]
                },

                {
                    "phase": 3,
                    "title": "React.js",
                    "duration": "3 Weeks",
                    "topics": [
                        "Components",
                        "Props",
                        "State",
                        "Hooks",
                        "React Router",
                        "API Integration"
                    ],
                    "projects": [
                        "Job Portal",
                        "E-Commerce Application"
                    ]
                },

                {
                    "phase": 4,
                    "title": "Backend Development",
                    "duration": "3 Weeks",
                    "topics": [
                        "Node.js",
                        "Express.js",
                        "REST APIs",
                        "Authentication",
                        "CRUD",
                        "Database"
                    ],
                    "projects": [
                        "Authentication API",
                        "Job Portal Backend"
                    ]
                },

                {
                    "phase": 5,
                    "title": "Database",
                    "duration": "2 Weeks",
                    "topics": [
                        "SQL",
                        "MySQL",
                        "MongoDB",
                        "Database Design",
                        "Queries"
                    ],
                    "projects": [
                        "Career Portal Database"
                    ]
                },

                {
                    "phase": 6,
                    "title": "Full Stack Project",
                    "duration": "4 Weeks",
                    "topics": [
                        "Frontend",
                        "Backend",
                        "Database",
                        "Authentication",
                        "Deployment",
                        "Git & GitHub"
                    ],
                    "projects": [
                        "Complete Full Stack Career Platform"
                    ]
                },

                {
                    "phase": 7,
                    "title": "Job Preparation",
                    "duration": "2 Weeks",
                    "topics": [
                        "JavaScript Interview",
                        "React Interview",
                        "SQL Interview",
                        "DSA Basics",
                        "HR Interview"
                    ],
                    "projects": [
                        "Portfolio + Resume"
                    ]
                }
            ]

        # =================================================
        # DATA SCIENCE
        # =================================================

        elif (
            "data" in goal_lower
            or "data science" in goal_lower
        ):

            roadmap = [

                {
                    "phase": 1,
                    "title": "Python for Data Science",
                    "duration": "3 Weeks",
                    "topics": [
                        "Python",
                        "Functions",
                        "Collections",
                        "OOP",
                        "File Handling"
                    ],
                    "projects": [
                        "Data Processing Project"
                    ]
                },

                {
                    "phase": 2,
                    "title": "Data Analysis",
                    "duration": "3 Weeks",
                    "topics": [
                        "NumPy",
                        "Pandas",
                        "Data Cleaning",
                        "Data Transformation"
                    ],
                    "projects": [
                        "Sales Data Analysis"
                    ]
                },

                {
                    "phase": 3,
                    "title": "Data Visualization",
                    "duration": "2 Weeks",
                    "topics": [
                        "Matplotlib",
                        "Power BI",
                        "Charts",
                        "Dashboards"
                    ],
                    "projects": [
                        "Business Dashboard"
                    ]
                },

                {
                    "phase": 4,
                    "title": "SQL",
                    "duration": "2 Weeks",
                    "topics": [
                        "SELECT",
                        "JOIN",
                        "GROUP BY",
                        "Subqueries",
                        "Window Functions"
                    ],
                    "projects": [
                        "Business Database Analysis"
                    ]
                },

                {
                    "phase": 5,
                    "title": "Machine Learning",
                    "duration": "4 Weeks",
                    "topics": [
                        "Regression",
                        "Classification",
                        "Clustering",
                        "Model Evaluation"
                    ],
                    "projects": [
                        "House Price Prediction",
                        "Customer Churn Prediction"
                    ]
                },

                {
                    "phase": 6,
                    "title": "Job Preparation",
                    "duration": "2 Weeks",
                    "topics": [
                        "Python Interview",
                        "SQL Interview",
                        "Statistics",
                        "ML Interview",
                        "HR Interview"
                    ],
                    "projects": [
                        "Data Science Portfolio"
                    ]
                }
            ]

        # =================================================
        # DEFAULT ROADMAP
        # =================================================

        else:

            roadmap = [

                {
                    "phase": 1,
                    "title": "Programming Fundamentals",
                    "duration": "3 Weeks",
                    "topics": [
                        "Programming Basics",
                        "Variables",
                        "Data Types",
                        "Conditions",
                        "Loops",
                        "Functions"
                    ],
                    "projects": [
                        "Beginner Programming Project"
                    ]
                },

                {
                    "phase": 2,
                    "title": "Data Structures",
                    "duration": "3 Weeks",
                    "topics": [
                        "Arrays",
                        "Strings",
                        "Lists",
                        "Stacks",
                        "Queues",
                        "Hashing"
                    ],
                    "projects": [
                        "Data Structure Practice"
                    ]
                },

                {
                    "phase": 3,
                    "title": "Database & SQL",
                    "duration": "2 Weeks",
                    "topics": [
                        "SQL",
                        "MySQL",
                        "Queries",
                        "Joins",
                        "Database Design"
                    ],
                    "projects": [
                        "Database Project"
                    ]
                },

                {
                    "phase": 4,
                    "title": "Projects",
                    "duration": "4 Weeks",
                    "topics": [
                        "Project Planning",
                        "Git",
                        "GitHub",
                        "API Integration",
                        "Deployment"
                    ],
                    "projects": [
                        "Major Portfolio Project"
                    ]
                },

                {
                    "phase": 5,
                    "title": "Interview Preparation",
                    "duration": "2 Weeks",
                    "topics": [
                        "Technical Questions",
                        "Coding Questions",
                        "SQL Questions",
                        "HR Questions",
                        "Mock Interviews"
                    ],
                    "projects": [
                        "Final Portfolio"
                    ]
                }
            ]

        # =================================================
        # SKILL GAP
        # =================================================

        all_topics = []

        for phase in roadmap:

            all_topics.extend(
                [
                    topic.lower()
                    for topic in phase["topics"]
                ]
            )

        skill_gaps = []

        for topic in all_topics:

            if not any(
                topic in skill.lower()
                or skill.lower() in topic
                for skill in user_skills
            ):

                skill_gaps.append(
                    topic
                )

        skill_gaps = list(
            dict.fromkeys(
                skill_gaps
            )
        )

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,

            "message":
                "Career roadmap generated successfully.",

            "roadmap": {

                "career_goal":
                    goal,

                "experience_level":
                    experience,

                "current_skills":
                    user_skills,

                "total_phases":
                    len(roadmap),

                "skill_gaps":
                    skill_gaps[:20],

                "phases":
                    roadmap
            }
        }

    except Exception as e:

        return {

            "success": False,

            "message":
                "Career roadmap generation failed.",

            "error":
                str(e)
        }


# =========================================================
# AI CAREER ASSISTANT
# =========================================================

@app.post("/api/career-assistant")
def career_assistant(data: dict):

    try:

        # -------------------------------------------------
        # GET USER DATA
        # -------------------------------------------------

        message = clean_text(
            data.get("message")
        )

        goal = clean_text(
            data.get("career_goal")
        )

        experience = clean_text(
            data.get("experience")
        )

        skills = data.get(
            "skills",
            []
        )

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not message:

            return {
                "success": False,
                "message":
                    "Message is required."
            }

        # -------------------------------------------------
        # NORMALIZE SKILLS
        # -------------------------------------------------

        user_skills = normalize_skills(
            skills
        )

        skills_text = ", ".join(
            user_skills
        )

        # -------------------------------------------------
        # CHECK GEMINI
        # -------------------------------------------------

        if gemini_client is None:

            return {
                "success": False,
                "message":
                    "Gemini AI is not configured.",
                "error":
                    "Add GEMINI_API_KEY to ai-service/.env and restart the server."
            }

        # =================================================
        # CAREERPILOT SYSTEM INSTRUCTION
        # =================================================

        system_instruction = """

You are CareerPilot AI, an expert AI career mentor and software engineering
assistant.

Your job is to help users with:

- Career planning
- Career roadmaps
- Programming languages
- Software development
- Web development
- Backend development
- Frontend development
- Full-stack development
- Python
- Java
- JavaScript
- TypeScript
- C
- C++
- C#
- Go
- Rust
- Kotlin
- Swift
- PHP
- Ruby
- React
- Angular
- Vue
- Node.js
- Django
- Flask
- FastAPI
- Spring Boot
- .NET
- SQL
- Databases
- Data Science
- Machine Learning
- Artificial Intelligence
- DevOps
- Cloud
- AWS
- Azure
- GCP
- Docker
- Kubernetes
- Git/GitHub
- Resume improvement
- ATS optimization
- Job preparation
- Technical interviews
- Coding interviews
- DSA
- HR interviews
- Projects
- Portfolio building

IMPORTANT:

1. Never assume the user is a Python developer.

2. Always understand the user's actual career goal.

3. If the user wants Java, answer for Java.

4. If the user wants C++, answer for C++.

5. If the user wants JavaScript, answer for JavaScript.

6. If the user wants React, answer for React.

7. If the user wants Data Science, answer for Data Science.

8. If the user wants AI/ML, answer for AI/ML.

9. If the user wants DevOps, answer for DevOps.

10. If the user has no clear career goal, ask a short clarification question
or provide a general software career direction.

11. Use the user's current skills when making recommendations.

12. Identify missing skills when useful.

13. Give practical and realistic advice.

14. Prefer step-by-step explanations.

15. Recommend projects that match the user's career goal.

16. For interview questions, provide questions and explain answers when asked.

17. For roadmap requests, provide a logical progression from fundamentals
to projects and job preparation.

18. Do not blindly repeat the same generic roadmap.

19. Personalize your answer based on:

   - Career goal
   - Experience level
   - Current skills
   - User's question

20. The user may write in:

   - English
   - Hindi
   - Hinglish

Respond naturally in the same language/style used by the user.

If the user asks in Hinglish, answer in simple Hinglish.

Keep answers useful and practical.

You are not restricted to one programming language.

"""

        # =================================================
        # USER CONTEXT
        # =================================================

        user_prompt = f"""

USER PROFILE

Career Goal:

{goal if goal else "Not specified"}

Experience Level:

{experience if experience else "Not specified"}

Current Skills:

{skills_text if skills_text else "Not specified"}


USER QUESTION

{message}


TASK

Give a personalized career answer.

Consider the user's career goal, experience level and current skills.

If appropriate, include:

- What to learn
- What to improve
- Skill gaps
- Recommended technologies
- Projects
- Interview preparation
- Job preparation
- Practical next steps

Do not assume Python unless the user actually asks about Python.

"""

        # =================================================
        # GEMINI REQUEST
        # =================================================

        result = generate_gemini_response(
            prompt=user_prompt,
            system_instruction=system_instruction
        )

        answer = clean_text(
            result["answer"]
        )

        model_used = result["model"]

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,

            "message":
                "AI career advice generated successfully.",

            "assistant": {

                "answer":
                    answer,

                "career_goal":
                    goal,

                "experience_level":
                    experience,

                "current_skills":
                    user_skills,

                "model":
                    model_used
            }
        }

    except Exception as e:

        return {

            "success": False,

            "message":
                "Career assistant failed.",

            "error":
                str(e)
        }