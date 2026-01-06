import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import pvpService, {
  type SessionWithDetails,
  type PvPProblem,
} from "../services/pvpService";

const PvPLobby = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [session, setSession] = useState<SessionWithDetails | null>(null);
  const [problems, setProblems] = useState<PvPProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const loadSession = async () => {
    try {
      if (!code) return;
      const sessionData = await pvpService.getSessionByCode(code);
      setSession(sessionData);

      if (sessionData.status === "active") {
        navigate(`/pvp/session/${sessionData.id}`);
      }

      if (sessionData.problems && sessionData.problems.length > 0) {
        setProblems(sessionData.problems);
      }

      setLoading(false);
    } catch (err) {
      setError((err as Error).message || "Failed to load session");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadSession();
    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, [code, isAuthenticated]);

  const handleStartSession = async () => {
    if (!session) return;

    setStarting(true);
    try {
      await pvpService.startSession(session.id);
      navigate(`/pvp/session/${session.id}`);
    } catch (err) {
      setError((err as Error).message || "Failed to start session");
      setStarting(false);
    }
  };

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
    }
  };

  const isAdmin = session && user && session.admin_user_id === user.id;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="mac-loading" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ fontSize: "11px", color: "#404040" }}>Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div className="mac-window" style={{ maxWidth: "400px" }}>
          <div className="mac-title-bar">
            <div style={{ display: "flex", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#000",
                  border: "1px solid #000",
                }}
                onClick={() => navigate("/pvp")}
              ></div>
            </div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Error
            </span>
          </div>
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                filter: "grayscale(1)",
              }}
            >
              ❌
            </div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
              Session Not Found
            </h2>
            <p
              style={{
                fontSize: "11px",
                color: "#404040",
                marginBottom: "20px",
              }}
            >
              {error || "The session you are looking for does not exist."}
            </p>
            <button
              onClick={() => navigate("/pvp")}
              className="mac-button-primary"
            >
              Back to PvP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Main Lobby Window */}
      <div className="mac-window" style={{ marginBottom: "20px" }}>
        <div className="mac-title-bar">
          <div style={{ display: "flex", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#000",
                border: "1px solid #000",
              }}
              onClick={() => navigate("/pvp")}
            ></div>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#fff",
                border: "1px solid #000",
              }}
            ></div>
          </div>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              flex: 1,
              textAlign: "center",
            }}
          >
            ⏳ Session Lobby - {session.code}
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                filter: "grayscale(1)",
              }}
            >
              ⏳
            </div>
            <h1 style={{ marginBottom: "8px", fontSize: "24px" }}>
              {session.title}
            </h1>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Hosted by @{session.admin_username}
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Session Code */}
          <div
            className="mac-panel"
            style={{ padding: "16px", marginBottom: "20px" }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              SESSION CODE
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div
                className="mac-inset"
                style={{
                  padding: "12px 24px",
                  fontFamily: "Courier New, monospace",
                  fontSize: "24px",
                  fontWeight: "bold",
                  letterSpacing: "4px",
                  textAlign: "center",
                }}
              >
                {session.code}
              </div>
              <button onClick={handleCopyCode} className="mac-button">
                Copy
              </button>
            </div>
            <p
              style={{
                fontSize: "10px",
                color: "#404040",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Share this code with others to join
            </p>
          </div>

          {/* Session Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                DIFFICULTY
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {session.difficulty}
              </div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                PROBLEMS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {session.max_problems}
              </div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                DURATION
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {session.duration} min
              </div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                PLAYERS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                👥 {session.participant_count}
              </div>
            </div>
          </div>

          <div className="mac-divider"></div>

          {/* Two Column Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {/* Participants */}
            <div className="mac-inset" style={{ padding: "12px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                👥 PARTICIPANTS ({session.participant_count})
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {session.participants && session.participants.length > 0 ? (
                  session.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="mac-panel"
                      style={{
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            background: "#000",
                            border: "2px solid #000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#fff",
                          }}
                        >
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                          {participant.username}
                        </span>
                      </div>
                      {participant.user_id === session.admin_user_id && (
                        <span className="mac-badge" style={{ fontSize: "9px" }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#404040",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No participants yet
                  </p>
                )}
              </div>
            </div>

            {/* Problems */}
            <div className="mac-inset" style={{ padding: "12px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                📝 PROBLEMS ({problems.length})
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {problems.length > 0 ? (
                  problems.map((problem, index) => (
                    <div
                      key={problem.id}
                      className="mac-panel"
                      style={{ padding: "8px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            fontFamily: "Courier New, monospace",
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span style={{ fontSize: "11px", flex: 1 }}>
                          {problem.problem_title}
                        </span>
                        <span
                          className={`mac-badge ${
                            problem.problem_difficulty === "easy"
                              ? "mac-green"
                              : problem.problem_difficulty === "medium"
                                ? "mac-yellow"
                                : "mac-red"
                          }`}
                          style={{ fontSize: "9px" }}
                        >
                          {problem.problem_difficulty.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#404040",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Problems will appear here
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <div className="mac-divider"></div>
              <div style={{ marginTop: "20px" }}>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  ADMIN CONTROLS
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleStartSession}
                    disabled={starting || session.participant_count < 1}
                    className={
                      starting || session.participant_count < 1
                        ? "mac-button mac-disabled"
                        : "mac-button-primary"
                    }
                    style={{ flex: 1 }}
                  >
                    {starting ? "Starting..." : "🚀 Start Session"}
                  </button>
                  <button
                    onClick={() => navigate("/pvp")}
                    className="mac-button"
                  >
                    Cancel
                  </button>
                </div>
                {session.participant_count < 1 && (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#404040",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    Waiting for at least 1 participant to join...
                  </p>
                )}
              </div>
            </>
          )}

          {/* Non-Admin Message */}
          {!isAdmin && (
            <>
              <div className="mac-divider"></div>
              <div
                className="mac-panel"
                style={{
                  padding: "16px",
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "11px", margin: 0 }}>
                  ⏳ Waiting for @{session.admin_username} to start the
                  session...
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions Window */}
      <div className="mac-window">
        <div className="mac-title-bar">
          <div style={{ display: "flex", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#fff",
                border: "1px solid #000",
              }}
            ></div>
          </div>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              flex: 1,
              textAlign: "center",
            }}
          >
            Instructions
          </span>
        </div>
        <div className="mac-inset" style={{ padding: "16px", margin: "12px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            HOW TO PLAY
          </h3>
          <ul
            style={{ fontSize: "11px", lineHeight: "1.6", paddingLeft: "20px" }}
          >
            <li>Wait for the admin to start the session</li>
            <li>Once started, solve as many problems as you can</li>
            <li>Submit your solutions to see real-time results</li>
            <li>Check the leaderboard to see your ranking</li>
            <li>The player with the most solved problems wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PvPLobby;
