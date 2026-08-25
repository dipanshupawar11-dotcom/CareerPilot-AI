import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================================================
  // LOAD AUTHENTICATED USER
  // =========================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getUser();

        if (error || !data?.user) {
          window.location.href = "/";
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "Dashboard user error:",
          error
        );

        window.location.href = "/";
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // =========================================================
  // USER DATA
  // =========================================================

  const userEmail =
    user?.email || "User";

  const userInitial =
    userEmail
      .charAt(0)
      .toUpperCase() || "U";

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = (path) => {
    window.location.href = path;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
    }
  };

  // =========================================================
  // FEATURES
  // =========================================================

  const features = [
    {
      icon: "📄",
      title: "Resume Builder",
      description:
        "Create a professional, ATS-friendly resume and keep your career profile updated.",
      button: "Build Resume",
      path: "/resume-builder",
      tag: "Career Profile",
    },

    {
      icon: "🎯",
      title: "Career Roadmap",
      description:
        "Get a personalized learning path based on your skills, resume and career goal.",
      button: "Build Roadmap",
      path: "/career-roadmap",
      tag: "Personalized",
    },

    {
      icon: "🤖",
      title: "AI Career Assistant",
      description:
        "Talk with your AI career mentor for career guidance, resume help and interview preparation.",
      button: "Chat with AI",
      path: "/career-assistant",
      tag: "AI Powered",
      featured: true,
    },

    {
      icon: "💼",
      title: "Job Preparation",
      description:
        "Practice Technical, HR, DSA, SQL and Group Discussion interviews with AI.",
      button: "Start Preparation",
      path: "/job-preparation",
      tag: "Interview Ready",
    },

    {
      icon: "🔎",
      title: "Job Recommendations",
      description:
        "Discover real job opportunities matched with your resume, skills and career profile.",
      button: "Find Matching Jobs",
      path: "/job-recommendations",
      tag: "Live Jobs",
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingUser) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-icon">
          🚀
        </div>

        <h2>CareerPilot AI</h2>

        <p>
          Loading your career dashboard...
        </p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <style>{`
          .dashboard-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(
                circle at 20% 10%,
                rgba(99,102,241,0.16),
                transparent 30%
              ),
              radial-gradient(
                circle at 80% 20%,
                rgba(14,165,233,0.12),
                transparent 30%
              ),
              #f8fafc;
            color: #0f172a;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .dashboard-loading-icon {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            font-size: 34px;
            background:
              linear-gradient(
                135deg,
                #4f46e5,
                #7c3aed
              );
            box-shadow:
              0 15px 35px rgba(79,70,229,0.25);
          }

          .dashboard-loading h2 {
            margin: 20px 0 5px;
            font-size: 22px;
          }

          .dashboard-loading p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .loading-dots {
            display: flex;
            gap: 6px;
            margin-top: 20px;
          }

          .loading-dots span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #6366f1;
            animation: dashboardDot 1.2s infinite ease-in-out;
          }

          .loading-dots span:nth-child(2) {
            animation-delay: 0.15s;
          }

          .loading-dots span:nth-child(3) {
            animation-delay: 0.3s;
          }

          @keyframes dashboardDot {
            0%,
            80%,
            100% {
              transform: scale(0.65);
              opacity: 0.45;
            }

            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="dashboard-page">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(99,102,241,0.14),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(14,165,233,0.12),
              transparent 30%
            ),
            #f8fafc;
          color: #0f172a;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 28px 24px 50px;
        }

        /* ===================================================
           TOPBAR
        =================================================== */

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 20px;
          margin-bottom: 30px;
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(226,232,240,0.9);
          border-radius: 18px;
          box-shadow:
            0 10px 35px rgba(15,23,42,0.06);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: white;
          font-size: 22px;
          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );
          box-shadow:
            0 8px 20px rgba(79,70,229,0.25);
        }

        .brand-title {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .brand-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #e0e7ff
            );
          color: #4338ca;
          font-weight: 800;
          border: 1px solid #c7d2fe;
        }

        .user-email {
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          color: #475569;
        }

        /* ===================================================
           HERO
        =================================================== */

        .hero {
          position: relative;
          overflow: hidden;
          padding: 42px;
          border-radius: 28px;
          margin-bottom: 25px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #111827 0%,
              #1e1b4b 48%,
              #312e81 100%
            );
          box-shadow:
            0 25px 60px rgba(30,27,75,0.22);
        }

        .hero::before {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          right: -100px;
          top: -140px;
          background: rgba(129,140,248,0.18);
          filter: blur(4px);
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          right: 180px;
          bottom: -130px;
          background: rgba(56,189,248,0.12);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 780px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          margin-bottom: 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 12px;
          font-weight: 700;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 0 4px rgba(34,197,94,0.12);
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.1;
          letter-spacing: -1.5px;
        }

        .hero h1 span {
          color: #a5b4fc;
        }

        .hero p {
          margin: 16px 0 0;
          max-width: 700px;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 25px;
        }

        .primary-btn {
          border: none;
          padding: 12px 18px;
          border-radius: 11px;
          background: white;
          color: #312e81;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 25px rgba(0,0,0,0.18);
        }

        .secondary-btn {
          padding: 12px 18px;
          border-radius: 11px;
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .secondary-btn:hover {
          background: rgba(255,255,255,0.14);
        }

        /* ===================================================
           STATS
        =================================================== */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 35px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 19px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          box-shadow:
            0 8px 25px rgba(15,23,42,0.04);
          transition: 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 30px rgba(15,23,42,0.07);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          font-size: 21px;
          background: #f1f5f9;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 15px;
          font-weight: 800;
        }

        .online {
          color: #16a34a;
        }

        /* ===================================================
           SECTION HEADER
        =================================================== */

        .section-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.5px;
        }

        .section-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        /* ===================================================
           FEATURES
        =================================================== */

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .feature-card {
          position: relative;
          overflow: hidden;
          padding: 26px;
          min-height: 235px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 21px;
          box-shadow:
            0 8px 30px rgba(15,23,42,0.05);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow:
            0 18px 45px rgba(15,23,42,0.10);
          border-color: #c7d2fe;
        }

        .feature-card.featured {
          grid-column: span 2;
          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #ffffff 55%,
              #ecfeff
            );
          border-color: #c7d2fe;
        }

        .feature-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .feature-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          font-size: 27px;
          background: #f1f5f9;
        }

        .feature-tag {
          padding: 6px 10px;
          border-radius: 999px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #e2e8f0;
        }

        .feature-card h3 {
          margin: 20px 0 8px;
          font-size: 20px;
          letter-spacing: -0.3px;
        }

        .feature-card p {
          margin: 0;
          max-width: 650px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.65;
        }

        .feature-button {
          margin-top: 20px;
          padding: 10px 15px;
          border: none;
          border-radius: 10px;
          background: #0f172a;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .feature-button:hover {
          background: #312e81;
          transform: translateX(2px);
        }

        /* ===================================================
           QUICK ACTIONS
        =================================================== */

        .quick-section {
          margin-top: 35px;
          padding: 25px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 21px;
          box-shadow:
            0 8px 30px rgba(15,23,42,0.04);
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .quick-button {
          padding: 15px;
          text-align: left;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 13px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .quick-button:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          transform: translateY(-2px);
        }

        .quick-button strong {
          display: block;
          margin-top: 7px;
          font-size: 13px;
        }

        .quick-button span {
          font-size: 20px;
        }

        /* ===================================================
           FOOTER
        =================================================== */

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 35px;
          padding-top: 22px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
        }

        .footer span {
          color: #94a3b8;
        }

        .logout-btn {
          padding: 9px 15px;
          border-radius: 9px;
          border: 1px solid #fecaca;
          background: #fff;
          color: #dc2626;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .logout-btn:hover:not(:disabled) {
          background: #fef2f2;
          transform: translateY(-1px);
        }

        .logout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (max-width: 850px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card.featured {
            grid-column: span 1;
          }

          .quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero {
            padding: 30px 24px;
          }
        }

        @media (max-width: 600px) {
          .dashboard-container {
            padding: 15px;
          }

          .topbar {
            padding: 12px 14px;
          }

          .brand-subtitle,
          .user-email {
            display: none;
          }

          .hero {
            border-radius: 21px;
          }

          .hero h1 {
            font-size: 31px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }

          .footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="dashboard-container">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="topbar">

          <div className="brand">

            <div className="brand-logo">
              🚀
            </div>

            <div>
              <div className="brand-title">
                CareerPilot AI
              </div>

              <div className="brand-subtitle">
                Your AI-powered career companion
              </div>
            </div>

          </div>

          <div className="user-area">

            <div className="user-avatar">
              {userInitial}
            </div>

            <div className="user-email">
              {userEmail}
            </div>

          </div>

        </header>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="status-dot" />
              AI Career Platform • Online
            </div>

            <h1>
              Build your career.
              <br />
              <span>
                Land your dream job.
              </span>
            </h1>

            <p>
              Welcome back! CareerPilot AI brings
              your resume, career roadmap, AI mentor,
              job opportunities and interview preparation
              together in one intelligent platform.
            </p>

            <div className="hero-actions">

              <button
                className="primary-btn"
                onClick={() =>
                  goTo("/job-preparation")
                }
              >
                🚀 Start Interview Prep
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  goTo("/career-roadmap")
                }
              >
                🎯 View Career Roadmap
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              🟢
            </div>

            <div>
              <div className="stat-label">
                Backend Status
              </div>

              <div className="stat-value online">
                Connected
              </div>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              🤖
            </div>

            <div>
              <div className="stat-label">
                AI Engine
              </div>

              <div className="stat-value">
                Gemini AI
              </div>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              🔐
            </div>

            <div>
              <div className="stat-label">
                Account
              </div>

              <div className="stat-value">
                Authenticated
              </div>
            </div>

          </div>

        </section>

        {/* ===================================================
            FEATURES
        =================================================== */}

        <div className="section-header">

          <div>
            <h2>
              Your Career Toolkit
            </h2>

            <p>
              Everything you need to prepare,
              improve and grow your career.
            </p>
          </div>

        </div>

        <section className="features-grid">

          {features.map((feature) => (

            <article
              key={feature.title}
              className={`feature-card ${
                feature.featured
                  ? "featured"
                  : ""
              }`}
            >

              <div className="feature-top">

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <span className="feature-tag">
                  {feature.tag}
                </span>

              </div>

              <h3>
                {feature.title}
              </h3>

              <p>
                {feature.description}
              </p>

              <button
                className="feature-button"
                onClick={() =>
                  goTo(feature.path)
                }
              >
                {feature.button} →
              </button>

            </article>

          ))}

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="quick-section">

          <div className="section-header">

            <div>

              <h2>
                ⚡ Quick Actions
              </h2>

              <p>
                Jump directly into your next career task.
              </p>

            </div>

          </div>

          <div className="quick-grid">

            <button
              className="quick-button"
              onClick={() =>
                goTo("/resume-builder")
              }
            >
              <span>📄</span>

              <strong>
                Update Resume
              </strong>
            </button>

            <button
              className="quick-button"
              onClick={() =>
                goTo("/career-roadmap")
              }
            >
              <span>🎯</span>

              <strong>
                Build Roadmap
              </strong>
            </button>

            <button
              className="quick-button"
              onClick={() =>
                goTo("/job-preparation")
              }
            >
              <span>🧠</span>

              <strong>
                Practice Interview
              </strong>
            </button>

            <button
              className="quick-button"
              onClick={() =>
                goTo("/job-recommendations")
              }
            >
              <span>💼</span>

              <strong>
                Find Jobs
              </strong>
            </button>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="footer">

          <div>
            © 2026 CareerPilot AI
            <br />

            <span>
              Your intelligent career companion.
            </span>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>

        </footer>

      </div>

    </div>
  );
}

export default Dashboard;