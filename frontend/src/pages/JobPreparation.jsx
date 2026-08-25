import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function JobPreparation() {
  // =========================================================
  // STATE
  // =========================================================

  const [selectedType, setSelectedType] = useState("technical");

  const [selectedLanguage, setSelectedLanguage] =
    useState("");

  const [searchLanguage, setSearchLanguage] =
    useState("");

  const [resume, setResume] = useState(null);

  const [loadingResume, setLoadingResume] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [question, setQuestion] =
    useState(null);

  const [showQuestion, setShowQuestion] =
    useState(false);

  const languagesPerPage = 12;

  // =========================================================
  // ALL LANGUAGES / TECHNOLOGIES / FRAMEWORKS
  // =========================================================

  const languages = [
    // =======================================================
    // PROGRAMMING LANGUAGES
    // =======================================================

    "Assembly",
    "Bash",
    "C",
    "C++",
    "C#",
    "Clojure",
    "COBOL",
    "Crystal",
    "D",
    "Dart",
    "Elixir",
    "Elm",
    "Erlang",
    "F#",
    "Fortran",
    "Go",
    "Groovy",
    "Haskell",
    "Java",
    "JavaScript",
    "Julia",
    "Kotlin",
    "Lua",
    "MATLAB",
    "Objective-C",
    "OCaml",
    "Perl",
    "PHP",
    "PowerShell",
    "Prolog",
    "Python",
    "R",
    "Ruby",
    "Rust",
    "Scala",
    "Scheme",
    "Solidity",
    "SQL",
    "Swift",
    "TypeScript",
    "VB.NET",
    "Visual Basic",
    "VHDL",
    "Verilog",
    "Zig",
    "Ada",
    "Awk",
    "Dylan",
    "GDScript",
    "Hack",
    "Nim",
    "Racket",
    "Reason",
    "Smalltalk",
    "Tcl",
    "Vala",
    "WebAssembly",
    "X++",

    // =======================================================
    // WEB TECHNOLOGIES
    // =======================================================

    "HTML",
    "HTML5",
    "CSS",
    "CSS3",
    "Sass",
    "SCSS",
    "Less",
    "XML",
    "JSON",
    "REST API",
    "GraphQL",
    "WebSockets",

    // =======================================================
    // FRONTEND FRAMEWORKS / LIBRARIES
    // =======================================================

    "React",
    "React.js",
    "Next.js",
    "Angular",
    "Vue",
    "Vue.js",
    "Nuxt.js",
    "Svelte",
    "SvelteKit",
    "SolidJS",
    "Ember.js",
    "jQuery",
    "Redux",
    "Redux Toolkit",
    "Zustand",
    "MobX",
    "React Native",
    "Expo",

    // =======================================================
    // CSS FRAMEWORKS / UI
    // =======================================================

    "Tailwind CSS",
    "Bootstrap",
    "Material UI",
    "MUI",
    "Chakra UI",
    "Ant Design",
    "Bulma",
    "Foundation",

    // =======================================================
    // NODE / JAVASCRIPT BACKEND
    // =======================================================

    "Node.js",
    "Node",
    "Express",
    "Express.js",
    "NestJS",
    "Koa.js",
    "Fastify",

    // =======================================================
    // PYTHON FRAMEWORKS
    // =======================================================

    "Django",
    "Flask",
    "FastAPI",
    "Tornado",
    "Pyramid",
    "Streamlit",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Seaborn",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Keras",

    // =======================================================
    // JAVA FRAMEWORKS
    // =======================================================

    "Spring",
    "Spring Boot",
    "Spring MVC",
    "Hibernate",
    "Maven",
    "Gradle",

    // =======================================================
    // .NET
    // =======================================================

    ".NET",
    "ASP.NET",
    "ASP.NET Core",
    "Entity Framework",
    "Blazor",

    // =======================================================
    // PHP
    // =======================================================

    "Laravel",
    "Symfony",
    "CodeIgniter",
    "WordPress",

    // =======================================================
    // DATABASES
    // =======================================================

    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "MongoDB Atlas",
    "SQLite",
    "Oracle",
    "Oracle Database",
    "Microsoft SQL Server",
    "SQL Server",
    "MariaDB",
    "Redis",
    "Firebase",
    "Firestore",
    "Supabase",
    "DynamoDB",
    "Cassandra",
    "CouchDB",
    "Neo4j",

    // =======================================================
    // CLOUD
    // =======================================================

    "AWS",
    "Amazon Web Services",
    "Azure",
    "Microsoft Azure",
    "Google Cloud",
    "GCP",
    "Google Cloud Platform",
    "Firebase",
    "Vercel",
    "Netlify",
    "Render",
    "Railway",
    "DigitalOcean",

    // =======================================================
    // DEVOPS / CONTAINERS
    // =======================================================

    "Git",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "GitHub Actions",
    "CI/CD",
    "Nginx",
    "Apache",

    // =======================================================
    // AI / MACHINE LEARNING
    // =======================================================

    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "OpenAI",
    "Gemini",
    "Google Gemini",
    "LangChain",
    "LangGraph",
    "Hugging Face",
    "Transformers",
    "OpenCV",
    "NLTK",
    "spaCy",

    // =======================================================
    // DATA / ANALYTICS
    // =======================================================

    "Power BI",
    "Microsoft Power BI",
    "Excel",
    "Microsoft Excel",
    "Tableau",
    "Apache Spark",
    "PySpark",
    "Hadoop",
    "Jupyter",
    "Jupyter Notebook",

    // =======================================================
    // TESTING
    // =======================================================

    "Jest",
    "Vitest",
    "Mocha",
    "Chai",
    "Cypress",
    "Playwright",
    "Selenium",
    "PyTest",
    "JUnit",

    // =======================================================
    // TOOLS
    // =======================================================

    "VS Code",
    "Visual Studio Code",
    "Postman",
    "Swagger",
    "OpenAPI",
    "npm",
    "Yarn",
    "pnpm",
    "Vite",
    "Webpack",
    "Babel",
    "ESLint",
    "Prettier",

    // =======================================================
    // MOBILE
    // =======================================================

    "Flutter",
    "Android",
    "Android Studio",
    "Jetpack Compose",
    "Kotlin Multiplatform",
    "Ionic",
    "Cordova",

    // =======================================================
    // BLOCKCHAIN
    // =======================================================

    "Blockchain",
    "Ethereum",
    "Solana",
    "Web3",
    "Web3.js",
    "Ethers.js",
    "Hardhat",

    // =======================================================
    // OPERATING SYSTEMS
    // =======================================================

    "Linux",
    "Ubuntu",
    "Windows",
    "Unix",
    "macOS",
  ];

  // =========================================================
  // PREPARATION TYPES
  // =========================================================

  const preparationTypes = [
    {
      id: "technical",
      icon: "💻",
      title: "Technical Interview",
      description:
        "Prepare for technical questions based on your resume, skills, technology and selected job.",
    },
    {
      id: "hr",
      icon: "👔",
      title: "HR Interview",
      description:
        "Practice common HR questions and professional interview answers.",
    },
    {
      id: "dsa",
      icon: "🧠",
      title: "DSA",
      description:
        "Practice Data Structures and Algorithms questions for interviews.",
    },
    {
      id: "sql",
      icon: "🗄️",
      title: "SQL",
      description:
        "Practice SQL queries and database interview questions.",
    },
    {
      id: "gd",
      icon: "🗣️",
      title: "Group Discussion",
      description:
        "Practice GD topics, arguments and communication skills.",
    },
  ];

  // =========================================================
  // NORMALIZE VALUE
  // =========================================================

  const normalizeValue = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (
            item &&
            typeof item === "object"
          ) {
            return Object.values(item)
              .map((v) => String(v))
              .join(" ");
          }

          return String(item);
        })
        .join(" ");
    }

    if (typeof value === "object") {
      return Object.values(value)
        .map((item) =>
          typeof item === "object"
            ? JSON.stringify(item)
            : String(item)
        )
        .join(" ");
    }

    return String(value);
  };

  // =========================================================
  // BUILD RESUME TEXT
  // =========================================================

  const buildResumeText = (resumeData) => {
    if (!resumeData) {
      return "";
    }

    return [
      resumeData.skills,
      resumeData.summary,
      resumeData.projects,
      resumeData.experience,
      resumeData.education,
      resumeData.certifications,
    ]
      .map(normalizeValue)
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  // =========================================================
  // DETECTION ALIASES
  // =========================================================

  const detectionAliases = {
    "HTML": [
      "html",
      "html5",
    ],

    "HTML5": [
      "html5",
    ],

    "CSS": [
      "css",
      "css3",
    ],

    "CSS3": [
      "css3",
    ],

    "JavaScript": [
      "javascript",
      "java script",
      "js",
    ],

    "TypeScript": [
      "typescript",
      "ts",
    ],

    "C++": [
      "c++",
      "cpp",
      "c plus plus",
    ],

    "C#": [
      "c#",
      "c sharp",
      "csharp",
    ],

    "F#": [
      "f#",
      "f sharp",
      "fsharp",
    ],

    "VB.NET": [
      "vb.net",
      "vbnet",
      "visual basic .net",
      "visual basic net",
    ],

    "Visual Basic": [
      "visual basic",
      "vb",
    ],

    "Objective-C": [
      "objective-c",
      "objective c",
      "objectivec",
    ],

    "Python": [
      "python",
      "python3",
      "python 3",
    ],

    "Java": [
      "java",
    ],

    "SQL": [
      "sql",
    ],

    "React": [
      "react",
      "reactjs",
      "react.js",
    ],

    "React.js": [
      "react",
      "reactjs",
      "react.js",
    ],

    "Next.js": [
      "next.js",
      "nextjs",
      "next js",
    ],

    "Angular": [
      "angular",
      "angularjs",
      "angular.js",
    ],

    "Vue": [
      "vue",
      "vuejs",
      "vue.js",
    ],

    "Vue.js": [
      "vue",
      "vuejs",
      "vue.js",
    ],

    "Node.js": [
      "node.js",
      "nodejs",
      "node js",
    ],

    "Node": [
      "node.js",
      "nodejs",
      "node js",
    ],

    "Express": [
      "express",
      "expressjs",
      "express.js",
    ],

    "Express.js": [
      "express",
      "expressjs",
      "express.js",
    ],

    "Tailwind CSS": [
      "tailwind css",
      "tailwindcss",
    ],

    "Bootstrap": [
      "bootstrap",
    ],

    "Django": [
      "django",
    ],

    "Flask": [
      "flask",
    ],

    "FastAPI": [
      "fastapi",
      "fast api",
    ],

    "Streamlit": [
      "streamlit",
    ],

    "Pandas": [
      "pandas",
    ],

    "NumPy": [
      "numpy",
      "num py",
    ],

    "Matplotlib": [
      "matplotlib",
    ],

    "Scikit-learn": [
      "scikit-learn",
      "sklearn",
      "scikit learn",
    ],

    "TensorFlow": [
      "tensorflow",
      "tensor flow",
    ],

    "PyTorch": [
      "pytorch",
      "torch",
    ],

    "MySQL": [
      "mysql",
      "my sql",
    ],

    "PostgreSQL": [
      "postgresql",
      "postgres",
      "postgre sql",
    ],

    "MongoDB": [
      "mongodb",
      "mongo db",
      "mongo",
    ],

    "SQLite": [
      "sqlite",
    ],

    "Oracle": [
      "oracle",
      "oracle database",
    ],

    "SQL Server": [
      "sql server",
      "microsoft sql server",
    ],

    "Redis": [
      "redis",
    ],

    "Firebase": [
      "firebase",
    ],

    "Supabase": [
      "supabase",
    ],

    "Git": [
      "git",
    ],

    "GitHub": [
      "github",
      "git hub",
    ],

    "GitLab": [
      "gitlab",
      "git lab",
    ],

    "Docker": [
      "docker",
    ],

    "Kubernetes": [
      "kubernetes",
      "k8s",
    ],

    "AWS": [
      "aws",
      "amazon web services",
    ],

    "Azure": [
      "azure",
      "microsoft azure",
    ],

    "GCP": [
      "gcp",
      "google cloud",
      "google cloud platform",
    ],

    "Google Cloud": [
      "google cloud",
      "gcp",
    ],

    "Power BI": [
      "power bi",
      "powerbi",
    ],

    "Excel": [
      "excel",
      "microsoft excel",
    ],

    "Jupyter": [
      "jupyter",
      "jupyter notebook",
    ],

    "Vite": [
      "vite",
    ],

    "Postman": [
      "postman",
    ],

    "Swagger": [
      "swagger",
    ],

    "OpenAPI": [
      "openapi",
      "open api",
    ],

    "REST API": [
      "rest api",
      "restful api",
      "rest",
    ],

    "GraphQL": [
      "graphql",
      "graph ql",
    ],

    "Flutter": [
      "flutter",
    ],

    "Android": [
      "android",
    ],

    "Linux": [
      "linux",
    ],

    "Ubuntu": [
      "ubuntu",
    ],

    "Machine Learning": [
      "machine learning",
      "machinelearning",
      "ml",
    ],

    "Deep Learning": [
      "deep learning",
      "deeplearning",
      "dl",
    ],

    "Generative AI": [
      "generative ai",
      "gen ai",
      "genai",
    ],

    "OpenAI": [
      "openai",
      "open ai",
    ],

    "Gemini": [
      "gemini",
      "google gemini",
    ],

    "LangChain": [
      "langchain",
      "lang chain",
    ],

    "Hugging Face": [
      "hugging face",
      "huggingface",
    ],

    "PowerShell": [
      "powershell",
      "power shell",
    ],

    ".NET": [
      ".net",
      "dotnet",
      "dot net",
    ],

    "ASP.NET": [
      "asp.net",
      "aspnet",
      "asp net",
    ],

    "Spring Boot": [
      "spring boot",
      "springboot",
    ],

    "Laravel": [
      "laravel",
    ],

    "WordPress": [
      "wordpress",
      "word press",
    ],
  };

  // =========================================================
  // EXACT TERM DETECTION
  // =========================================================

  const containsTechnology = (
    text,
    term
  ) => {
    if (!text || !term) {
      return false;
    }

    const normalizedTerm =
      term
        .toLowerCase()
        .trim();

    // -------------------------------------------------------
    // Special case: C
    // -------------------------------------------------------

    if (normalizedTerm === "c") {
      return (
        /(^|[^a-z0-9+#])c([^a-z0-9+#]|$)/i.test(
          text
        ) ||
        /\bc programming\b/i.test(
          text
        ) ||
        /\bc language\b/i.test(
          text
        )
      );
    }

    // -------------------------------------------------------
    // Special case: D
    // -------------------------------------------------------

    if (normalizedTerm === "d") {
      return (
        /(^|[^a-z0-9+#])d([^a-z0-9+#]|$)/i.test(
          text
        ) ||
        /\bd programming\b/i.test(
          text
        ) ||
        /\bd language\b/i.test(
          text
        )
      );
    }

    // -------------------------------------------------------
    // Java exact matching
    // Prevent JavaScript => Java
    // -------------------------------------------------------

    if (normalizedTerm === "java") {
      return (
        /(^|[^a-z0-9])java([^a-z0-9]|$)/i.test(
          text
        )
      );
    }

    // -------------------------------------------------------
    // R exact matching
    // -------------------------------------------------------

    if (normalizedTerm === "r") {
      return (
        /(^|[^a-z0-9])r([^a-z0-9]|$)/i.test(
          text
        ) ||
        /\br programming\b/i.test(
          text
        )
      );
    }

    // -------------------------------------------------------
    // SQL exact matching
    // -------------------------------------------------------

    if (normalizedTerm === "sql") {
      return /\bsql\b/i.test(text);
    }

    // -------------------------------------------------------
    // Regular word boundary
    // -------------------------------------------------------

    const escaped =
      normalizedTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const regex = new RegExp(
      `(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,
      "i"
    );

    return regex.test(text);
  };

  // =========================================================
  // DETECT LANGUAGES / TECHNOLOGIES FROM RESUME
  // =========================================================

  const detectLanguages = (
    resumeData
  ) => {
    if (!resumeData) {
      return [];
    }

    const resumeText =
      buildResumeText(
        resumeData
      );

    if (!resumeText) {
      return [];
    }

    const detected =
      languages.filter(
        (technology) => {
          const aliases =
            detectionAliases[
              technology
            ] || [technology];

          return aliases.some(
            (alias) =>
              containsTechnology(
                resumeText,
                alias
              )
          );
        }
      );

    // =======================================================
    // REMOVE DUPLICATE TECHNOLOGY GROUPS
    // =======================================================

    const duplicateGroups = [
      ["HTML", "HTML5"],
      ["CSS", "CSS3"],
      ["React", "React.js"],
      ["Node", "Node.js"],
      ["Express", "Express.js"],
      ["Vue", "Vue.js"],
      ["AWS", "Amazon Web Services"],
      ["GCP", "Google Cloud"],
      ["JavaScript"],
      ["Python"],
    ];

    let finalDetected = [
      ...detected,
    ];

    duplicateGroups.forEach(
      (group) => {
        const found =
          group.find(
            (item) =>
              finalDetected.includes(
                item
              )
          );

        if (found) {
          finalDetected =
            finalDetected.filter(
              (item) =>
                !(
                  group.includes(
                    item
                  ) &&
                  item !== found
                )
            );
        }
      }
    );

    return finalDetected;
  };

  // =========================================================
  // FETCH RESUME
  // =========================================================

  useEffect(() => {
    const fetchResume =
      async () => {
        try {
          setLoadingResume(true);
          setError("");

          const {
            data: userData,
            error: userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !userData?.user
          ) {
            window.location.href = "/";
            return;
          }

          const userId =
            userData.user.id;

          const {
            data,
            error: resumeError,
          } =
            await supabase
              .from("resumes")
              .select("*")
              .eq(
                "user_id",
                userId
              )
              .order(
                "updated_at",
                {
                  ascending: false,
                }
              )
              .limit(1)
              .maybeSingle();

          if (resumeError) {
            console.error(
              "Resume fetch error:",
              resumeError
            );

            setError(
              "Unable to load resume data."
            );

            return;
          }

          if (data) {
            setResume(data);

            const detected =
              detectLanguages(
                data
              );

            console.log(
              "Detected technologies:",
              detected
            );

            if (
              detected.length > 0
            ) {
              setSelectedLanguage(
                detected[0]
              );
            }
          }
        } catch (err) {
          console.error(
            "Job preparation resume error:",
            err
          );

          setError(
            "Something went wrong while loading your resume."
          );
        } finally {
          setLoadingResume(false);
        }
      };

    fetchResume();
  }, []);

  // =========================================================
  // DETECTED TECHNOLOGIES
  // =========================================================

  const detectedLanguages =
    useMemo(() => {
      return detectLanguages(
        resume
      );
    }, [resume]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredLanguages =
    useMemo(() => {
      const search =
        searchLanguage
          .trim()
          .toLowerCase();

      if (!search) {
        return languages;
      }

      return languages.filter(
        (technology) =>
          technology
            .toLowerCase()
            .includes(search)
      );
    }, [
      searchLanguage,
    ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredLanguages.length /
          languagesPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    languagesPerPage;

  const visibleLanguages =
    filteredLanguages.slice(
      startIndex,
      startIndex +
        languagesPerPage
    );

  // =========================================================
  // SEARCH HANDLER
  // =========================================================

  const handleLanguageSearch =
    (event) => {
      setSearchLanguage(
        event.target.value
      );

      setCurrentPage(1);
    };

  // =========================================================
  // PREPARATION TYPE
  // =========================================================

  const handleTypeChange =
    (type) => {
      setSelectedType(type);

      setQuestion(null);
      setShowQuestion(false);
      setError("");

      // HR / SQL / GD do not require language
      if (
        type === "hr" ||
        type === "sql" ||
        type === "gd"
      ) {
        // Keep selected language
        // but don't require it.
      }
    };

  // =========================================================
  // TECHNOLOGY SELECT
  // =========================================================

  const handleLanguageSelect =
    (language) => {
      setSelectedLanguage(
        language
      );

      setError("");
      setQuestion(null);
      setShowQuestion(false);
    };

  // =========================================================
  // START AI PREPARATION
  // =========================================================

  const startPreparation =
    async () => {
      try {
        setStarting(true);
        setError("");
        setQuestion(null);
        setShowQuestion(false);

        // ---------------------------------------------------
        // Language required for Technical / DSA
        // ---------------------------------------------------

        if (
          (
            selectedType ===
              "technical" ||
            selectedType ===
              "dsa"
          ) &&
          !selectedLanguage
        ) {
          setError(
            "Please select a programming language or technology first."
          );

          return;
        }

        // ---------------------------------------------------
        // USER
        // ---------------------------------------------------

        const {
          data: userData,
        } =
          await supabase.auth.getUser();

        if (!userData?.user) {
          window.location.href = "/";
          return;
        }

        // ---------------------------------------------------
        // TYPE MAP
        // ---------------------------------------------------

        const typeMap = {
          technical:
            "Technical Interview",

          hr:
            "HR Interview",

          dsa:
            "DSA",

          sql:
            "SQL",

          gd:
            "Group Discussion",
        };

        const preparationType =
          typeMap[
            selectedType
          ];

        // ---------------------------------------------------
        // RESUME PAYLOAD
        // ---------------------------------------------------

        const resumePayload =
          resume || {
            name:
              userData.user
                .email ||
              "Candidate",

            skills: [],

            summary: "",

            projects: "",

            education: "",

            experience: "",

            certifications: "",
          };

        // ---------------------------------------------------
        // BACKEND
        // ---------------------------------------------------

        const response =
          await fetch(
            "http://localhost:5000/api/interview/start",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                resume:
                  resumePayload,

                job: {
                  title:
                    "General Interview",

                  company: "",

                  description: "",
                },

                preparation_type:
                  preparationType,

                language:
                  selectedLanguage ||
                  "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "AI preparation failed."
          );
        }

        if (
          !data.success ||
          !data.question
        ) {
          throw new Error(
            "AI did not return a valid interview question."
          );
        }

        setQuestion(
          data.question
        );

        setShowQuestion(true);

        // Scroll to question
        setTimeout(() => {
          window.scrollTo({
            top:
              document.body
                .scrollHeight,
            behavior:
              "smooth",
          });
        }, 100);
      } catch (err) {
        console.error(
          "AI preparation error:",
          err
        );

        setError(
          err.message ||
            "Unable to start AI preparation."
        );
      } finally {
        setStarting(false);
      }
    };

  // =========================================================
  // BACK
  // =========================================================

  const goBack = () => {
    window.location.href =
      "/dashboard";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingResume) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#f8fafc",

          color:
            "#0f172a",
        }}
      >
        <div
          style={{
            background:
              "#ffffff",

            padding:
              "35px",

            borderRadius:
              "16px",

            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",

            textAlign:
              "center",
          }}
        >
          <h2>
            🤖 Loading Job Preparation...
          </h2>

          <p
            style={{
              color:
                "#64748b",
            }}
          >
            Loading your resume and skills.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",

        padding:
          "40px",

        background:
          "#f8fafc",

        color:
          "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth:
            "1150px",

          margin:
            "0 auto",
        }}
      >
        {/* ===================================================
            BACK
        =================================================== */}

        <button
          onClick={goBack}
          style={{
            border:
              "none",

            background:
              "transparent",

            cursor:
              "pointer",

            fontSize:
              "15px",

            marginBottom:
              "25px",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          style={{
            marginBottom:
              "30px",
          }}
        >
          <h1
            style={{
              fontSize:
                "34px",

              fontWeight:
                "700",

              marginBottom:
                "10px",
            }}
          >
            💼 Job Preparation
          </h1>

          <p
            style={{
              fontSize:
                "17px",

              color:
                "#64748b",

              maxWidth:
                "850px",

              lineHeight:
                "1.6",
            }}
          >
            Prepare for real-world
            technical interviews,
            HR interviews, DSA,
            SQL and Group
            Discussions using
            AI-powered preparation.
          </p>
        </div>

        {/* ===================================================
            AI INFO
        =================================================== */}

        <div
          style={{
            padding:
              "18px",

            borderRadius:
              "12px",

            background:
              "#ecfdf5",

            border:
              "1px solid #a7f3d0",

            marginBottom:
              "30px",
          }}
        >
          <strong>
            🤖 AI Interview Preparation
          </strong>

          <p
            style={{
              marginTop:
                "6px",

              marginBottom:
                0,

              color:
                "#475569",
            }}
          >
            AI uses your resume,
            skills, selected
            technology and
            preparation type to
            generate personalized
            interview questions.
          </p>
        </div>

        {/* ===================================================
            PREPARATION TYPES
        =================================================== */}

        <h2
          style={{
            fontSize:
              "24px",

            marginBottom:
              "20px",
          }}
        >
          Choose Preparation Type
        </h2>

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",

            gap:
              "20px",
          }}
        >
          {preparationTypes.map(
            (type) => {
              const isSelected =
                selectedType ===
                type.id;

              return (
                <div
                  key={
                    type.id
                  }
                  onClick={() =>
                    handleTypeChange(
                      type.id
                    )
                  }
                  style={{
                    padding:
                      "25px",

                    borderRadius:
                      "16px",

                    background:
                      "#ffffff",

                    border:
                      isSelected
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",

                    cursor:
                      "pointer",

                    boxShadow:
                      isSelected
                        ? "0 8px 25px rgba(37,99,235,0.12)"
                        : "0 4px 15px rgba(0,0,0,0.04)",

                    transition:
                      "0.2s",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "34px",

                      marginBottom:
                        "15px",
                    }}
                  >
                    {
                      type.icon
                    }
                  </div>

                  <h3
                    style={{
                      fontSize:
                        "20px",

                      marginBottom:
                        "10px",
                    }}
                  >
                    {
                      type.title
                    }
                  </h3>

                  <p
                    style={{
                      color:
                        "#64748b",

                      lineHeight:
                        "1.5",

                      margin:
                        0,
                    }}
                  >
                    {
                      type.description
                    }
                  </p>

                  {isSelected && (
                    <div
                      style={{
                        marginTop:
                          "15px",

                        color:
                          "#2563eb",

                        fontWeight:
                          "600",
                      }}
                    >
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* ===================================================
            TECHNOLOGY SECTION
        =================================================== */}

        {(
          selectedType ===
            "technical" ||
          selectedType ===
            "dsa"
        ) && (
          <div
            style={{
              marginTop:
                "35px",

              padding:
                "25px",

              background:
                "#ffffff",

              borderRadius:
                "16px",

              border:
                "1px solid #e2e8f0",

              boxShadow:
                "0 4px 15px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                fontSize:
                  "24px",

                marginBottom:
                  "8px",
              }}
            >
              💻 Choose Technology /
              Programming Language
            </h2>

            <p
              style={{
                color:
                  "#64748b",

                marginBottom:
                  "20px",
              }}
            >
              Select the programming
              language, framework,
              library, database or
              technology you want
              to practice.
            </p>

            {/* =================================================
                DETECTED
            ================================================= */}

            {detectedLanguages.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    "20px",

                  padding:
                    "15px",

                  borderRadius:
                    "12px",

                  background:
                    "#eff6ff",

                  border:
                    "1px solid #bfdbfe",
                }}
              >
                <strong>
                  🤖 Detected from Resume
                </strong>

                <div
                  style={{
                    display:
                      "flex",

                    flexWrap:
                      "wrap",

                    gap:
                      "8px",

                    marginTop:
                      "12px",
                  }}
                >
                  {detectedLanguages.map(
                    (
                      technology
                    ) => (
                      <button
                        key={
                          technology
                        }
                        onClick={() =>
                          handleLanguageSelect(
                            technology
                          )
                        }
                        style={{
                          padding:
                            "7px 12px",

                          borderRadius:
                            "20px",

                          border:
                            "1px solid #93c5fd",

                          background:
                            selectedLanguage ===
                            technology
                              ? "#2563eb"
                              : "#ffffff",

                          color:
                            selectedLanguage ===
                            technology
                              ? "#ffffff"
                              : "#1d4ed8",

                          cursor:
                            "pointer",

                          fontWeight:
                            "600",
                        }}
                      >
                        {
                          technology
                        }
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                SEARCH
            ================================================= */}

            <div
              style={{
                position:
                  "relative",

                marginBottom:
                  "20px",
              }}
            >
              <span
                style={{
                  position:
                    "absolute",

                  left:
                    "14px",

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  fontSize:
                    "18px",
                }}
              >
                🔍
              </span>

              <input
                type="text"
                value={
                  searchLanguage
                }
                onChange={
                  handleLanguageSearch
                }
                placeholder="Search language, framework, database or technology..."
                style={{
                  width:
                    "100%",

                  boxSizing:
                    "border-box",

                  padding:
                    "13px 15px 13px 42px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #cbd5e1",

                  fontSize:
                    "15px",

                  outline:
                    "none",
                }}
              />
            </div>

            {/* =================================================
                TECHNOLOGY GRID
            ================================================= */}

            {visibleLanguages.length >
            0 ? (
              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",

                  gap:
                    "12px",
                }}
              >
                {visibleLanguages.map(
                  (
                    technology
                  ) => {
                    const isSelected =
                      selectedLanguage ===
                      technology;

                    const isDetected =
                      detectedLanguages.includes(
                        technology
                      );

                    return (
                      <button
                        key={
                          technology
                        }
                        onClick={() =>
                          handleLanguageSelect(
                            technology
                          )
                        }
                        style={{
                          padding:
                            "15px",

                          borderRadius:
                            "10px",

                          border:
                            isSelected
                              ? "2px solid #2563eb"
                              : isDetected
                              ? "2px solid #93c5fd"
                              : "1px solid #e2e8f0",

                          background:
                            isSelected
                              ? "#eff6ff"
                              : "#ffffff",

                          cursor:
                            "pointer",

                          textAlign:
                            "left",

                          fontWeight:
                            "600",

                          color:
                            "#0f172a",
                        }}
                      >
                        <div>
                          {
                            technology
                          }
                        </div>

                        {isDetected && (
                          <small
                            style={{
                              color:
                                "#2563eb",

                              display:
                                "block",

                              marginTop:
                                "5px",
                            }}
                          >
                            ✓ In Resume
                          </small>
                        )}

                        {isSelected && (
                          <small
                            style={{
                              color:
                                "#2563eb",

                              display:
                                "block",

                              marginTop:
                                "5px",
                            }}
                          >
                            ✓ Selected
                          </small>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  padding:
                    "25px",

                  textAlign:
                    "center",

                  color:
                    "#64748b",

                  background:
                    "#f8fafc",

                  borderRadius:
                    "10px",
                }}
              >
                No technology found.
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages >
              1 && (
              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap:
                    "15px",

                  marginTop:
                    "25px",
                }}
              >
                <button
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  style={{
                    padding:
                      "9px 16px",

                    borderRadius:
                      "8px",

                    border:
                      "1px solid #cbd5e1",

                    background:
                      safeCurrentPage ===
                      1
                        ? "#e2e8f0"
                        : "#ffffff",

                    cursor:
                      safeCurrentPage ===
                      1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ← Previous
                </button>

                <span
                  style={{
                    fontWeight:
                      "600",
                  }}
                >
                  Page{" "}
                  {
                    safeCurrentPage
                  }{" "}
                  of{" "}
                  {
                    totalPages
                  }
                </span>

                <button
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  style={{
                    padding:
                      "9px 16px",

                    borderRadius:
                      "8px",

                    border:
                      "1px solid #cbd5e1",

                    background:
                      safeCurrentPage ===
                      totalPages
                        ? "#e2e8f0"
                        : "#ffffff",

                    cursor:
                      safeCurrentPage ===
                      totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            READY
        =================================================== */}

        <div
          style={{
            marginTop:
              "35px",

            padding:
              "25px",

            background:
              "#ffffff",

            borderRadius:
              "16px",

            border:
              "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              fontSize:
                "22px",

              marginBottom:
                "10px",
            }}
          >
            Ready to Prepare 🚀
          </h2>

          <p
            style={{
              color:
                "#64748b",

              lineHeight:
                "1.6",
            }}
          >
            You selected{" "}
            <strong>
              {
                preparationTypes.find(
                  (item) =>
                    item.id ===
                    selectedType
                )?.title
              }
            </strong>
            .

            {selectedLanguage &&
              (
                selectedType ===
                  "technical" ||
                selectedType ===
                  "dsa"
              ) && (
                <>
                  {" "}
                  Technology /
                  Language:{" "}
                  <strong>
                    {
                      selectedLanguage
                    }
                  </strong>
                  .
                </>
              )}
          </p>

          {error && (
            <div
              style={{
                marginTop:
                  "15px",

                padding:
                  "12px 15px",

                borderRadius:
                  "10px",

                background:
                  "#fef2f2",

                border:
                  "1px solid #fecaca",

                color:
                  "#b91c1c",
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            onClick={
              startPreparation
            }
            disabled={
              starting ||
              (
                (
                  selectedType ===
                    "technical" ||
                  selectedType ===
                    "dsa"
                ) &&
                !selectedLanguage
              )
            }
            style={{
              marginTop:
                "20px",

              padding:
                "13px 24px",

              borderRadius:
                "10px",

              border:
                "none",

              background:
                starting ||
                (
                  (
                    selectedType ===
                      "technical" ||
                    selectedType ===
                      "dsa"
                  ) &&
                  !selectedLanguage
                )
                  ? "#94a3b8"
                  : "#2563eb",

              color:
                "#ffffff",

              fontSize:
                "16px",

              fontWeight:
                "600",

              cursor:
                starting
                  ? "wait"
                  : "pointer",
            }}
          >
            {starting
              ? "🤖 Generating..."
              : "🚀 Start AI Preparation"}
          </button>
        </div>

        {/* ===================================================
            AI QUESTION
        =================================================== */}

        {showQuestion &&
          question && (
            <div
              style={{
                marginTop:
                  "30px",

                padding:
                  "30px",

                background:
                  "#ffffff",

                borderRadius:
                  "16px",

                border:
                  "2px solid #7c3aed",

                boxShadow:
                  "0 10px 30px rgba(124,58,237,0.10)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap:
                    "15px",

                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin:
                      0,
                  }}
                >
                  🤖 AI Interview Question
                </h2>

                <span
                  style={{
                    padding:
                      "6px 12px",

                    borderRadius:
                      "20px",

                    background:
                      "#ede9fe",

                    color:
                      "#6d28d9",

                    fontWeight:
                      "600",
                  }}
                >
                  {
                    question.difficulty ||
                    "Beginner"
                  }
                </span>
              </div>

              <div
                style={{
                  marginBottom:
                    "15px",

                  color:
                    "#64748b",
                }}
              >
                Topic:{" "}
                <strong
                  style={{
                    color:
                      "#0f172a",
                  }}
                >
                  {
                    question.topic ||
                    selectedLanguage ||
                    "Interview"
                  }
                </strong>
              </div>

              <div
                style={{
                  padding:
                    "20px",

                  borderRadius:
                    "12px",

                  background:
                    "#f8fafc",

                  fontSize:
                    "18px",

                  lineHeight:
                    "1.7",

                  fontWeight:
                    "600",
                }}
              >
                {
                  question.question
                }
              </div>

              {question.hint && (
                <div
                  style={{
                    marginTop:
                      "20px",

                    padding:
                      "15px",

                    borderRadius:
                      "10px",

                    background:
                      "#fffbeb",

                    border:
                      "1px solid #fde68a",
                  }}
                >
                  💡{" "}
                  <strong>
                    Hint:
                  </strong>{" "}
                  {
                    question.hint
                  }
                </div>
              )}

              {Array.isArray(
                question.expected_answer_points
              ) &&
                question
                  .expected_answer_points
                  .length >
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    <h3>
                      🎯 What your answer should cover
                    </h3>

                    <ul
                      style={{
                        lineHeight:
                          "1.8",

                        color:
                          "#475569",
                      }}
                    >
                      {question.expected_answer_points.map(
                        (
                          point,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                          >
                            {
                              point
                            }
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              <button
                onClick={
                  startPreparation
                }
                disabled={
                  starting
                }
                style={{
                  marginTop:
                    "20px",

                  padding:
                    "11px 20px",

                  borderRadius:
                    "9px",

                  border:
                    "none",

                  background:
                    "#7c3aed",

                  color:
                    "#ffffff",

                  fontWeight:
                    "600",

                  cursor:
                    starting
                      ? "wait"
                      : "pointer",
                }}
              >
                🔄 Generate Another Question
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default JobPreparation;