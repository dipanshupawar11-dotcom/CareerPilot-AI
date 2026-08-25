import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// =========================================================
// BACKEND URL
// =========================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL
).replace(/\/+$/, "");

// =========================================================
// CAREER ROADMAP
// =========================================================

function CareerRoadmap() {
  // =======================================================
  // USER
  // =======================================================

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // =======================================================
  // RESUME
  // =======================================================

  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeFound, setResumeFound] = useState(false);
  const [resumeError, setResumeError] = useState("");

  // =======================================================
  // FORM
  // =======================================================

  const [careerGoal, setCareerGoal] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [currentSkills, setCurrentSkills] = useState("");

  // =======================================================
  // ROADMAP
  // =======================================================

  const [roadmap, setRoadmap] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTopic, setSearchTopic] = useState("");

  // =======================================================
  // COMPLETED TOPICS
  // =======================================================

  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "careerpilot_completed_topics"
      );

      const parsed = saved ? JSON.parse(saved) : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // =======================================================
  // LOAD USER
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const { data, error } =
          await supabase.auth.getUser();

        if (error) {
          console.error("Supabase user error:", error);
        }

        if (!mounted) return;

        if (error || !data?.user) {
          window.location.href = "/";
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("User loading error:", error);

        if (mounted) {
          window.location.href = "/";
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // =======================================================
  // SAVE COMPLETED TOPICS
  // =======================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "careerpilot_completed_topics",
        JSON.stringify(completedTopics)
      );
    } catch (error) {
      console.error(
        "Could not save progress:",
        error
      );
    }
  }, [completedTopics]);

  // =======================================================
  // NORMALIZE SKILL
  // =======================================================

  const normalizeSkill = (skill) => {
    if (skill === null || skill === undefined) {
      return "";
    }

    return String(skill)
      .trim()
      .toLowerCase()
      .replace(/\(basic\)/gi, "")
      .replace(/\(advanced\)/gi, "")
      .replace(/\(intermediate\)/gi, "")
      .replace(/\bbasic\b/gi, "")
      .replace(/\badvanced\b/gi, "")
      .replace(/\bintermediate\b/gi, "")
      .replace(/\.js$/i, "javascript")
      .replace(/\.js\b/gi, "javascript")
      .replace(/\.jsx$/i, "react")
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  };

  // =======================================================
  // PARSE POSSIBLE JSON STRING
  // =======================================================

  const safelyParseJSON = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  };

  // =======================================================
  // PARSE RESUME SKILLS
  // =======================================================

  const parseResumeSkills = (skillsData) => {
    if (
      skillsData === null ||
      skillsData === undefined
    ) {
      return [];
    }

    // -----------------------------------------------------
    // JSON string
    // -----------------------------------------------------

    const parsedData = safelyParseJSON(skillsData);

    if (parsedData !== skillsData) {
      return parseResumeSkills(parsedData);
    }

    // -----------------------------------------------------
    // String
    // -----------------------------------------------------

    if (typeof skillsData === "string") {
      let text = skillsData;

      if (!text.trim()) {
        return [];
      }

      text = text
        .replace(/technical skills\s*:/gi, "")
        .replace(/technical skill\s*:/gi, "")
        .replace(/skills\s*:/gi, "")
        .replace(/skill\s*:/gi, "")
        .replace(/languages?\s*:/gi, "")
        .replace(/programming languages?\s*:/gi, "")
        .replace(/frontend\s*:/gi, "")
        .replace(/backend\s*:/gi, "")
        .replace(/tools\s*&?\s*platforms?\s*:/gi, "")
        .replace(/databases?\s*:/gi, "")
        .replace(/technologies?\s*:/gi, "")
        .replace(/tech stack\s*:/gi, "");

      const skills = text
        .split(/[,;|•\n]+/)
        .map((skill) => skill.trim())
        .filter(Boolean);

      return [
        ...new Set(
          skills.map((skill) =>
            skill.trim()
          )
        ),
      ];
    }

    // -----------------------------------------------------
    // Array
    // -----------------------------------------------------

    if (Array.isArray(skillsData)) {
      const result = [];

      skillsData.forEach((item) => {
        result.push(
          ...parseResumeSkills(item)
        );
      });

      return [...new Set(result)];
    }

    // -----------------------------------------------------
    // Object
    // -----------------------------------------------------

    if (typeof skillsData === "object") {
      const result = [];

      Object.entries(skillsData).forEach(
        ([key, value]) => {
          const ignoredKeys = [
            "id",
            "user_id",
            "created_at",
            "updated_at",
          ];

          if (
            ignoredKeys.includes(
              key.toLowerCase()
            )
          ) {
            return;
          }

          result.push(
            ...parseResumeSkills(value)
          );
        }
      );

      return [...new Set(result)];
    }

    return [];
  };

  // =======================================================
  // EXTRACT RESUME OBJECT
  // =======================================================

  const extractResumeObject = (result) => {
    if (!result) {
      return null;
    }

    // data
    if (result.data) {
      if (Array.isArray(result.data)) {
        return result.data[0] || null;
      }

      if (
        typeof result.data === "object"
      ) {
        return result.data;
      }
    }

    // resume
    if (result.resume) {
      if (Array.isArray(result.resume)) {
        return result.resume[0] || null;
      }

      if (
        typeof result.resume === "object"
      ) {
        return result.resume;
      }
    }

    // result
    if (result.result) {
      if (Array.isArray(result.result)) {
        return result.result[0] || null;
      }

      if (
        typeof result.result === "object"
      ) {
        return result.result;
      }
    }

    // direct resume object
    if (
      result.id ||
      result.user_id ||
      result.skills ||
      result.technical_skills ||
      result.technicalSkills
    ) {
      return result;
    }

    return null;
  };

  // =======================================================
  // EXTRACT SKILLS FROM RESUME
  // =======================================================

  const extractSkillsFromResume = (resume) => {
    if (!resume) {
      return [];
    }

    const fields = [
      resume.skills,
      resume.skill,

      resume.technical_skills,
      resume.technicalSkills,

      resume.programming_languages,
      resume.programmingLanguages,

      resume.languages,

      resume.frontend,
      resume.frontend_skills,
      resume.frontendSkills,

      resume.backend,
      resume.backend_skills,
      resume.backendSkills,

      resume.tools,
      resume.tools_platforms,
      resume.toolsPlatforms,

      resume.databases,
      resume.database,

      resume.technologies,
      resume.tech_stack,
      resume.techStack,

      resume.skills_data,
      resume.skillsData,
    ];

    const result = [];

    fields.forEach((field) => {
      result.push(
        ...parseResumeSkills(field)
      );
    });

    // -----------------------------------------------------
    // If standard fields didn't work,
    // inspect resume object for likely skill fields.
    // -----------------------------------------------------

    Object.entries(resume).forEach(
      ([key, value]) => {
        const normalizedKey =
          key.toLowerCase().replace(
            /[_\s-]/g,
            ""
          );

        const possibleSkillKey =
          normalizedKey.includes("skill") ||
          normalizedKey.includes("technolog") ||
          normalizedKey.includes("programming") ||
          normalizedKey === "languages" ||
          normalizedKey.includes("techstack");

        if (possibleSkillKey) {
          result.push(
            ...parseResumeSkills(value)
          );
        }
      }
    );

    return [
      ...new Set(
        result
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean)
      ),
    ];
  };

  // =======================================================
  // LOAD RESUME
  // =======================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let mounted = true;

    const loadResume = async () => {
      setResumeLoading(true);
      setResumeError("");

      try {
        const url =
          `${API_BASE_URL}/api/resume?user_id=` +
          encodeURIComponent(user.id);

        console.log(
          "CareerRoadmap resume URL:",
          url
        );

        const response =
          await fetch(url);

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let result = null;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          result = await response.json();
        } else {
          const text =
            await response.text();

          try {
            result = JSON.parse(text);
          } catch {
            throw new Error(
              `Resume API returned non-JSON response: ${text.slice(
                0,
                200
              )}`
            );
          }
        }

        console.log(
          "Resume API response:",
          result
        );

        if (!response.ok) {
          if (response.status === 404) {
            if (!mounted) return;

            setResumeFound(false);
            setCurrentSkills("");
            return;
          }

          throw new Error(
            result?.message ||
              result?.error ||
              `Resume API failed with status ${response.status}`
          );
        }

        const resume =
          extractResumeObject(result);

        console.log(
          "Extracted resume:",
          resume
        );

        if (!resume) {
          if (!mounted) return;

          setResumeFound(false);
          setCurrentSkills("");
          return;
        }

        const parsedSkills =
          extractSkillsFromResume(
            resume
          );

        console.log(
          "Detected resume skills:",
          parsedSkills
        );

        if (!mounted) return;

        setResumeFound(
          parsedSkills.length > 0 ||
            Boolean(resume.id)
        );

        if (parsedSkills.length > 0) {
          setCurrentSkills(
            parsedSkills.join(", ")
          );
        }

        // -------------------------------------------------
        // Career Goal
        // -------------------------------------------------

        const resumeGoal =
          resume.career_goal ||
          resume.careerGoal ||
          resume.target_role ||
          resume.targetRole ||
          "";

        if (
          typeof resumeGoal === "string" &&
          resumeGoal.trim()
        ) {
          setCareerGoal(
            resumeGoal.trim()
          );
        }

        // -------------------------------------------------
        // Experience
        // -------------------------------------------------

        const resumeExperience =
          resume.experience_level ||
          resume.experienceLevel ||
          resume.experience ||
          "";

        if (
          typeof resumeExperience ===
            "string" &&
          [
            "Beginner",
            "Intermediate",
            "Advanced",
          ].includes(resumeExperience)
        ) {
          setExperience(
            resumeExperience
          );
        }
      } catch (error) {
        console.error(
          "Resume loading error:",
          error
        );

        if (!mounted) return;

        setResumeError(
          error?.message ||
            "Unable to load resume"
        );

        setResumeFound(false);
      } finally {
        if (mounted) {
          setResumeLoading(false);
        }
      }
    };

    loadResume();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // =======================================================
  // TOPIC DATABASE
  // =======================================================

  const topicDatabase = {
    python: {
      name: "Python",

      phases: [
        {
          title: "Python Fundamentals",
          duration: "2 Weeks",

          topics: [
            {
              name: "Variables",
              difficulty: "Beginner",

              definition:
                "Variables are names used to store values in a Python program.",

              concepts: [
                "Variable declaration",
                "Variable assignment",
                "Dynamic typing",
                "Naming rules",
              ],

              example:
`name = "Deepanshu"
age = 22
city = "Bangalore"

print(name)
print(age)
print(city)`,

              codingQuestion:
                "Create variables for your name, age and city and print them.",

              interviewQuestions: [
                "What is a variable in Python?",
                "Does Python require variable type declaration?",
                "What is dynamic typing?",
              ],

              practiceQuestions: [
                "Create variables for name and age.",
                "Swap two variables.",
                "Store three numbers and calculate their average.",
              ],
            },

            {
              name: "Data Types",
              difficulty: "Beginner",

              definition:
                "Data types define what kind of value a variable contains.",

              concepts: [
                "int",
                "float",
                "str",
                "bool",
                "list",
                "tuple",
                "set",
                "dict",
              ],

              example:
`age = 22
price = 99.5
name = "Python"
is_student = True

print(type(age))
print(type(price))
print(type(name))
print(type(is_student))`,

              codingQuestion:
                "Create variables using at least five different Python data types.",

              interviewQuestions: [
                "What are Python's built-in data types?",
                "Difference between list and tuple?",
                "What is mutable and immutable?",
              ],

              practiceQuestions: [
                "Create an integer variable.",
                "Create a list of five programming languages.",
                "Create a dictionary containing student information.",
              ],
            },

            {
              name: "Strings",
              difficulty: "Beginner",

              definition:
                "A string is a sequence of characters enclosed in quotes.",

              concepts: [
                "Indexing",
                "Slicing",
                "String methods",
                "Formatting",
                "f-strings",
              ],

              example:
`name = "CareerPilot"

print(name[0])
print(name[-1])
print(name[0:7])

print(name.upper())
print(name.lower())`,

              codingQuestion:
                "Write a program that reverses a string.",

              interviewQuestions: [
                "Are Python strings mutable?",
                "What is string slicing?",
                "Difference between == and is?",
              ],

              practiceQuestions: [
                "Reverse a string.",
                "Count vowels.",
                "Check whether a string is palindrome.",
              ],
            },

            {
              name: "Lists",
              difficulty: "Beginner",

              definition:
                "A list is an ordered and mutable collection of elements.",

              concepts: [
                "Creating lists",
                "Indexing",
                "Slicing",
                "append",
                "insert",
                "remove",
                "pop",
                "sort",
              ],

              example:
`skills = [
    "Python",
    "SQL",
    "React"
]

skills.append("Git")

print(skills)`,

              codingQuestion:
                "Create a list of numbers and find the largest number.",

              interviewQuestions: [
                "What is a list?",
                "Why are lists mutable?",
                "Difference between append() and extend()?",
              ],

              practiceQuestions: [
                "Find maximum element.",
                "Remove duplicates.",
                "Reverse a list.",
              ],
            },

            {
              name: "Tuples",
              difficulty: "Beginner",

              definition:
                "A tuple is an ordered immutable collection.",

              concepts: [
                "Tuple creation",
                "Indexing",
                "Slicing",
                "Immutability",
                "Tuple unpacking",
              ],

              example:
`student = (
    "Deepanshu",
    22,
    "CSE"
)

name, age, branch = student

print(name)
print(age)
print(branch)`,

              codingQuestion:
                "Create a tuple containing five programming languages.",

              interviewQuestions: [
                "What is a tuple?",
                "List vs tuple?",
                "Why are tuples immutable?",
              ],

              practiceQuestions: [
                "Create a tuple.",
                "Unpack a tuple.",
                "Convert tuple to list.",
              ],
            },

            {
              name: "Sets",
              difficulty: "Beginner",

              definition:
                "A set is an unordered collection of unique elements.",

              concepts: [
                "Unique values",
                "Union",
                "Intersection",
                "Difference",
              ],

              example:
`skills = {
    "Python",
    "SQL",
    "Python",
    "Git"
}

print(skills)`,

              codingQuestion:
                "Remove duplicate values from a list using a set.",

              interviewQuestions: [
                "What is a set?",
                "Why does a set remove duplicates?",
                "List vs set?",
              ],

              practiceQuestions: [
                "Find union.",
                "Find intersection.",
                "Remove duplicates.",
              ],
            },

            {
              name: "Dictionaries",
              difficulty: "Beginner",

              definition:
                "A dictionary stores data as key-value pairs.",

              concepts: [
                "Keys",
                "Values",
                "get()",
                "items()",
                "keys()",
                "values()",
              ],

              example:
`student = {
    "name": "Deepanshu",
    "age": 22,
    "branch": "CSE"
}

print(student["name"])
print(student.get("age"))`,

              codingQuestion:
                "Create a dictionary containing employee information.",

              interviewQuestions: [
                "What is a dictionary?",
                "Can dictionary keys be duplicated?",
                "Why must dictionary keys be hashable?",
              ],

              practiceQuestions: [
                "Create student dictionary.",
                "Count character frequency.",
                "Create nested dictionary.",
              ],
            },
          ],
        },

        {
          title: "Control Flow & Functions",
          duration: "2 Weeks",

          topics: [
            {
              name: "if else",
              difficulty: "Beginner",

              definition:
                "Conditional statements execute code based on whether a condition is true or false.",

              concepts: [
                "if",
                "elif",
                "else",
                "Nested conditions",
                "Comparison operators",
              ],

              example:
`age = 20

if age >= 18:
    print("Eligible")
else:
    print("Not eligible")`,

              codingQuestion:
                "Write a program to check whether a number is positive, negative or zero.",

              interviewQuestions: [
                "What is conditional branching?",
                "Difference between if and elif?",
                "Can we have multiple elif blocks?",
              ],

              practiceQuestions: [
                "Check even or odd.",
                "Find largest of three numbers.",
                "Check leap year.",
              ],
            },

            {
              name: "for loop",
              difficulty: "Beginner",

              definition:
                "A for loop is used to iterate over a sequence or collection.",

              concepts: [
                "range()",
                "Iteration",
                "Nested loops",
                "break",
                "continue",
              ],

              example:
`for i in range(1, 6):
    print(i)`,

              codingQuestion:
                "Print numbers from 1 to 100 and calculate their sum.",

              interviewQuestions: [
                "How does a for loop work?",
                "What does range() return?",
                "Difference between break and continue?",
              ],

              practiceQuestions: [
                "Print multiplication table.",
                "Print even numbers.",
                "Find factorial.",
              ],
            },

            {
              name: "while loop",
              difficulty: "Beginner",

              definition:
                "A while loop repeatedly executes code while a condition remains true.",

              concepts: [
                "Condition",
                "Iteration",
                "Infinite loop",
                "break",
                "continue",
              ],

              example:
`count = 1

while count <= 5:
    print(count)
    count += 1`,

              codingQuestion:
                "Create a number guessing game using a while loop.",

              interviewQuestions: [
                "When should you use while loop?",
                "How can an infinite loop occur?",
              ],

              practiceQuestions: [
                "Reverse a number.",
                "Count digits.",
                "Palindrome number.",
              ],
            },

            {
              name: "Functions",
              difficulty: "Beginner",

              definition:
                "A function is a reusable block of code designed to perform a specific task.",

              concepts: [
                "def",
                "Parameters",
                "Arguments",
                "Return value",
                "Default arguments",
                "Keyword arguments",
              ],

              example:
`def add(a, b):
    return a + b

result = add(10, 20)

print(result)`,

              codingQuestion:
                "Create a function that checks whether a number is prime.",

              interviewQuestions: [
                "What is a function?",
                "Parameter vs argument?",
                "What does return do?",
              ],

              practiceQuestions: [
                "Create factorial function.",
                "Create prime checker.",
                "Create palindrome function.",
              ],
            },

            {
              name: "Lambda",
              difficulty: "Intermediate",

              definition:
                "A lambda function is a small anonymous function written in a single expression.",

              concepts: [
                "Anonymous functions",
                "Arguments",
                "Expression",
                "map",
                "filter",
              ],

              example:
`square = lambda x: x * x

print(square(5))`,

              codingQuestion:
                "Use lambda to square every number in a list.",

              interviewQuestions: [
                "What is lambda?",
                "Lambda vs normal function?",
                "Where is lambda commonly used?",
              ],

              practiceQuestions: [
                "Square numbers.",
                "Filter even numbers.",
                "Sort using lambda.",
              ],
            },

            {
              name: "Recursion",
              difficulty: "Intermediate",

              definition:
                "Recursion occurs when a function calls itself to solve a smaller version of a problem.",

              concepts: [
                "Base case",
                "Recursive case",
                "Call stack",
                "Factorial",
                "Fibonacci",
              ],

              example:
`def factorial(n):

    if n == 0:
        return 1

    return n * factorial(n - 1)

print(factorial(5))`,

              codingQuestion:
                "Write a recursive function to calculate Fibonacci numbers.",

              interviewQuestions: [
                "What is recursion?",
                "What is a base case?",
                "Recursion vs iteration?",
              ],

              practiceQuestions: [
                "Factorial.",
                "Fibonacci.",
                "Sum of digits.",
              ],
            },
          ],
        },

        {
          title: "Advanced Python",
          duration: "3 Weeks",

          topics: [
            {
              name: "OOP",
              difficulty: "Intermediate",

              definition:
                "Object-Oriented Programming organizes software using classes and objects.",

              concepts: [
                "Class",
                "Object",
                "Constructor",
                "Inheritance",
                "Encapsulation",
                "Polymorphism",
                "Abstraction",
              ],

              example:
`class Student:

    def __init__(self, name):
        self.name = name

    def show(self):
        print(self.name)


student = Student("Deepanshu")

student.show()`,

              codingQuestion:
                "Create a Student class with name, age and marks.",

              interviewQuestions: [
                "What is OOP?",
                "What is inheritance?",
                "What is polymorphism?",
                "What is encapsulation?",
              ],

              practiceQuestions: [
                "Create Employee class.",
                "Implement inheritance.",
                "Create banking system using OOP.",
              ],
            },

            {
              name: "File Handling",
              difficulty: "Intermediate",

              definition:
                "File handling allows Python programs to read and write data stored in files.",

              concepts: [
                "open()",
                "read()",
                "write()",
                "append",
                "with statement",
              ],

              example:
`with open("data.txt", "w") as file:
    file.write("CareerPilot AI")

with open("data.txt", "r") as file:
    print(file.read())`,

              codingQuestion:
                "Create a program that stores student information in a text file.",

              interviewQuestions: [
                "How do you open a file?",
                "Difference between read and write mode?",
                "Why use with open()?",
              ],

              practiceQuestions: [
                "Read a file.",
                "Write to a file.",
                "Count words in a file.",
              ],
            },

            {
              name: "JSON",
              difficulty: "Intermediate",

              definition:
                "JSON is a lightweight data-interchange format commonly used by APIs.",

              concepts: [
                "JSON object",
                "JSON array",
                "json.loads()",
                "json.dumps()",
                "JSON files",
              ],

              example:
`import json

student = {
    "name": "Deepanshu",
    "skills": ["Python", "SQL"]
}

data = json.dumps(student)

print(data)`,

              codingQuestion:
                "Create a JSON file containing employee information.",

              interviewQuestions: [
                "What is JSON?",
                "JSON vs Python dictionary?",
                "loads vs dumps?",
              ],

              practiceQuestions: [
                "Read JSON.",
                "Write JSON.",
                "Convert dictionary to JSON.",
              ],
            },
          ],
        },
      ],
    },

    dsa: {
      name: "DSA",

      phases: [
        {
          title: "DSA Fundamentals",
          duration: "3 Weeks",

          topics: [
            {
              name: "Complexity / Big-O",
              difficulty: "Beginner",

              definition:
                "Big-O notation describes how an algorithm's time or space requirements grow as input size increases.",

              concepts: [
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n log n)",
                "O(n²)",
              ],

              example:
`for (let i = 0; i < n; i++) {
    console.log(i);
}

// Time Complexity: O(n)`,

              codingQuestion:
                "Determine the time complexity of common loops.",

              interviewQuestions: [
                "What is Big-O?",
                "Difference between time and space complexity?",
                "What is O(n log n)?",
              ],

              practiceQuestions: [
                "Analyze nested loop.",
                "Analyze binary search.",
                "Analyze sorting algorithm.",
              ],
            },

            {
              name: "Arrays",
              difficulty: "Beginner",

              definition:
                "An array stores elements in contiguous memory locations and allows indexed access.",

              concepts: [
                "Traversal",
                "Insertion",
                "Deletion",
                "Searching",
                "Prefix sum",
              ],

              example:
`const arr = [10, 20, 30, 40];

for (const value of arr) {
    console.log(value);
}`,

              codingQuestion:
                "Find the largest element in an array.",

              interviewQuestions: [
                "What is an array?",
                "Array vs linked list?",
                "What is random access?",
              ],

              practiceQuestions: [
                "Two Sum.",
                "Maximum subarray.",
                "Rotate array.",
                "Move zeroes.",
              ],
            },

            {
              name: "Strings",
              difficulty: "Beginner",

              definition:
                "String problems involve processing sequences of characters efficiently.",

              concepts: [
                "Frequency counting",
                "Palindrome",
                "Anagram",
                "Substrings",
                "Two pointers",
              ],

              example:
`const text = "level";

const reversed =
    text
      .split("")
      .reverse()
      .join("");

console.log(
    text === reversed
);`,

              codingQuestion:
                "Check whether a string is a palindrome.",

              interviewQuestions: [
                "How do you reverse a string?",
                "How do you check an anagram?",
              ],

              practiceQuestions: [
                "Valid palindrome.",
                "Anagram.",
                "Longest substring.",
              ],
            },

            {
              name: "Linked List",
              difficulty: "Intermediate",

              definition:
                "A linked list is a sequence of nodes where each node contains data and a reference to another node.",

              concepts: [
                "Node",
                "Head",
                "Traversal",
                "Insertion",
                "Deletion",
                "Fast and slow pointers",
              ],

              example:
`class Node {

    constructor(value) {
        this.value = value;
        this.next = null;
    }
}`,

              codingQuestion:
                "Reverse a singly linked list.",

              interviewQuestions: [
                "Array vs linked list?",
                "What is a doubly linked list?",
                "What is a circular linked list?",
              ],

              practiceQuestions: [
                "Reverse linked list.",
                "Detect cycle.",
                "Find middle node.",
              ],
            },

            {
              name: "Stack",
              difficulty: "Intermediate",

              definition:
                "A stack follows the Last-In-First-Out (LIFO) principle.",

              concepts: [
                "Push",
                "Pop",
                "Peek",
                "LIFO",
              ],

              example:
`const stack = [];

stack.push(10);
stack.push(20);

console.log(stack.pop());`,

              codingQuestion:
                "Implement a stack using an array.",

              interviewQuestions: [
                "What is stack?",
                "What is LIFO?",
                "Where are stacks used?",
              ],

              practiceQuestions: [
                "Valid parentheses.",
                "Min stack.",
                "Next greater element.",
              ],
            },

            {
              name: "Queue",
              difficulty: "Intermediate",

              definition:
                "A queue follows the First-In-First-Out (FIFO) principle.",

              concepts: [
                "Enqueue",
                "Dequeue",
                "Front",
                "Rear",
                "FIFO",
              ],

              example:
`const queue = [];

queue.push("A");
queue.push("B");

console.log(
    queue.shift()
);`,

              codingQuestion:
                "Implement a queue.",

              interviewQuestions: [
                "What is queue?",
                "Stack vs queue?",
                "Where are queues used?",
              ],

              practiceQuestions: [
                "Circular queue.",
                "Queue using stacks.",
                "BFS.",
              ],
            },
          ],
        },

        {
          title: "Advanced DSA",
          duration: "5 Weeks",

          topics: [
            {
              name: "Trees",
              difficulty: "Intermediate",

              definition:
                "A tree is a hierarchical data structure consisting of nodes connected by edges.",

              concepts: [
                "Root",
                "Parent",
                "Child",
                "Leaf",
                "Traversal",
              ],

              example:
`class Node {

    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}`,

              codingQuestion:
                "Implement inorder traversal of a binary tree.",

              interviewQuestions: [
                "What is a binary tree?",
                "What is BST?",
                "Difference between BFS and DFS?",
              ],

              practiceQuestions: [
                "Inorder traversal.",
                "Preorder traversal.",
                "Postorder traversal.",
                "Maximum depth.",
              ],
            },

            {
              name: "Graphs",
              difficulty: "Advanced",

              definition:
                "A graph is a collection of vertices connected by edges.",

              concepts: [
                "Vertex",
                "Edge",
                "Directed graph",
                "Undirected graph",
                "BFS",
                "DFS",
              ],

              example:
`const graph = {
    A: ["B", "C"],
    B: ["A", "D"],
    C: ["A"],
    D: ["B"]
};`,

              codingQuestion:
                "Implement BFS traversal of a graph.",

              interviewQuestions: [
                "What is a graph?",
                "BFS vs DFS?",
                "What is a directed graph?",
              ],

              practiceQuestions: [
                "Number of islands.",
                "Detect cycle.",
                "Shortest path.",
              ],
            },

            {
              name: "Dynamic Programming",
              difficulty: "Advanced",

              definition:
                "Dynamic Programming solves complex problems by storing solutions to overlapping subproblems.",

              concepts: [
                "Overlapping subproblems",
                "Optimal substructure",
                "Memoization",
                "Tabulation",
              ],

              example:
`function fibonacci(n, memo = {}) {

    if (n <= 1) {
        return n;
    }

    if (memo[n]) {
        return memo[n];
    }

    memo[n] =
        fibonacci(n - 1, memo) +
        fibonacci(n - 2, memo);

    return memo[n];
}`,

              codingQuestion:
                "Solve Fibonacci using memoization.",

              interviewQuestions: [
                "What is dynamic programming?",
                "Memoization vs tabulation?",
                "When should DP be used?",
              ],

              practiceQuestions: [
                "Climbing stairs.",
                "House robber.",
                "0/1 Knapsack.",
              ],
            },
          ],
        },
      ],
    },

    sql: {
      name: "SQL & Databases",

      phases: [
        {
          title: "SQL Fundamentals",
          duration: "2 Weeks",

          topics: [
            {
              name: "SELECT",
              difficulty: "Beginner",

              definition:
                "SELECT is used to retrieve data from database tables.",

              concepts: [
                "SELECT",
                "FROM",
                "WHERE",
                "ORDER BY",
                "LIMIT",
              ],

              example:
`SELECT name, salary
FROM employees
WHERE salary > 30000
ORDER BY salary DESC;`,

              codingQuestion:
                "Write a query to find employees earning more than 50,000.",

              interviewQuestions: [
                "What is SQL?",
                "What is SELECT?",
                "What is WHERE?",
              ],

              practiceQuestions: [
                "Find highest salary.",
                "Find employees from IT.",
                "Sort employees by salary.",
              ],
            },

            {
              name: "JOIN",
              difficulty: "Intermediate",

              definition:
                "JOIN combines rows from multiple database tables using related columns.",

              concepts: [
                "INNER JOIN",
                "LEFT JOIN",
                "RIGHT JOIN",
                "FULL JOIN",
              ],

              example:
`SELECT
    employees.name,
    departments.name
FROM employees
INNER JOIN departments
ON employees.department_id =
   departments.id;`,

              codingQuestion:
                "Join employees and departments tables.",

              interviewQuestions: [
                "What is JOIN?",
                "INNER JOIN vs LEFT JOIN?",
                "What is primary key?",
              ],

              practiceQuestions: [
                "Employee department join.",
                "Customer order join.",
                "Student course join.",
              ],
            },

            {
              name: "GROUP BY",
              difficulty: "Intermediate",

              definition:
                "GROUP BY groups rows having the same values so aggregate calculations can be performed.",

              concepts: [
                "GROUP BY",
                "COUNT",
                "SUM",
                "AVG",
                "MAX",
                "MIN",
              ],

              example:
`SELECT department, COUNT(*)
FROM employees
GROUP BY department;`,

              codingQuestion:
                "Find the number of employees in each department.",

              interviewQuestions: [
                "What is GROUP BY?",
                "WHERE vs HAVING?",
                "What are aggregate functions?",
              ],

              practiceQuestions: [
                "Department count.",
                "Average salary.",
                "Highest salary per department.",
              ],
            },
          ],
        },
      ],
    },

    javascript: {
      name: "JavaScript",

      phases: [
        {
          title: "JavaScript Fundamentals",
          duration: "2 Weeks",

          topics: [
            {
              name: "Variables",
              difficulty: "Beginner",

              definition:
                "Variables store values that can be used throughout a JavaScript program.",

              concepts: [
                "var",
                "let",
                "const",
                "Scope",
                "Hoisting",
              ],

              example:
`let name = "Deepanshu";
const age = 22;

console.log(name);
console.log(age);`,

              codingQuestion:
                "Create variables for name, age and skills and print them.",

              interviewQuestions: [
                "Difference between var, let and const?",
                "What is scope?",
                "What is hoisting?",
              ],

              practiceQuestions: [
                "Create variables.",
                "Swap two values.",
                "Calculate average.",
              ],
            },

            {
              name: "Functions",
              difficulty: "Beginner",

              definition:
                "Functions are reusable blocks of JavaScript code.",

              concepts: [
                "Function declaration",
                "Parameters",
                "Return",
                "Arrow functions",
                "Callback functions",
              ],

              example:
`function add(a, b) {
    return a + b;
}

console.log(add(10, 20));`,

              codingQuestion:
                "Create a function to check whether a number is prime.",

              interviewQuestions: [
                "What is a function?",
                "What is an arrow function?",
                "What is a callback?",
              ],

              practiceQuestions: [
                "Create calculator functions.",
                "Prime checker.",
                "Palindrome checker.",
              ],
            },

            {
              name: "Arrays",
              difficulty: "Beginner",

              definition:
                "Arrays store multiple values in a single JavaScript variable.",

              concepts: [
                "Indexing",
                "push",
                "pop",
                "map",
                "filter",
                "reduce",
              ],

              example:
`const numbers = [1, 2, 3, 4, 5];

const squares =
    numbers.map(
        n => n * n
    );

console.log(squares);`,

              codingQuestion:
                "Find all even numbers from an array.",

              interviewQuestions: [
                "What is an array?",
                "map vs filter?",
                "What does reduce do?",
              ],

              practiceQuestions: [
                "Reverse array.",
                "Find maximum.",
                "Remove duplicates.",
              ],
            },

            {
              name: "DOM",
              difficulty: "Intermediate",

              definition:
                "The DOM represents an HTML document as objects that JavaScript can read and modify.",

              concepts: [
                "querySelector",
                "getElementById",
                "Events",
                "Event listeners",
                "DOM manipulation",
              ],

              example:
`const button =
    document.querySelector("#btn");

button.addEventListener(
    "click",
    () => {
        alert("Hello");
    }
);`,

              codingQuestion:
                "Create a button that changes the page text when clicked.",

              interviewQuestions: [
                "What is DOM?",
                "What is event bubbling?",
                "What is event listener?",
              ],

              practiceQuestions: [
                "Create counter.",
                "Create form validation.",
                "Create dark mode.",
              ],
            },
          ],
        },
      ],
    },

    html: {
      name: "HTML",

      phases: [
        {
          title: "HTML Fundamentals",
          duration: "1 Week",

          topics: [
            {
              name: "HTML Basics",
              difficulty: "Beginner",

              definition:
                "HTML is the markup language used to structure web pages.",

              concepts: [
                "Elements",
                "Tags",
                "Attributes",
                "Headings",
                "Paragraphs",
                "Links",
                "Images",
              ],

              example:
`<!DOCTYPE html>

<html>

<head>
    <title>CareerPilot</title>
</head>

<body>

    <h1>Hello World</h1>

    <p>
        My first webpage.
    </p>

</body>

</html>`,

              codingQuestion:
                "Create a personal portfolio webpage using HTML.",

              interviewQuestions: [
                "What is HTML?",
                "HTML vs HTML5?",
                "What are semantic elements?",
              ],

              practiceQuestions: [
                "Create portfolio.",
                "Create registration form.",
                "Create table.",
              ],
            },

            {
              name: "Forms",
              difficulty: "Beginner",

              definition:
                "HTML forms collect user input through controls such as text fields, checkboxes and buttons.",

              concepts: [
                "form",
                "input",
                "label",
                "select",
                "textarea",
                "button",
              ],

              example:
`<form>
    <label>Name</label>
    <input type="text" />

    <button type="submit">
        Submit
    </button>
</form>`,

              codingQuestion:
                "Create a registration form using HTML.",

              interviewQuestions: [
                "What is an HTML form?",
                "Difference between GET and POST?",
                "What is semantic HTML?",
              ],

              practiceQuestions: [
                "Registration form.",
                "Login form.",
                "Contact form.",
              ],
            },
          ],
        },
      ],
    },

    react: {
      name: "React",

      phases: [
        {
          title: "React Fundamentals",
          duration: "2 Weeks",

          topics: [
            {
              name: "Components",
              difficulty: "Beginner",

              definition:
                "Components are reusable building blocks of React applications.",

              concepts: [
                "Functional components",
                "JSX",
                "Props",
                "Component reuse",
              ],

              example:
`function Welcome() {

    return (
        <h1>
            Welcome to CareerPilot
        </h1>
    );
}

export default Welcome;`,

              codingQuestion:
                "Create a reusable UserCard React component.",

              interviewQuestions: [
                "What is React?",
                "What is a component?",
                "What is JSX?",
              ],

              practiceQuestions: [
                "Create Navbar.",
                "Create Card component.",
                "Create Profile component.",
              ],
            },

            {
              name: "useState",
              difficulty: "Beginner",

              definition:
                "useState is a React Hook used to store and update component state.",

              concepts: [
                "State",
                "Setter function",
                "Re-render",
                "Initial state",
              ],

              example:
`import { useState } from "react";

function Counter() {

    const [count, setCount] =
        useState(0);

    return (
        <button
            onClick={() =>
                setCount(count + 1)
            }
        >
            {count}
        </button>
    );
}`,

              codingQuestion:
                "Build a counter using useState.",

              interviewQuestions: [
                "What is state?",
                "What is useState?",
                "Why does React re-render?",
              ],

              practiceQuestions: [
                "Counter.",
                "Todo list.",
                "Form state.",
              ],
            },

            {
              name: "useEffect",
              difficulty: "Intermediate",

              definition:
                "useEffect is used to perform side effects such as API calls and subscriptions in React components.",

              concepts: [
                "Side effects",
                "Dependency array",
                "API calls",
                "Cleanup",
              ],

              example:
`useEffect(() => {

    fetch("/api/jobs")
        .then(res => res.json())
        .then(data => {
            console.log(data);
        });

}, []);`,

              codingQuestion:
                "Fetch jobs from an API when the component loads.",

              interviewQuestions: [
                "What is useEffect?",
                "What does [] mean?",
                "When does useEffect execute?",
              ],

              practiceQuestions: [
                "Fetch API data.",
                "Create loading state.",
                "Create search API.",
              ],
            },

            {
              name: "Props",
              difficulty: "Beginner",

              definition:
                "Props are inputs passed from a parent component to a child component.",

              concepts: [
                "Passing props",
                "Receiving props",
                "Props destructuring",
                "Parent-child communication",
              ],

              example:
`function UserCard({ name }) {
    return <h2>{name}</h2>;
}

function App() {
    return (
        <UserCard
            name="Deepanshu"
        />
    );
}`,

              codingQuestion:
                "Create a reusable card component using props.",

              interviewQuestions: [
                "What are props?",
                "Props vs state?",
                "Can child components modify props?",
              ],

              practiceQuestions: [
                "UserCard.",
                "ProductCard.",
                "JobCard.",
              ],
            },
          ],
        },
      ],
    },

    java: {
      name: "Java",

      phases: [
        {
          title: "Java Fundamentals",
          duration: "3 Weeks",

          topics: [
            {
              name: "Java Basics",
              difficulty: "Beginner",

              definition:
                "Java is an object-oriented programming language designed to be portable across platforms.",

              concepts: [
                "JDK",
                "JRE",
                "JVM",
                "Variables",
                "Data types",
                "Operators",
              ],

              example:
`public class Main {

    public static void main(String[] args) {

        int age = 22;

        System.out.println(age);
    }
}`,

              codingQuestion:
                "Write a Java program to check whether a number is even or odd.",

              interviewQuestions: [
                "What is JVM?",
                "JDK vs JRE?",
                "Why is Java platform independent?",
              ],

              practiceQuestions: [
                "Even/odd.",
                "Prime number.",
                "Factorial.",
              ],
            },

            {
              name: "OOP in Java",
              difficulty: "Intermediate",

              definition:
                "Java uses classes and objects to implement object-oriented programming.",

              concepts: [
                "Class",
                "Object",
                "Inheritance",
                "Polymorphism",
                "Encapsulation",
                "Abstraction",
              ],

              example:
`class Student {

    String name;

    Student(String name) {
        this.name = name;
    }

    void show() {
        System.out.println(name);
    }
}`,

              codingQuestion:
                "Create an Employee class using constructor and methods.",

              interviewQuestions: [
                "What are the four pillars of OOP?",
                "What is method overloading?",
                "What is method overriding?",
              ],

              practiceQuestions: [
                "Student class.",
                "Bank account.",
                "Employee management system.",
              ],
            },
          ],
        },
      ],
    },

    git: {
      name: "Git & GitHub",

      phases: [
        {
          title: "Git Fundamentals",
          duration: "1 Week",

          topics: [
            {
              name: "Git Basics",
              difficulty: "Beginner",

              definition:
                "Git is a distributed version control system used to track code changes.",

              concepts: [
                "Repository",
                "Commit",
                "Branch",
                "Merge",
                "Clone",
                "Push",
                "Pull",
              ],

              example:
`git init
git add .
git commit -m "Initial commit"
git push origin main`,

              codingQuestion:
                "Create a Git repository and push a project to GitHub.",

              interviewQuestions: [
                "What is Git?",
                "Git vs GitHub?",
                "What is a branch?",
                "What is merge?",
              ],

              practiceQuestions: [
                "Create repository.",
                "Create branch.",
                "Merge branch.",
              ],
            },
          ],
        },
      ],
    },

    fastapi: {
      name: "FastAPI",

      phases: [
        {
          title: "FastAPI Fundamentals",
          duration: "2 Weeks",

          topics: [
            {
              name: "REST API",
              difficulty: "Intermediate",

              definition:
                "A REST API allows applications to communicate using HTTP methods and structured data.",

              concepts: [
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "Request",
                "Response",
                "JSON",
              ],

              example:
`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message":
        "CareerPilot AI"
    }`,

              codingQuestion:
                "Create a FastAPI endpoint that returns a list of jobs.",

              interviewQuestions: [
                "What is REST API?",
                "GET vs POST?",
                "What is HTTP status code?",
              ],

              practiceQuestions: [
                "Create GET API.",
                "Create POST API.",
                "Connect API with database.",
              ],
            },

            {
              name: "Pydantic Models",
              difficulty: "Intermediate",

              definition:
                "Pydantic models validate and structure request and response data in FastAPI applications.",

              concepts: [
                "BaseModel",
                "Validation",
                "Request body",
                "Type hints",
              ],

              example:
`from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int`,

              codingQuestion:
                "Create a FastAPI POST endpoint using a Pydantic model.",

              interviewQuestions: [
                "What is Pydantic?",
                "Why is validation important?",
                "What is BaseModel?",
              ],

              practiceQuestions: [
                "Create User model.",
                "Create Job model.",
                "Validate API request.",
              ],
            },
          ],
        },
      ],
    },
  };

  // =======================================================
  // ALL TOPICS
  // =======================================================

  const allTopics = topicDatabase;

  // =======================================================
  // SKILL MATCH HELPER
  // =======================================================

  const hasSkill = (
    skills,
    possibleNames
  ) => {
    return skills.some((skill) => {
      return possibleNames.some(
        (name) =>
          skill === name ||
          skill.includes(name)
      );
    });
  };

  // =======================================================
  // DETECT ROADMAP
  // =======================================================

  const detectRoadmap = (
    skillsText,
    goal
  ) => {
    const skills =
      parseResumeSkills(skillsText);

    const normalizedSkills = skills
      .map(normalizeSkill)
      .filter(Boolean);

    const goalText =
      normalizeSkill(goal);

    console.log(
      "Raw skills:",
      skills
    );

    console.log(
      "Normalized skills:",
      normalizedSkills
    );

    console.log(
      "Goal:",
      goalText
    );

    const selected = [];

    // -----------------------------------------------------
    // PYTHON
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        ["python"]
      ) ||
      goalText.includes("python")
    ) {
      selected.push("python");
    }

    // -----------------------------------------------------
    // JAVASCRIPT
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "javascript",
          "js",
        ]
      ) ||
      goalText.includes(
        "javascript"
      )
    ) {
      selected.push("javascript");
    }

    // -----------------------------------------------------
    // JAVA
    // -----------------------------------------------------

    if (
      normalizedSkills.some(
        (skill) =>
          skill === "java" ||
          skill.startsWith("java")
      ) ||
      goalText === "java" ||
      goalText.includes(
        "javadeveloper"
      )
    ) {
      selected.push("java");
    }

    // -----------------------------------------------------
    // DSA
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "dsa",
          "datastructures",
          "datastructure",
          "algorithms",
          "algorithm",
        ]
      ) ||
      goalText.includes(
        "developer"
      ) ||
      goalText.includes(
        "dsa"
      ) ||
      goalText.includes(
        "softwareengineer"
      ) ||
      goalText.includes(
        "softwaredeveloper"
      ) ||
      goalText.includes(
        "fullstackdeveloper"
      ) ||
      goalText.includes(
        "backenddeveloper"
      ) ||
      goalText.includes(
        "frontenddeveloper"
      )
    ) {
      selected.push("dsa");
    }

    // -----------------------------------------------------
    // SQL
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "sql",
          "mysql",
          "postgresql",
          "postgres",
          "mssql",
          "oracle",
        ]
      ) ||
      goalText.includes("data") ||
      goalText.includes(
        "sql"
      )
    ) {
      selected.push("sql");
    }

    // -----------------------------------------------------
    // HTML
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "html",
          "html5",
        ]
      ) ||
      goalText.includes(
        "frontend"
      ) ||
      goalText.includes(
        "webdeveloper"
      ) ||
      goalText.includes(
        "webdeveloper"
      )
    ) {
      selected.push("html");
    }

    // -----------------------------------------------------
    // REACT
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "react",
          "reactjs",
        ]
      ) ||
      goalText.includes(
        "react"
      )
    ) {
      selected.push("react");
    }

    // -----------------------------------------------------
    // GIT
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "git",
          "github",
        ]
      )
    ) {
      selected.push("git");
    }

    // -----------------------------------------------------
    // FASTAPI
    // -----------------------------------------------------

    if (
      hasSkill(
        normalizedSkills,
        [
          "fastapi",
        ]
      ) ||
      goalText.includes(
        "backend"
      ) ||
      goalText.includes(
        "pythonbackend"
      )
    ) {
      selected.push("fastapi");
    }

    return [
      ...new Set(selected),
    ];
  };

  // =======================================================
  // GENERATE ROADMAP
  // =======================================================

  const generateRoadmap = () => {
    const detected =
      detectRoadmap(
        currentSkills,
        careerGoal
      );

    console.log(
      "Detected roadmap tracks:",
      detected
    );

    if (
      detected.length === 0
    ) {
      alert(
        "No matching roadmap found. Please enter a valid career goal or skills such as Python, SQL, React, JavaScript, Java, HTML, DSA, Git or FastAPI."
      );

      return;
    }

    const selectedData =
      detected
        .map(
          (key) =>
            allTopics[key]
        )
        .filter(Boolean);

    let phaseNumber = 1;

    const phases = [];

    selectedData.forEach(
      (track) => {
        track.phases.forEach(
          (phase) => {
            phases.push({
              ...phase,

              id:
                `${track.name}-${phase.title}-${phaseNumber}`,

              number:
                phaseNumber++,

              source:
                track.name,
            });
          }
        );
      }
    );

    setRoadmap({
      careerGoal:
        careerGoal.trim() ||
        "Software Developer",

      experience,

      skills:
        currentSkills,

      selectedSkills:
        detected.map(
          (key) =>
            allTopics[key].name
        ),

      phases,
    });

    setSelectedTopic(null);
    setSearchTopic("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // TOTAL TOPICS
  // =======================================================

  const totalTopics = useMemo(() => {
    if (!roadmap) {
      return 0;
    }

    return roadmap.phases.reduce(
      (total, phase) =>
        total +
        phase.topics.length,
      0
    );
  }, [roadmap]);

  // =======================================================
  // CURRENT ROADMAP TOPICS
  // =======================================================

  const currentRoadmapTopicIds =
    useMemo(() => {
      if (!roadmap) {
        return [];
      }

      return roadmap.phases.flatMap(
        (phase) =>
          phase.topics.map(
            (topic) =>
              `${phase.id}::${topic.name}`
          )
      );
    }, [roadmap]);

  // =======================================================
  // COMPLETED VISIBLE COUNT
  // =======================================================

  const completedVisibleCount =
    useMemo(() => {
      if (!roadmap) {
        return 0;
      }

      return completedTopics.filter(
        (id) =>
          currentRoadmapTopicIds.includes(
            id
          )
      ).length;
    }, [
      completedTopics,
      currentRoadmapTopicIds,
      roadmap,
    ]);

  // =======================================================
  // PROGRESS
  // =======================================================

  const progress = useMemo(() => {
    if (!totalTopics) {
      return 0;
    }

    return Math.round(
      (completedVisibleCount /
        totalTopics) *
        100
    );
  }, [
    completedVisibleCount,
    totalTopics,
  ]);

  // =======================================================
  // TOPIC ID
  // =======================================================

  const getTopicId = (
    phase,
    topic
  ) => {
    return `${phase.id}::${topic.name}`;
  };

  // =======================================================
  // TOGGLE COMPLETE
  // =======================================================

  const toggleComplete = (
    phase,
    topic
  ) => {
    const topicId =
      getTopicId(
        phase,
        topic
      );

    setCompletedTopics(
      (prev) => {
        if (
          prev.includes(topicId)
        ) {
          return prev.filter(
            (item) =>
              item !== topicId
          );
        }

        return [
          ...prev,
          topicId,
        ];
      }
    );
  };

  // =======================================================
  // RESET
  // =======================================================

  const resetProgress = () => {
    if (
      window.confirm(
        "Reset your roadmap progress?"
      )
    ) {
      setCompletedTopics([]);
    }
  };

  // =======================================================
  // FILTER
  // =======================================================

  const filteredPhases =
    useMemo(() => {
      if (!roadmap) {
        return [];
      }

      const search =
        searchTopic
          .trim()
          .toLowerCase();

      if (!search) {
        return roadmap.phases;
      }

      return roadmap.phases
        .map((phase) => ({
          ...phase,

          topics:
            phase.topics.filter(
              (topic) =>
                topic.name
                  .toLowerCase()
                  .includes(search)
            ),
        }))
        .filter(
          (phase) =>
            phase.topics.length > 0
        );
    }, [
      roadmap,
      searchTopic,
    ]);

  // =======================================================
  // LOADING USER
  // =======================================================

  if (loadingUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          background:
            "#f8fafc",
        }}
      >
        Loading Career Roadmap...
      </div>
    );
  }

  // =======================================================
  // TOPIC DETAIL
  // =======================================================

  if (selectedTopic) {
    const {
      topic,
      phase,
    } = selectedTopic;

    const topicId =
      getTopicId(
        phase,
        topic
      );

    const completed =
      completedTopics.includes(
        topicId
      );

    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "30px",
          background:
            "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth:
              "1000px",
            margin: "auto",
          }}
        >
          <button
            onClick={() =>
              setSelectedTopic(
                null
              )
            }
            style={{
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              marginBottom:
                "20px",
            }}
          >
            ← Back to Roadmap
          </button>

          <div
            style={{
              background:
                "white",
              padding:
                "30px",
              borderRadius:
                "16px",
              boxShadow:
                "0 5px 20px rgba(0,0,0,0.08)",
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
                  "20px",
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    color:
                      "#6b7280",
                    marginBottom:
                      "5px",
                  }}
                >
                  {phase.source}
                  {" → "}
                  {phase.title}
                </p>

                <h1>
                  📚{" "}
                  {topic.name}
                </h1>

                <span
                  style={{
                    display:
                      "inline-block",
                    padding:
                      "6px 12px",
                    borderRadius:
                      "20px",
                    background:
                      topic.difficulty ===
                      "Beginner"
                        ? "#dcfce7"
                        : topic.difficulty ===
                          "Intermediate"
                        ? "#fef3c7"
                        : "#fee2e2",
                  }}
                >
                  {
                    topic.difficulty
                  }
                </span>
              </div>

              <button
                onClick={() =>
                  toggleComplete(
                    phase,
                    topic
                  )
                }
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius:
                    "10px",
                  background:
                    completed
                      ? "#16a34a"
                      : "#2563eb",
                  color:
                    "white",
                  fontWeight:
                    "600",
                  cursor:
                    "pointer",
                }}
              >
                {completed
                  ? "✓ Completed"
                  : "Mark as Completed"}
              </button>
            </div>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                📖 What is{" "}
                {topic.name}?
              </h2>

              <p>
                {topic.definition}
              </p>
            </section>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                🧠 Concepts to
                Learn
              </h2>

              <ul>
                {topic.concepts.map(
                  (
                    concept,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                      style={{
                        marginBottom:
                          "6px",
                      }}
                    >
                      {concept}
                    </li>
                  )
                )}
              </ul>
            </section>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                💻 Example
              </h2>

              <pre
                style={{
                  background:
                    "#111827",
                  color:
                    "#f9fafb",
                  padding:
                    "20px",
                  borderRadius:
                    "10px",
                  overflowX:
                    "auto",
                  lineHeight:
                    "1.6",
                }}
              >
                <code>
                  {topic.example}
                </code>
              </pre>
            </section>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                🚀 Coding
                Question
              </h2>

              <div
                style={{
                  padding:
                    "18px",
                  background:
                    "#eff6ff",
                  borderRadius:
                    "10px",
                  lineHeight:
                    "1.6",
                }}
              >
                {
                  topic.codingQuestion
                }
              </div>
            </section>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                🎤 Interview
                Questions
              </h2>

              <ol>
                {topic.interviewQuestions.map(
                  (
                    question,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                      style={{
                        marginBottom:
                          "10px",
                      }}
                    >
                      {question}
                    </li>
                  )
                )}
              </ol>
            </section>

            <section
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h2>
                📝 Practice
                Questions
              </h2>

              <ol>
                {topic.practiceQuestions.map(
                  (
                    question,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                      style={{
                        marginBottom:
                          "10px",
                      }}
                    >
                      {question}
                    </li>
                  )
                )}
              </ol>
            </section>

            <button
              onClick={() =>
                toggleComplete(
                  phase,
                  topic
                )
              }
              style={{
                marginTop:
                  "30px",
                width:
                  "100%",
                padding:
                  "15px",
                border:
                  "none",
                borderRadius:
                  "10px",
                background:
                  completed
                    ? "#dc2626"
                    : "#16a34a",
                color:
                  "white",
                fontSize:
                  "16px",
                fontWeight:
                  "700",
                cursor:
                  "pointer",
              }}
            >
              {completed
                ? "Remove Completed Status"
                : "✓ Mark Topic as Completed"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          "30px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1100px",
          margin:
            "auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background:
              "white",
            padding:
              "30px",
            borderRadius:
              "16px",
            marginBottom:
              "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h1>
            🎯 Career Roadmap
          </h1>

          <p
            style={{
              color:
                "#4b5563",
              lineHeight:
                "1.6",
            }}
          >
            Build a personalized
            learning roadmap
            based on your
            resume, skills and
            career goal.
          </p>
        </div>

        {/* CREATE ROADMAP */}

        {!roadmap && (
          <div
            style={{
              background:
                "white",
              padding:
                "30px",
              borderRadius:
                "16px",
              boxShadow:
                "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h2>
              🚀 Create Your
              Roadmap
            </h2>

            {/* RESUME STATUS */}

            {resumeLoading ? (
              <div
                style={{
                  padding:
                    "15px",
                  marginBottom:
                    "20px",
                  background:
                    "#eff6ff",
                  borderRadius:
                    "10px",
                  color:
                    "#1d4ed8",
                }}
              >
                ⏳ Loading skills
                from your resume...
              </div>
            ) : resumeFound &&
              currentSkills ? (
              <div
                style={{
                  padding:
                    "15px",
                  marginBottom:
                    "20px",
                  background:
                    "#f0fdf4",
                  border:
                    "1px solid #86efac",
                  borderRadius:
                    "10px",
                  color:
                    "#166534",
                }}
              >
                ✓ Skills loaded from
                your resume
                automatically.
              </div>
            ) : (
              <div
                style={{
                  padding:
                    "15px",
                  marginBottom:
                    "20px",
                  background:
                    "#fff7ed",
                  border:
                    "1px solid #fed7aa",
                  borderRadius:
                    "10px",
                  color:
                    "#9a3412",
                }}
              >
                ⚠ No resume skills
                found. Enter your
                skills manually
                below.
              </div>
            )}

            {/* RESUME ERROR */}

            {resumeError && (
              <div
                style={{
                  padding:
                    "12px",
                  marginBottom:
                    "20px",
                  background:
                    "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  borderRadius:
                    "10px",
                  color:
                    "#b91c1c",
                }}
              >
                <strong>
                  Resume loading
                  error:
                </strong>{" "}
                {resumeError}
              </div>
            )}

            {/* CAREER GOAL */}

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "600",
              }}
            >
              🎯 Career Goal
            </label>

            <input
              value={
                careerGoal
              }
              onChange={(e) =>
                setCareerGoal(
                  e.target.value
                )
              }
              placeholder="Example: Python Developer"
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                marginTop:
                  "8px",
                marginBottom:
                  "20px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                boxSizing:
                  "border-box",
              }}
            />

            {/* EXPERIENCE */}

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "600",
              }}
            >
              📊 Experience Level
            </label>

            <select
              value={
                experience
              }
              onChange={(e) =>
                setExperience(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                marginTop:
                  "8px",
                marginBottom:
                  "20px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                boxSizing:
                  "border-box",
                background:
                  "white",
              }}
            >
              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>

            {/* SKILLS */}

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "600",
              }}
            >
              🛠️ Current Skills
            </label>

            <textarea
              value={
                currentSkills
              }
              onChange={(e) =>
                setCurrentSkills(
                  e.target.value
                )
              }
              placeholder="Example: Python, SQL, Git, React"
              rows={5}
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                marginTop:
                  "8px",
                marginBottom:
                  "10px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                boxSizing:
                  "border-box",
                resize:
                  "vertical",
              }}
            />

            <p
              style={{
                fontSize:
                  "14px",
                color:
                  "#6b7280",
                marginBottom:
                  "20px",
                lineHeight:
                  "1.5",
              }}
            >
              💡 Skills from your
              resume are loaded
              automatically. You
              can add or remove
              skills here to
              customize your
              roadmap.
            </p>

            {/* BUTTON */}

            <button
              onClick={
                generateRoadmap
              }
              disabled={
                resumeLoading
              }
              style={{
                width:
                  "100%",
                padding:
                  "15px",
                border:
                  "none",
                borderRadius:
                  "10px",
                background:
                  resumeLoading
                    ? "#93c5fd"
                    : "#2563eb",
                color:
                  "white",
                fontSize:
                  "16px",
                fontWeight:
                  "700",
                cursor:
                  resumeLoading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              🚀 Generate Career
              Roadmap
            </button>
          </div>
        )}

        {/* ROADMAP */}

        {roadmap && (
          <>
            {/* SUMMARY */}

            <div
              style={{
                background:
                  "white",
                padding:
                  "25px",
                borderRadius:
                  "16px",
                marginBottom:
                  "25px",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.08)",
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
                  flexWrap:
                    "wrap",
                  gap:
                    "15px",
                }}
              >
                <div>
                  <h2>
                    🚀 Your Career
                    Roadmap
                  </h2>

                  <p>
                    <strong>
                      Career Goal:
                    </strong>{" "}
                    {
                      roadmap.careerGoal
                    }
                  </p>

                  <p>
                    <strong>
                      Experience:
                    </strong>{" "}
                    {
                      roadmap.experience
                    }
                  </p>

                  <p>
                    <strong>
                      Learning Tracks:
                    </strong>{" "}
                    {
                      roadmap.selectedSkills.join(
                        ", "
                      )
                    }
                  </p>
                </div>

                <button
                  onClick={() => {
                    setRoadmap(
                      null
                    );
                    setSelectedTopic(
                      null
                    );
                    setSearchTopic(
                      ""
                    );
                  }}
                  style={{
                    padding:
                      "10px 16px",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                    background:
                      "#f3f4f6",
                  }}
                >
                  Change Roadmap
                </button>
              </div>

              {/* PROGRESS */}

              <div
                style={{
                  marginTop:
                    "25px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <strong>
                    📈 Overall Progress
                  </strong>

                  <strong>
                    {progress}%
                  </strong>
                </div>

                <div
                  style={{
                    width:
                      "100%",
                    height:
                      "12px",
                    background:
                      "#e5e7eb",
                    borderRadius:
                      "10px",
                    marginTop:
                      "8px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      width:
                        `${progress}%`,
                      height:
                        "100%",
                      background:
                        "#16a34a",
                      transition:
                        "width 0.3s",
                    }}
                  />
                </div>

                <p
                  style={{
                    color:
                      "#4b5563",
                  }}
                >
                  {
                    completedVisibleCount
                  }{" "}
                  /{" "}
                  {
                    totalTopics
                  }{" "}
                  topics completed
                </p>

                <button
                  onClick={
                    resetProgress
                  }
                  style={{
                    padding:
                      "8px 12px",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                    background:
                      "#f3f4f6",
                  }}
                >
                  Reset Progress
                </button>
              </div>
            </div>

            {/* SEARCH */}

            <div
              style={{
                background:
                  "white",
                padding:
                  "20px",
                borderRadius:
                  "12px",
                marginBottom:
                  "25px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <input
                value={
                  searchTopic
                }
                onChange={(e) =>
                  setSearchTopic(
                    e.target.value
                  )
                }
                placeholder="🔎 Search topic..."
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* PHASES */}

            {filteredPhases.map(
              (phase) => (
                <div
                  key={
                    phase.id
                  }
                  style={{
                    background:
                      "white",
                    padding:
                      "25px",
                    borderRadius:
                      "16px",
                    marginBottom:
                      "25px",
                    boxShadow:
                      "0 5px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <h2>
                    Phase{" "}
                    {
                      phase.number
                    }
                    :{" "}
                    {
                      phase.title
                    }
                  </h2>

                  <p>
                    ⏱️{" "}
                    <strong>
                      Duration:
                    </strong>{" "}
                    {
                      phase.duration
                    }
                  </p>

                  <p>
                    🧩 Track:{" "}
                    <strong>
                      {
                        phase.source
                      }
                    </strong>
                  </p>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap:
                        "15px",
                      marginTop:
                        "20px",
                    }}
                  >
                    {phase.topics.map(
                      (topic) => {
                        const topicId =
                          getTopicId(
                            phase,
                            topic
                          );

                        const completed =
                          completedTopics.includes(
                            topicId
                          );

                        return (
                          <div
                            key={
                              topicId
                            }
                            onClick={() =>
                              setSelectedTopic(
                                {
                                  topic,
                                  phase,
                                }
                              )
                            }
                            style={{
                              padding:
                                "18px",
                              border:
                                completed
                                  ? "2px solid #16a34a"
                                  : "1px solid #e5e7eb",
                              borderRadius:
                                "12px",
                              cursor:
                                "pointer",
                              background:
                                completed
                                  ? "#f0fdf4"
                                  : "#ffffff",
                              transition:
                                "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                gap:
                                  "10px",
                                alignItems:
                                  "flex-start",
                              }}
                            >
                              <strong>
                                {completed
                                  ? "✓ "
                                  : "📚 "}
                                {
                                  topic.name
                                }
                              </strong>

                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "12px",
                                  background:
                                    topic.difficulty ===
                                    "Beginner"
                                      ? "#dcfce7"
                                      : topic.difficulty ===
                                        "Intermediate"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  topic.difficulty
                                }
                              </span>
                            </div>

                            <p
                              style={{
                                fontSize:
                                  "14px",
                                marginTop:
                                  "10px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              Click to study →
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}

            {filteredPhases.length ===
              0 && (
              <div
                style={{
                  background:
                    "white",
                  padding:
                    "30px",
                  borderRadius:
                    "12px",
                  textAlign:
                    "center",
                }}
              >
                No topic found.
              </div>
            )}

            {/* DASHBOARD */}

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard")
              }
              style={{
                padding:
                  "12px 18px",
                border:
                  "none",
                borderRadius:
                  "8px",
                cursor:
                  "pointer",
                marginBottom:
                  "30px",
                background:
                  "#e5e7eb",
              }}
            >
              ← Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CareerRoadmap;