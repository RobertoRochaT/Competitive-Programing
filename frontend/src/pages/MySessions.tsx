import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import pvpService, { type SessionWithDetails } from "../services/pvpService";

const MySessions = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    try {
      const data = await pvpService.getUserSessions();
      setSessions(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || "Failed to load sessions");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "waiting":
        return "mac-yellow";
      case "active":
        return "mac-green";
      case "finished":
        return "";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return "⏳";
      case "active":
        return "🔴";
      case "finished":
        return "🏁";
      default:
        return "📋";
    }
  };

  const handleJoinSession = (session: SessionWithDetails) => {
    if (session.status === "waiting") {
      navigate(`/pvp/lobby/${session.code}`);
    } else if (session.status === "active") {
      navigate(`/pvp/session/${session.id}`);
    } else {
      navigate(`/pvp/session/${session.id}`);
    }
  };

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
          <p style={{ fontSize: "11px", color: "#404040" }}>
            Loading sessions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Main Window */}
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
            📋 My PvP Sessions
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
              📋
            </div>
            <h1 style={{ marginBottom: "8px", fontSize: "24px" }}>
              My Sessions
            </h1>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              All your active and past competitive sessions
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Error */}
          {error && (
            <div
              className="mac-panel mac-red"
              style={{ marginBottom: "20px", padding: "12px" }}
            >
              <p style={{ fontSize: "11px", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 ? (
            <div
              className="mac-inset"
              style={{ padding: "40px", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  filter: "grayscale(1)",
                }}
              >
                🎮
              </div>
              <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
                No Sessions Yet
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "16px",
                }}
              >
                You haven't joined any PvP sessions yet
              </p>
              <button
                onClick={() => navigate("/pvp")}
                className="mac-button-primary"
              >
                Go to PvP Hub
              </button>
            </div>
          ) : (
            <>
              {/* Sessions Table */}
              <div className="mac-inset" style={{ padding: 0 }}>
                <table className="mac-table">
                  <thead>
                    <tr>
                      <th>STATUS</th>
                      <th>TITLE</th>
                      <th>CODE</th>
                      <th>DIFFICULTY</th>
                      <th>PROBLEMS</th>
                      <th>DURATION</th>
                      <th>PLAYERS</th>
                      <th>ADMIN</th>
                      <th>CREATED</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>
                          <span
                            className={`mac-badge ${getStatusBadgeClass(
                              session.status,
                            )}`}
                          >
                            {getStatusIcon(session.status)}{" "}
                            {session.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>{session.title}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: "Courier New, monospace",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            {session.code}
                          </span>
                        </td>
                        <td style={{ textTransform: "uppercase" }}>
                          {session.difficulty}
                        </td>
                        <td>{session.max_problems}</td>
                        <td>{session.duration} min</td>
                        <td>👥 {session.participant_count}</td>
                        <td>@{session.admin_username}</td>
                        <td style={{ fontSize: "10px" }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => handleJoinSession(session)}
                            className={
                              session.status === "active"
                                ? "mac-button-primary"
                                : "mac-button"
                            }
                            style={{ fontSize: "10px", padding: "4px 12px" }}
                          >
                            {session.status === "active"
                              ? "JOIN"
                              : session.status === "waiting"
                                ? "LOBBY"
                                : "VIEW"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Session Count */}
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "10px",
                  color: "#404040",
                  textAlign: "right",
                }}
              >
                Showing {sessions.length} session
                {sessions.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
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
            Quick Actions
          </span>
        </div>

        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            <button
              onClick={() => navigate("/pvp")}
              className="mac-button-primary"
              style={{ width: "100%" }}
            >
              ➕ Create New Session
            </button>
            <button
              onClick={() => navigate("/pvp/public")}
              className="mac-button"
              style={{ width: "100%" }}
            >
              🌐 Browse Public
            </button>
            <button
              onClick={loadSessions}
              className="mac-button"
              style={{ width: "100%" }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessions;
