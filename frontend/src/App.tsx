import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContentResponse {
  id: number | null;
  title: string | null;
  topic: string;
  contentType: string;
  tone: string;
  content: string;
  wordCount: number;
  targetAudience: string;
  additionalInstructions: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface HistoryItem extends ContentResponse {
  historyId: string;
  savedAt: string;
}

type View = "writer" | "history" | "dashboard";

const API_URL = "http://localhost:8080/api/content";

function App() {
  /* =========================
     AUTHENTICATION
  ========================= */

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("ai_writer_logged_in") === "true";
  });

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  /* =========================
     WRITER STATE
  ========================= */

  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("BLOG");
  const [tone, setTone] = useState("FRIENDLY");
  const [length, setLength] = useState("SHORT");
  const [targetAudience, setTargetAudience] = useState("Beginners");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const [result, setResult] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /* =========================
     APP NAVIGATION
  ========================= */

  const [view, setView] = useState<View>("writer");

  /* =========================
     HISTORY
  ========================= */

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("ai_writer_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "ai_writer_history",
      JSON.stringify(history)
    );
  }, [history]);

  /* =========================
     AUTH
  ========================= */

  const handleAuth = () => {
    setAuthError("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please enter email and password.");
      return;
    }

    if (authMode === "register" && !authName.trim()) {
      setAuthError("Please enter your name.");
      return;
    }

    /*
      Demo authentication.

      Later we will replace this with:
      POST /api/auth/login
      POST /api/auth/register
    */

    localStorage.setItem("ai_writer_logged_in", "true");
    localStorage.setItem("ai_writer_user", authEmail);

    setIsAuthenticated(true);
    setShowAuth(false);
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const logout = () => {
    localStorage.removeItem("ai_writer_logged_in");
    localStorage.removeItem("ai_writer_user");

    setIsAuthenticated(false);
    setView("writer");
  };

  /* =========================
     MARKDOWN CLEANING
  ========================= */

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/^\s*\d+\.\s+/gm, "• ")
      .trim();
  };

  /* =========================
     MARKDOWN RENDERER
  ========================= */

  const renderMarkdown = (content: string): ReactNode[] => {
    const lines = content
      .replace(/\r\n/g, "\n")
      .split("\n");

    const elements: ReactNode[] = [];

    let paragraph: string[] = [];
    let listItems: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length > 0) {
        const text = paragraph.join(" ").trim();

        if (text) {
          elements.push(
            <p className="article-paragraph" key={`p-${elements.length}`}>
              {renderInline(text)}
            </p>
          );
        }

        paragraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul className="article-list" key={`list-${elements.length}`}>
            {listItems.map((item, index) => (
              <li key={index}>{renderInline(item)}</li>
            ))}
          </ul>
        );

        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        flushParagraph();
        flushList();

        const level = headingMatch[1].length;
        const headingText = headingMatch[2];

        if (level <= 2) {
          elements.push(
            <h3
              className="article-heading"
              key={`h-${index}`}
            >
              {renderInline(headingText)}
            </h3>
          );
        } else {
          elements.push(
            <h4
              className="article-subheading"
              key={`h-${index}`}
            >
              {renderInline(headingText)}
            </h4>
          );
        }

        return;
      }

      const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);

      if (bulletMatch) {
        flushParagraph();
        listItems.push(bulletMatch[1]);
        return;
      }

      const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

      if (numberedMatch) {
        flushParagraph();
        listItems.push(numberedMatch[1]);
        return;
      }

      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    return elements;
  };

  const renderInline = (text: string): ReactNode => {
    const parts = text.split(
      /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/
    );

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        part.startsWith("__") &&
        part.endsWith("__")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        part.startsWith("`") &&
        part.endsWith("`")
      ) {
        return (
          <code key={index}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  /* =========================
     GENERATE CONTENT
  ========================= */

  const generateContent = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          contentType,
          tone,
          length,
          targetAudience,
          additionalInstructions,
        }),
      });

      if (!response.ok) {
        let message = `Server error: ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // Ignore invalid error response.
        }

        throw new Error(message);
      }

      const data: ContentResponse = await response.json();

      setResult(data);

      /* Save to history */

      const historyItem: HistoryItem = {
        ...data,
        historyId:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        savedAt: new Date().toISOString(),
      };

      setHistory((previous) => [
        historyItem,
        ...previous,
      ]);

    } catch (err) {
      console.error(err);

      if (err instanceof TypeError) {
        setError(
          "Could not connect to the backend. Make sure Spring Boot is running on port 8080."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong while generating content."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REGENERATE
  ========================= */

  const regenerateContent = async () => {
    if (!result) {
      await generateContent();
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      let response: Response;

      if (result.id !== null) {
        response = await fetch(
          `${API_URL}/${result.id}/regenerate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic,
              contentType,
              tone,
              length,
              targetAudience,
              additionalInstructions,
            }),
          }
        );
      } else {
        /*
          Backend response currently returns id:null.

          Therefore use the normal generation endpoint
          as a safe fallback.
        */

        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            contentType,
            tone,
            length,
            targetAudience,
            additionalInstructions,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Regeneration failed: ${response.status}`
        );
      }

      const data: ContentResponse =
        await response.json();

      setResult(data);

      const historyItem: HistoryItem = {
        ...data,
        historyId:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        savedAt: new Date().toISOString(),
      };

      setHistory((previous) => [
        historyItem,
        ...previous,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not regenerate content."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     COPY
  ========================= */

  const copyContent = async () => {
    if (!result) return;

    const text = `${result.title || topic}\n\n${cleanMarkdown(
      result.content
    )}`;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Could not copy the content. Please copy it manually."
      );
    }
  };

  /* =========================
     DOWNLOAD
  ========================= */

  const downloadContent = () => {
    if (!result) return;

    const text = `${result.title || topic}\n\n${cleanMarkdown(
      result.content
    )}`;

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${topic
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================
     HISTORY
  ========================= */

  const openHistoryItem = (item: HistoryItem) => {
    setResult(item);

    setTopic(item.topic);
    setContentType(item.contentType);
    setTone(item.tone);
    setTargetAudience(item.targetAudience);
    setAdditionalInstructions(
      item.additionalInstructions || ""
    );

    setView("writer");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteHistoryItem = (historyId: string) => {
    setHistory((previous) =>
      previous.filter(
        (item) => item.historyId !== historyId
      )
    );
  };

  const clearHistory = () => {
    if (history.length === 0) return;

    const confirmed = window.confirm(
      "Delete all content history?"
    );

    if (confirmed) {
      setHistory([]);
    }
  };

  /* =========================
     DASHBOARD DATA
  ========================= */

  const dashboardStats = useMemo(() => {
    const totalWords = history.reduce(
      (sum, item) => sum + (item.wordCount || 0),
      0
    );

    const blogs = history.filter(
      (item) => item.contentType === "BLOG"
    ).length;

    const articles = history.filter(
      (item) => item.contentType === "ARTICLE"
    ).length;

    const social = history.filter(
      (item) => item.contentType === "SOCIAL_MEDIA"
    ).length;

    const emails = history.filter(
      (item) => item.contentType === "EMAIL"
    ).length;

    return {
      total: history.length,
      totalWords,
      blogs,
      articles,
      social,
      emails,
    };
  }, [history]);

  /* =========================
     LOADING ANIMATION
  ========================= */

  const LoadingScreen = () => (
    <section className="generation-card">
      <div className="ai-orb">
        <div className="orb-core">✦</div>
      </div>

      <h3>AI is writing your content</h3>

      <p>
        Analyzing your topic, creating an outline and
        generating the content...
      </p>

      <div className="loading-bar">
        <div className="loading-progress" />
      </div>

      <div className="loading-steps">
        <span>✓ Understanding topic</span>
        <span>✦ Writing content</span>
        <span>○ Polishing result</span>
      </div>
    </section>
  );

  /* =========================
     HISTORY VIEW
  ========================= */

  const HistoryView = () => (
    <section className="page-section">
      <div className="section-heading-row">
        <div>
          <div className="eyebrow">YOUR LIBRARY</div>

          <h2>Content History</h2>

          <p>
            View and reuse content you generated earlier.
          </p>
        </div>

        {history.length > 0 && (
          <button
            className="danger-button"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">🕘</div>

          <h3>No content yet</h3>

          <p>
            Generate your first piece of content and it
            will appear here.
          </p>

          <button
            className="primary-small"
            onClick={() => setView("writer")}
          >
            Create Content
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div
              className="history-card"
              key={item.historyId}
            >
              <div className="history-card-top">
                <span className="history-type">
                  {item.contentType}
                </span>

                <button
                  className="icon-button"
                  onClick={() =>
                    deleteHistoryItem(
                      item.historyId
                    )
                  }
                  title="Delete"
                >
                  ×
                </button>
              </div>

              <h3>
                {item.title || item.topic}
              </h3>

              <p>
                {cleanMarkdown(item.content)
                  .slice(0, 150)}
                {item.content.length > 150
                  ? "..."
                  : ""}
              </p>

              <div className="history-meta">
                <span>
                  📝 {item.wordCount} words
                </span>

                <span>
                  {new Date(
                    item.savedAt
                  ).toLocaleDateString()}
                </span>
              </div>

              <button
                className="secondary-button full"
                onClick={() =>
                  openHistoryItem(item)
                }
              >
                Open Content
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  /* =========================
     DASHBOARD VIEW
  ========================= */

  const DashboardView = () => (
    <section className="page-section">
      <div className="section-heading-row">
        <div>
          <div className="eyebrow">
            OVERVIEW
          </div>

          <h2>Dashboard</h2>

          <p>
            Track your AI content generation activity.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">✦</span>
          <span className="stat-label">
            Total Content
          </span>
          <strong>{dashboardStats.total}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-label">
            Words Generated
          </span>
          <strong>
            {dashboardStats.totalWords.toLocaleString()}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-label">
            Blog Posts
          </span>
          <strong>{dashboardStats.blogs}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📄</span>
          <span className="stat-label">
            Articles
          </span>
          <strong>{dashboardStats.articles}</strong>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="dashboard-panel">
          <h3>Content Breakdown</h3>

          <div className="breakdown-row">
            <span>Blog</span>
            <strong>{dashboardStats.blogs}</strong>
          </div>

          <div className="breakdown-row">
            <span>Article</span>
            <strong>{dashboardStats.articles}</strong>
          </div>

          <div className="breakdown-row">
            <span>Social Media</span>
            <strong>{dashboardStats.social}</strong>
          </div>

          <div className="breakdown-row">
            <span>Email</span>
            <strong>{dashboardStats.emails}</strong>
          </div>
        </div>

        <div className="dashboard-panel">
          <h3>Recent Activity</h3>

          {history.length === 0 ? (
            <p className="muted">
              No activity yet.
            </p>
          ) : (
            history.slice(0, 5).map((item) => (
              <div
                className="activity-item"
                key={item.historyId}
              >
                <div className="activity-dot">
                  ✦
                </div>

                <div>
                  <strong>
                    {item.title || item.topic}
                  </strong>

                  <small>
                    {item.wordCount} words ·{" "}
                    {new Date(
                      item.savedAt
                    ).toLocaleString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );

  /* =========================
     AUTH SCREEN
  ========================= */

  const AuthModal = () => {
    if (!showAuth) return null;

    return (
      <div className="modal-overlay">
        <div className="auth-modal">
          <button
            className="modal-close"
            onClick={() => setShowAuth(false)}
          >
            ×
          </button>

          <div className="auth-icon">✦</div>

          <h2>
            {authMode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p>
            {authMode === "login"
              ? "Sign in to your AI Content Writer."
              : "Start creating AI-powered content."}
          </p>

          {authMode === "register" && (
            <input
              className="auth-input"
              value={authName}
              onChange={(e) =>
                setAuthName(e.target.value)
              }
              placeholder="Your name"
            />
          )}

          <input
            className="auth-input"
            type="email"
            value={authEmail}
            onChange={(e) =>
              setAuthEmail(e.target.value)
            }
            placeholder="Email address"
          />

          <input
            className="auth-input"
            type="password"
            value={authPassword}
            onChange={(e) =>
              setAuthPassword(e.target.value)
            }
            placeholder="Password"
          />

          {authError && (
            <div className="error">
              {authError}
            </div>
          )}

          <button
            className="generate-button"
            onClick={handleAuth}
          >
            {authMode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>

          <button
            className="auth-switch"
            onClick={() => {
              setAuthMode(
                authMode === "login"
                  ? "register"
                  : "login"
              );

              setAuthError("");
            }}
          >
            {authMode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className="app">
      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #070a12;
          color: #f8fafc;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input,
        select,
        textarea {
          font-family: inherit;
        }

        button {
          transition: 0.2s ease;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 15% 5%,
              rgba(99,102,241,0.18),
              transparent 27%
            ),
            radial-gradient(
              circle at 85% 10%,
              rgba(168,85,247,0.13),
              transparent 25%
            ),
            #070a12;
        }

        /* NAVBAR */

        .navbar {
          height: 72px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(7,10,18,0.82);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 19px;
          font-weight: 800;
        }

        .brand-icon {
          width: 35px;
          height: 35px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #6366f1,
            #a855f7
          );
          box-shadow:
            0 8px 25px rgba(99,102,241,0.35);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-button {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          color: #cbd5e1;
          padding: 8px 12px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
        }

        .nav-button:hover {
          background: rgba(255,255,255,0.09);
          color: white;
        }

        .nav-button.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(129,140,248,0.30);
          color: #c4b5fd;
        }

        .nav-user {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(99,102,241,0.12);
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 700;
        }

        .container {
          width: min(1120px, 92%);
          margin: auto;
          padding: 65px 0 100px;
        }

        /* HERO */

        .hero {
          text-align: center;
          margin-bottom: 45px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 999px;
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(129,140,248,0.25);
          color: #a5b4fc;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 22px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 68px);
          line-height: 1.05;
          letter-spacing: -3px;
          font-weight: 850;
          background: linear-gradient(
            90deg,
            #ffffff,
            #c4b5fd,
            #93c5fd
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          max-width: 650px;
          margin: 22px auto 0;
          color: #94a3b8;
          font-size: 17px;
          line-height: 1.7;
        }

        /* GENERATOR */

        .generator {
          background: rgba(15,23,42,0.78);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          padding: 30px;
          box-shadow:
            0 25px 80px rgba(0,0,0,0.30),
            inset 0 1px rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
        }

        .generator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .generator-title {
          margin: 0;
          font-size: 21px;
        }

        .generator-subtitle {
          color: #64748b;
          font-size: 13px;
          margin-top: 5px;
        }

        .sparkle {
          font-size: 25px;
          color: #a78bfa;
        }

        .label {
          display: block;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .form-group {
          margin-bottom: 19px;
        }

        .topic-input,
        .select,
        .textarea {
          width: 100%;
          border: 1px solid #263247;
          background: #0a1020;
          color: #e2e8f0;
          outline: none;
          font-size: 14px;
          transition: 0.2s;
        }

        .topic-input {
          padding: 16px 17px;
          border-radius: 12px;
          font-size: 15px;
        }

        .select,
        .textarea {
          padding: 13px 14px;
          border-radius: 11px;
        }

        .textarea {
          resize: vertical;
          min-height: 105px;
        }

        .topic-input:focus,
        .textarea:focus,
        .select:focus,
        .auth-input:focus {
          border-color: #6366f1;
          box-shadow:
            0 0 0 3px rgba(99,102,241,0.12);
        }

        .topic-input::placeholder,
        .textarea::placeholder,
        .auth-input::placeholder {
          color: #475569;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .generate-button {
          width: 100%;
          margin-top: 4px;
          padding: 15px;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            #6366f1,
            #8b5cf6
          );
          box-shadow:
            0 12px 30px rgba(99,102,241,0.25);
        }

        .generate-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 15px 35px rgba(99,102,241,0.35);
        }

        .generate-button:disabled {
          cursor: wait;
          opacity: 0.65;
          transform: none;
        }

        .error {
          padding: 12px 14px;
          margin-bottom: 17px;
          border-radius: 10px;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.25);
          color: #fda4af;
          font-size: 13px;
        }

        /* GENERATION */

        .generation-card {
          margin-top: 35px;
          border: 1px solid rgba(129,140,248,0.18);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at center,
              rgba(99,102,241,0.10),
              transparent 55%
            ),
            #0f172a;
          padding: 55px 30px;
          text-align: center;
          overflow: hidden;
        }

        .ai-orb {
          width: 82px;
          height: 82px;
          margin: 0 auto 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #6366f1,
            #a855f7
          );
          box-shadow:
            0 0 0 12px rgba(99,102,241,0.07),
            0 0 70px rgba(139,92,246,0.40);
          animation: pulse 1.7s infinite;
        }

        .orb-core {
          font-size: 28px;
          animation: spin 2s linear infinite;
        }

        .generation-card h3 {
          margin: 0;
          font-size: 22px;
        }

        .generation-card p {
          color: #94a3b8;
          max-width: 550px;
          margin: 12px auto 25px;
          line-height: 1.6;
        }

        .loading-bar {
          width: min(500px, 90%);
          height: 6px;
          background: #1e293b;
          border-radius: 999px;
          margin: auto;
          overflow: hidden;
        }

        .loading-progress {
          height: 100%;
          width: 45%;
          background: linear-gradient(
            90deg,
            #6366f1,
            #c084fc
          );
          border-radius: inherit;
          animation: loading 1.5s infinite;
        }

        .loading-steps {
          margin-top: 25px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px;
          color: #64748b;
          font-size: 12px;
        }

        /* RESULT */

        .result {
          margin-top: 35px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          background: #0f172a;
          overflow: hidden;
          box-shadow:
            0 25px 80px rgba(0,0,0,0.25);
        }

        .result-top {
          padding: 27px 30px;
          background:
            linear-gradient(
              135deg,
              rgba(99,102,241,0.12),
              rgba(168,85,247,0.07)
            );
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .result-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .result-title {
          margin: 0;
          font-size: 26px;
          line-height: 1.3;
        }

        .metadata {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
          color: #94a3b8;
          font-size: 12px;
        }

        .metadata span {
          padding: 5px 9px;
          background: rgba(255,255,255,0.05);
          border-radius: 999px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-button,
        .secondary-button,
        .danger-button,
        .primary-small {
          padding: 9px 13px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
        }

        .action-button:hover,
        .secondary-button:hover {
          background: rgba(255,255,255,0.09);
        }

        .regenerate-button {
          border-color: rgba(129,140,248,0.25);
          color: #c4b5fd;
        }

        .article {
          padding: 35px 30px 45px;
          max-width: 850px;
          margin: auto;
        }

        .article-heading {
          color: #f8fafc;
          font-size: 23px;
          margin: 30px 0 13px;
          line-height: 1.3;
        }

        .article-heading:first-child {
          margin-top: 0;
        }

        .article-subheading {
          color: #e2e8f0;
          font-size: 18px;
          margin: 25px 0 10px;
        }

        .article-paragraph {
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.9;
          margin: 0 0 18px;
          white-space: pre-wrap;
        }

        .article-list {
          color: #cbd5e1;
          line-height: 1.8;
          padding-left: 25px;
          margin: 10px 0 22px;
        }

        .article-list li {
          margin-bottom: 8px;
        }

        code {
          background: #020617;
          border: 1px solid #1e293b;
          padding: 2px 6px;
          border-radius: 5px;
          color: #c4b5fd;
        }

        /* PAGES */

        .page-section {
          margin-top: 15px;
        }

        .section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #8b5cf6;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        .section-heading-row h2 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -1px;
        }

        .section-heading-row p {
          color: #64748b;
          margin: 8px 0 0;
        }

        .danger-button {
          color: #fda4af;
          border-color: rgba(244,63,94,0.25);
          background: rgba(244,63,94,0.06);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .history-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 17px;
          padding: 20px;
        }

        .history-card:hover {
          border-color: rgba(129,140,248,0.30);
          transform: translateY(-2px);
        }

        .history-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-type {
          color: #a5b4fc;
          background: rgba(99,102,241,0.10);
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .icon-button {
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 22px;
          cursor: pointer;
        }

        .history-card h3 {
          margin: 18px 0 8px;
          font-size: 17px;
        }

        .history-card p {
          color: #64748b;
          line-height: 1.6;
          font-size: 13px;
          min-height: 65px;
        }

        .history-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #64748b;
          font-size: 11px;
          margin: 15px 0;
        }

        .full {
          width: 100%;
        }

        .empty-history {
          text-align: center;
          padding: 75px 20px;
          background: rgba(15,23,42,0.65);
          border: 1px dashed rgba(255,255,255,0.10);
          border-radius: 20px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .empty-history h3 {
          margin: 0;
        }

        .empty-history p {
          color: #64748b;
        }

        .primary-small {
          background: linear-gradient(
            135deg,
            #6366f1,
            #8b5cf6
          );
          color: white;
          border: none;
          padding: 11px 16px;
        }

        /* DASHBOARD */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 17px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-icon {
          font-size: 21px;
        }

        .stat-label {
          color: #64748b;
          font-size: 12px;
        }

        .stat-card strong {
          font-size: 29px;
        }

        .dashboard-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .dashboard-panel {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 17px;
          padding: 23px;
        }

        .dashboard-panel h3 {
          margin-top: 0;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #94a3b8;
        }

        .breakdown-row strong {
          color: white;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .activity-dot {
          width: 31px;
          height: 31px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.12);
          color: #a5b4fc;
        }

        .activity-item strong {
          display: block;
          font-size: 13px;
        }

        .activity-item small {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 10px;
        }

        .muted {
          color: #64748b;
        }

        /* AUTH */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.70);
          backdrop-filter: blur(10px);
        }

        .auth-modal {
          position: relative;
          width: min(420px, 100%);
          padding: 32px;
          border-radius: 20px;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 30px 100px rgba(0,0,0,0.5);
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 18px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 25px;
          cursor: pointer;
        }

        .auth-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #6366f1,
            #a855f7
          );
          margin-bottom: 20px;
        }

        .auth-modal h2 {
          margin: 0;
          font-size: 26px;
        }

        .auth-modal > p {
          color: #64748b;
          margin: 8px 0 25px;
        }

        .auth-input {
          width: 100%;
          padding: 13px;
          margin-bottom: 12px;
          border-radius: 10px;
          border: 1px solid #263247;
          background: #0a1020;
          color: white;
          outline: none;
        }

        .auth-switch {
          width: 100%;
          border: none;
          background: transparent;
          color: #a5b4fc;
          cursor: pointer;
          margin-top: 16px;
          font-size: 13px;
        }

        /* ANIMATIONS */

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-120%);
          }

          50% {
            transform: translateX(80%);
          }

          100% {
            transform: translateX(250%);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 850px) {
          .history-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .container {
            padding-top: 45px;
          }

          .grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .generator {
            padding: 20px;
          }

          .result-top {
            padding: 22px;
          }

          .result-top-row {
            flex-direction: column;
          }

          .actions {
            width: 100%;
          }

          .action-button {
            flex: 1;
          }

          .article {
            padding: 25px 22px 35px;
          }

          .hero h1 {
            letter-spacing: -2px;
          }

          .nav-actions {
            display: none;
          }

          .history-grid,
          .stats-grid,
          .dashboard-panels {
            grid-template-columns: 1fr;
          }

          .section-heading-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }

      `}</style>

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <span>AI Content Writer</span>
        </div>

        <div className="nav-actions">
          <button
            className={`nav-button ${
              view === "writer" ? "active" : ""
            }`}
            onClick={() => setView("writer")}
          >
            ✦ Writer
          </button>

          <button
            className={`nav-button ${
              view === "dashboard" ? "active" : ""
            }`}
            onClick={() => setView("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className={`nav-button ${
              view === "history" ? "active" : ""
            }`}
            onClick={() => setView("history")}
          >
            🕘 History
          </button>

          {isAuthenticated ? (
            <>
              <span className="nav-user">
                {localStorage.getItem(
                  "ai_writer_user"
                ) || "User"}
              </span>

              <button
                className="nav-button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="nav-button active"
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
              }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <main className="container">

        {/* WRITER */}

        {view === "writer" && (
          <>
            <section className="hero">
              <div className="hero-badge">
                ✨ Your AI writing assistant
              </div>

              <h1>
                Turn ideas into
                <br />
                great content.
              </h1>

              <p>
                Generate blog posts, articles and marketing
                content with your AI-powered writing
                assistant.
              </p>
            </section>

            <section className="generator">
              <div className="generator-header">
                <div>
                  <h2 className="generator-title">
                    Create new content
                  </h2>

                  <div className="generator-subtitle">
                    Tell the AI what you want to write.
                  </div>
                </div>

                <div className="sparkle">✦</div>
              </div>

              <div className="form-group">
                <label className="label">
                  TOPIC
                </label>

                <input
                  className="topic-input"
                  value={topic}
                  onChange={(e) =>
                    setTopic(e.target.value)
                  }
                  placeholder="What do you want to write about?"
                />
              </div>

              <div className="grid">
                <div className="form-group">
                  <label className="label">
                    CONTENT TYPE
                  </label>

                  <select
                    className="select"
                    value={contentType}
                    onChange={(e) =>
                      setContentType(e.target.value)
                    }
                  >
                    <option value="BLOG">
                      Blog
                    </option>

                    <option value="ARTICLE">
                      Article
                    </option>

                    <option value="SOCIAL_MEDIA">
                      Social Media
                    </option>

                    <option value="EMAIL">
                      Email
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">
                    TONE
                  </label>

                  <select
                    className="select"
                    value={tone}
                    onChange={(e) =>
                      setTone(e.target.value)
                    }
                  >
                    <option value="FRIENDLY">
                      Friendly
                    </option>

                    <option value="PROFESSIONAL">
                      Professional
                    </option>

                    <option value="CASUAL">
                      Casual
                    </option>

                    <option value="FORMAL">
                      Formal
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid">
                <div className="form-group">
                  <label className="label">
                    LENGTH
                  </label>

                  <select
                    className="select"
                    value={length}
                    onChange={(e) =>
                      setLength(e.target.value)
                    }
                  >
                    <option value="SHORT">
                      Short — ~300 words
                    </option>

                    <option value="MEDIUM">
                      Medium — ~600 words
                    </option>

                    <option value="LONG">
                      Long — ~1000 words
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">
                    TARGET AUDIENCE
                  </label>

                  <input
                    className="topic-input"
                    value={targetAudience}
                    onChange={(e) =>
                      setTargetAudience(
                        e.target.value
                      )
                    }
                    placeholder="Beginners"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  ADDITIONAL INSTRUCTIONS
                </label>

                <textarea
                  className="textarea"
                  value={additionalInstructions}
                  onChange={(e) =>
                    setAdditionalInstructions(
                      e.target.value
                    )
                  }
                  placeholder="Example: Use simple English, practical examples and short paragraphs."
                />
              </div>

              {error && (
                <div className="error">
                  ⚠️ {error}
                </div>
              )}

              <button
                className="generate-button"
                onClick={generateContent}
                disabled={loading}
              >
                {loading
                  ? "✦ AI is writing..."
                  : "✦ Generate Content"}
              </button>
            </section>

            {loading && <LoadingScreen />}

            {result && !loading && (
              <section className="result">
                <div className="result-top">
                  <div className="result-top-row">
                    <div>
                      <h2 className="result-title">
                        {result.title ||
                          result.topic}
                      </h2>

                      <div className="metadata">
                        <span>
                          📝 {result.wordCount} words
                        </span>

                        <span>
                          {result.contentType}
                        </span>

                        <span>
                          {result.tone}
                        </span>

                        <span>
                          {result.targetAudience}
                        </span>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="action-button regenerate-button"
                        onClick={
                          regenerateContent
                        }
                      >
                        🔄 Regenerate
                      </button>

                      <button
                        className="action-button"
                        onClick={copyContent}
                      >
                        {copied
                          ? "✓ Copied"
                          : "📋 Copy"}
                      </button>

                      <button
                        className="action-button"
                        onClick={
                          downloadContent
                        }
                      >
                        ↓ Download
                      </button>
                    </div>
                  </div>
                </div>

                <article className="article">
                  {renderMarkdown(
                    result.content
                  )}
                </article>
              </section>
            )}
          </>
        )}

        {/* HISTORY */}

        {view === "history" && (
          <HistoryView />
        )}

        {/* DASHBOARD */}

        {view === "dashboard" && (
          <DashboardView />
        )}
      </main>

      <AuthModal />
    </div>
  );
}

export default App;
