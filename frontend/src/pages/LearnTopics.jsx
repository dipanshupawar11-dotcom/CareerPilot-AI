import { useState } from "react";

function LearnTopic() {
  const params = new URLSearchParams(window.location.search);

  const topic = params.get("topic") || "Variables";
  const phase = params.get("phase") || "Python Fundamentals";

  const [completed, setCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const topicData = {
    variables: {
      title: "Variables",
      description:
        "Variables are used to store data values in Python. A variable is created when you assign a value to it.",
      example: `name = "Deepanshu"
age = 22
course = "Python"

print(name)
print(age)
print(course)`,
      points: [
        "Python variables do not require a special keyword.",
        "A variable can store different types of data.",
        "Python is dynamically typed.",
        "Variable names should be meaningful.",
      ],
      practice:
        "Create a variable called age and store your age in it. Then print it.",
      answer: `age = 22
print(age)`,
    },

    "data types": {
      title: "Data Types",
      description:
        "Data types define the kind of value stored in a variable. Python provides several built-in data types.",
      example: `name = "Deepanshu"
age = 22
height = 5.8
is_student = True

print(type(name))
print(type(age))
print(type(height))
print(type(is_student))`,
      points: [
        "str is used for text.",
        "int is used for whole numbers.",
        "float is used for decimal numbers.",
        "bool represents True or False.",
      ],
      practice:
        "Create one string, one integer and one boolean variable and print their types.",
      answer: `name = "Deepanshu"
age = 22
is_student = True

print(type(name))
print(type(age))
print(type(is_student))`,
    },

    strings: {
      title: "Strings",
      description:
        "A string is a sequence of characters used to store text in Python.",
      example: `name = "Deepanshu"

print(name)
print(name[0])
print(name.upper())
print(name.lower())`,
      points: [
        "Strings are written inside quotes.",
        "Strings support indexing.",
        "Strings support slicing.",
        "Python provides many built-in string methods.",
      ],
      practice:
        "Create a variable containing your name and print it in uppercase.",
      answer: `name = "Deepanshu"
print(name.upper())`,
    },

    lists: {
      title: "Lists",
      description:
        "A list is an ordered and mutable collection that can store multiple values.",
      example: `skills = ["Python", "SQL", "React"]

print(skills)
print(skills[0])

skills.append("Git")

print(skills)`,
      points: [
        "Lists are ordered.",
        "Lists are mutable.",
        "Lists can contain multiple values.",
        "Lists use square brackets [].",
      ],
      practice:
        "Create a list containing three programming languages and print the first language.",
      answer: `languages = ["Python", "Java", "JavaScript"]

print(languages[0])`,
    },

    tuples: {
      title: "Tuples",
      description:
        "A tuple is an ordered collection that cannot be changed after creation.",
      example: `coordinates = (10, 20)

print(coordinates)
print(coordinates[0])`,
      points: [
        "Tuples are ordered.",
        "Tuples are immutable.",
        "Tuples use parentheses ().",
        "Tuples can contain multiple values.",
      ],
      practice:
        "Create a tuple containing three numbers and print the second number.",
      answer: `numbers = (10, 20, 30)

print(numbers[1])`,
    },

    sets: {
      title: "Sets",
      description:
        "A set is an unordered collection of unique values.",
      example: `numbers = {1, 2, 3, 3, 4}

print(numbers)`,
      points: [
        "Sets contain unique values.",
        "Sets are unordered.",
        "Sets use curly brackets {}.",
        "Duplicate values are automatically removed.",
      ],
      practice:
        "Create a set containing duplicate numbers and print the set.",
      answer: `numbers = {1, 2, 2, 3, 4}

print(numbers)`,
    },

    dictionaries: {
      title: "Dictionaries",
      description:
        "A dictionary stores data in key-value pairs.",
      example: `student = {
    "name": "Deepanshu",
    "age": 22,
    "course": "Python"
}

print(student["name"])
print(student["course"])`,
      points: [
        "Dictionaries store key-value pairs.",
        "Keys are used to access values.",
        "Dictionaries use curly brackets {}.",
        "Dictionaries are mutable.",
      ],
      practice:
        "Create a dictionary containing your name and age and print your name.",
      answer: `student = {
    "name": "Deepanshu",
    "age": 22
}

print(student["name"])`,
    },

    operators: {
      title: "Operators",
      description:
        "Operators are symbols used to perform operations on values and variables.",
      example: `a = 10
b = 5

print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a % b)`,
      points: [
        "Arithmetic operators perform mathematical operations.",
        "Comparison operators compare values.",
        "Logical operators combine conditions.",
        "Assignment operators assign values.",
      ],
      practice:
        "Create two numbers and print their sum, difference and multiplication.",
      answer: `a = 10
b = 5

print(a + b)
print(a - b)
print(a * b)`,
    },
  };

  const key = topic.toLowerCase();

  const data =
    topicData[key] || topicData.variables;

  const handleComplete = () => {
    setCompleted(true);

    localStorage.setItem(
      `completed_${data.title.toLowerCase()}`,
      "true"
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* BACK */}

        <button
          onClick={() => {
            window.location.href = "/career-roadmap";
          }}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Roadmap
        </button>

        {/* HEADER */}

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "20px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              color: "#64748b",
              marginBottom: "8px",
            }}
          >
            🎯 {phase}
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
            }}
          >
            📚 {data.title}
          </h1>

          <p
            style={{
              marginTop: "15px",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "#475569",
            }}
          >
            {data.description}
          </p>
        </div>

        {/* WHAT YOU WILL LEARN */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        >
          <h2>🧠 What You Should Know</h2>

          <ul
            style={{
              lineHeight: "2",
              fontSize: "16px",
            }}
          >
            {data.points.map(
              (point, index) => (
                <li key={index}>
                  {point}
                </li>
              )
            )}
          </ul>
        </div>

        {/* CODE EXAMPLE */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        >
          <h2>💻 Example</h2>

          <pre
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              padding: "20px",
              borderRadius: "10px",
              overflowX: "auto",
              lineHeight: "1.6",
              fontSize: "15px",
            }}
          >
            {data.example}
          </pre>
        </div>

        {/* PRACTICE */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        >
          <h2>🧪 Practice</h2>

          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
            }}
          >
            {data.practice}
          </p>

          <button
            onClick={() =>
              setShowAnswer(!showAnswer)
            }
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#64748b",
              color: "white",
              cursor: "pointer",
            }}
          >
            {showAnswer
              ? "Hide Answer"
              : "Show Answer"}
          </button>

          {showAnswer && (
            <pre
              style={{
                marginTop: "15px",
                background: "#0f172a",
                color: "#e2e8f0",
                padding: "20px",
                borderRadius: "10px",
                overflowX: "auto",
              }}
            >
              {data.answer}
            </pre>
          )}
        </div>

        {/* COMPLETE */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          {completed ? (
            <>
              <h2>✅ Topic Completed!</h2>

              <p>
                Great job! You completed{" "}
                <strong>
                  {data.title}
                </strong>
                .
              </p>

              <button
                onClick={() => {
                  window.location.href =
                    "/career-roadmap";
                }}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#16a34a",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Continue Learning →
              </button>
            </>
          ) : (
            <>
              <h2>
                🎯 Ready to Complete?
              </h2>

              <button
                onClick={handleComplete}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Mark Topic Complete ✓
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LearnTopic;