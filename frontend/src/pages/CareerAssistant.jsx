import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AI_URL = "http://127.0.0.1:8000";
const CHAT_URL = `${AI_URL}/api/career-assistant`;

const STORAGE_KEY = "careerpilot_ai_chat";

function CareerAssistant() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // =====================================================
  // DEFAULT MESSAGE
  // =====================================================

  const getDefaultMessage = () => ({
    role: "assistant",
    content:
      "Hi! I'm CareerPilot AI 👋\n\n" +
      "I'm your personal AI career mentor. I can help you with career planning, resume improvement, interview preparation, skills, projects, roadmaps and job preparation.\n\n" +
      "What would you like to work on today?",
  });

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (authError || !data?.user) {
          window.location.href = "/";
          return;
        }

        setUser(data.user);

        const savedChat =
          localStorage.getItem(STORAGE_KEY);

        if (savedChat) {
          try {
            const parsed = JSON.parse(savedChat);

            if (
              Array.isArray(parsed) &&
              parsed.length > 0
            ) {
              setMessages(parsed);
            } else {
              setMessages([getDefaultMessage()]);
            }
          } catch {
            setMessages([getDefaultMessage()]);
          }
        } else {
          setMessages([getDefaultMessage()]);
        }
      } catch (err) {
        console.error(
          "Career Assistant user error:",
          err
        );

        setError(
          "Unable to load Career Assistant."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =====================================================
  // SAVE CHAT
  // =====================================================

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
      );
    }
  }, [messages]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // =====================================================
  // TEXTAREA AUTO RESIZE
  // =====================================================

  const handleInputChange = (event) => {
    setInput(event.target.value);

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(textarea.scrollHeight, 180) + "px";
    }
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || sending) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setSending(true);

    try {
      const conversation = messages
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

      console.log(
        "Sending Career Assistant request..."
      );

      const response = await fetch(CHAT_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          user_id: user?.id || null,
          message,
          conversation,
        }),
      });

      const rawText = await response.text();

      console.log(
        "Career Assistant response:",
        rawText
      );

      let result;

      try {
        result = JSON.parse(rawText);
      } catch {
        throw new Error(
          "AI service returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            `Request failed: ${response.status}`
        );
      }

      // =================================================
      // IMPORTANT:
      // FASTAPI RETURNS:
      //
      // result.assistant.answer
      // =================================================

      const aiAnswer =
        result?.assistant?.answer ||
        result?.reply ||
        result?.answer ||
        "";

      if (!aiAnswer) {
        throw new Error(
          "AI service returned no answer."
        );
      }

      const assistantMessage = {
        role: "assistant",
        content: aiAnswer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(
        "Career Assistant Error:",
        err
      );

      const errorText =
        err?.message ||
        "Unable to connect to AI Assistant.";

      setError(errorText);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your request right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // =====================================================
  // QUICK PROMPT
  // =====================================================

  const usePrompt = (prompt) => {
    setInput(prompt);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const newChat = () => {
    setMessages([getDefaultMessage()]);
    setInput("");
    setError("");

    localStorage.removeItem(STORAGE_KEY);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearChat = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear this conversation?"
    );

    if (!confirmClear) {
      return;
    }

    newChat();
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  const goDashboard = () => {
    window.location.href = "/dashboard";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ai-loading-screen">
        <div className="ai-loading-logo">
          <div className="ai-logo-icon">
            ✦
          </div>
        </div>

        <h2>CareerPilot AI</h2>

        <p>
          Preparing your AI career mentor...
        </p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="ai-assistant-app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="ai-sidebar">

        <div className="sidebar-top">

          <div className="brand">

            <div className="brand-icon">
              ✦
            </div>

            <div>
              <h2>CareerPilot</h2>
              <span>AI Career Mentor</span>
            </div>

          </div>

          <button
            className="new-chat-btn"
            onClick={newChat}
          >
            <span>＋</span>
            New Chat
          </button>

          <div className="sidebar-section">

            <span className="sidebar-label">
              TOOLS
            </span>

            <button
              className="sidebar-tool active"
              onClick={() => {}}
            >
              <span>🤖</span>
              Career Assistant
            </button>

            <button
              className="sidebar-tool"
              onClick={() =>
                (window.location.href =
                  "/career-roadmap")
              }
            >
              <span>🎯</span>
              Career Roadmap
            </button>

            <button
              className="sidebar-tool"
              onClick={() =>
                (window.location.href =
                  "/resume-builder")
              }
            >
              <span>📄</span>
              Resume Builder
            </button>

            <button
              className="sidebar-tool"
              onClick={() =>
                (window.location.href =
                  "/job-recommendations")
              }
            >
              <span>💼</span>
              Job Recommendations
            </button>

          </div>

        </div>

        <div className="sidebar-bottom">

          <div className="user-profile">

            <div className="user-avatar">
              {user?.email
                ? user.email
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="user-info">
              <strong>
                {user?.email
                  ? user.email.split("@")[0]
                  : "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
            </div>

          </div>

          <button
            className="dashboard-btn"
            onClick={goDashboard}
          >
            ← Back to Dashboard
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ai-main">

        {/* TOP BAR */}

        <header className="ai-topbar">

          <div className="topbar-title">

            <div className="mobile-brand-icon">
              ✦
            </div>

            <div>
              <h1>CareerPilot AI</h1>

              <div className="online-status">
                <span className="online-dot"></span>
                AI Career Assistant
              </div>
            </div>

          </div>

          <div className="topbar-actions">

            <button
              className="topbar-btn"
              onClick={clearChat}
              title="Clear conversation"
            >
              🗑
              <span>Clear</span>
            </button>

            <button
              className="topbar-btn dashboard-top-btn"
              onClick={goDashboard}
            >
              ←
              <span>Dashboard</span>
            </button>

          </div>

        </header>

        {/* CHAT AREA */}

        <div className="ai-chat-area">

          <div className="chat-content-wrapper">

            {/* WELCOME */}

            {messages.length === 1 &&
              messages[0]?.role ===
                "assistant" && (

              <div className="ai-welcome">

                <div className="welcome-icon">
                  <div className="welcome-icon-inner">
                    ✦
                  </div>
                </div>

                <h2>
                  How can I help you
                  <span> today?</span>
                </h2>

                <p>
                  Your AI-powered career mentor
                  for skills, jobs, resumes and
                  interview preparation.
                </p>

                <div className="welcome-line">
                  <span></span>
                  <small>
                    Ask anything about your career
                  </small>
                  <span></span>
                </div>

              </div>
            )}

            {/* MESSAGES */}

            <div className="messages-list">

              {messages.map(
                (message, index) => {

                  const isUser =
                    message.role === "user";

                  // Hide default message because
                  // welcome screen already shows it
                  if (
                    messages.length === 1 &&
                    !isUser
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                      className={
                        isUser
                          ? "message-row user-row"
                          : "message-row ai-row"
                      }
                    >

                      <div
                        className={
                          isUser
                            ? "message-avatar user-avatar-message"
                            : "message-avatar ai-avatar-message"
                        }
                      >
                        {isUser
                          ? user?.email
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"
                          : "✦"}
                      </div>

                      <div className="message-body">

                        <div className="message-name">
                          {isUser
                            ? "You"
                            : "CareerPilot AI"}
                        </div>

                        <div
                          className={
                            isUser
                              ? "message-text user-text"
                              : "message-text ai-text"
                          }
                        >
                          {message.content}
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

              {/* THINKING */}

              {sending && (
                <div className="message-row ai-row">

                  <div className="message-avatar ai-avatar-message">
                    ✦
                  </div>

                  <div className="message-body">

                    <div className="message-name">
                      CareerPilot AI
                    </div>

                    <div className="thinking-box">

                      <span className="thinking-text">
                        Thinking
                      </span>

                      <span className="thinking-dot">
                        .
                      </span>

                      <span className="thinking-dot">
                        .
                      </span>

                      <span className="thinking-dot">
                        .
                      </span>

                    </div>

                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="ai-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* =================================================
            PROMPTS + INPUT
        ================================================= */}

        <div className="ai-composer-area">

          {/* QUICK PROMPTS */}

          {messages.length <= 1 &&
            !input && (
              <div className="prompt-grid">

                <button
                  onClick={() =>
                    usePrompt(
                      "Mujhe Python Developer banne ke liye 3 month ka complete roadmap do."
                    )
                  }
                >
                  <span>🐍</span>
                  <div>
                    <strong>
                      Python Roadmap
                    </strong>
                    <small>
                      Beginner to job-ready
                    </small>
                  </div>
                </button>

                <button
                  onClick={() =>
                    usePrompt(
                      "Frontend Developer job ke liye mujhe kaun kaun se skills seekhne chahiye?"
                    )
                  }
                >
                  <span>💻</span>
                  <div>
                    <strong>
                      Frontend Skills
                    </strong>
                    <small>
                      Skills employers want
                    </small>
                  </div>
                </button>

                <button
                  onClick={() =>
                    usePrompt(
                      "Mera resume ATS ke liye kaise improve kar sakta hu?"
                    )
                  }
                >
                  <span>📄</span>
                  <div>
                    <strong>
                      Resume Review
                    </strong>
                    <small>
                      Improve ATS score
                    </small>
                  </div>
                </button>

                <button
                  onClick={() =>
                    usePrompt(
                      "Mujhe Python interview ke liye complete preparation plan do."
                    )
                  }
                >
                  <span>🎯</span>
                  <div>
                    <strong>
                      Interview Prep
                    </strong>
                    <small>
                      Crack your interview
                    </small>
                  </div>
                </button>

              </div>
            )}

          {/* INPUT */}

          <div className="composer">

            <div className="composer-inner">

              <button
                className="composer-icon"
                type="button"
                title="Attach"
                onClick={() =>
                  alert(
                    "File upload feature coming soon."
                  )
                }
              >
                ＋
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message CareerPilot AI..."
                rows={1}
                disabled={sending}
              />

              <div className="composer-actions">

                <button
                  className="composer-icon mic-button"
                  type="button"
                  title="Voice input"
                  onClick={() =>
                    alert(
                      "Voice input feature coming soon."
                    )
                  }
                >
                  🎙
                </button>

                <button
                  className="send-ai-btn"
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !input.trim()
                  }
                  title="Send message"
                >
                  {sending ? (
                    <span className="send-spinner"></span>
                  ) : (
                    "↑"
                  )}
                </button>

              </div>

            </div>

          </div>

          <p className="composer-disclaimer">
            CareerPilot AI may make mistakes.
            Verify important career information.
          </p>

        </div>

      </main>

    </div>
  );
}

export default CareerAssistant;