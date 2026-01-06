import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import pvpService, { type SessionWithDetails } from "../services/pvpService";

const PublicSessions = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("waiting");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  useEffect(() => {
    loadPublicSessions();
  }, [statusFilter, difficultyFilter]);

  const loadPublicSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await pvpService.getPublicSessions({
        status: statusFilter || undefined,
        difficulty: difficultyFilter || undefined,
        search: search || undefined,
        limit: 50,
      });
      setSessions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load public sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPublicSessions();
  };

  const handleJoinSession = async (sessionId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const session = await pvpService.joinSessionByID(sessionId);
      if (session.status === "waiting") {
        navigate(`/pvp/lobby/${session.code}`);
      } else {
        navigate(`/pvp/session/${session.id}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to join session");
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "mac-green";
      case "medium":
        return "mac-yellow";
      case "hard":
        return "mac-red";
      default:
        return "";
    }
  };

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
            🌐 Public Sessions Browser
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
              🌐
            </div>
            <h1 style={{ marginBottom: "8px", fontSize: "24px" }}>
              Public Coding Battles
            </h1>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Join open sessions and compete with others
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Filters */}
          <div
            className="mac-panel"
            style={{ padding: "16px", marginBottom: "20px" }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              FILTERS
            </h3>
            <form onSubmit={handleSearch}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: "12px",
                  alignItems: "end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    SEARCH:
                  </label>
                  <input
                    type="text"
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sessions..."
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    STATUS:
                  </label>
                  <select
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="waiting">Waiting</option>
                    <option value="active">Active</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    DIFFICULTY:
                  </label>
                  <select
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <button type="submit" className="mac-button-primary">
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mac-panel mac-red"
              style={{ marginBottom: "20px", padding: "12px" }}
            >
              <p style={{ fontSize: "11px", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              <div
                className="mac-loading"
                style={{ margin: "0 auto 16px" }}
              ></div>
              <p style={{ fontSize: "11px", color: "#404040" }}>
                Loading sessions...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
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
                📭
              </div>
              <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
                No Public Sessions Found
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "16px",
                }}
              >
                Try changing the filters or create your own session
              </p>
              <button
                onClick={() => navigate("/pvp")}
                className="mac-button-primary"
              >
                Create Session
              </button>
            </div>
          )}

          {/* Sessions Table */}
          {!loading && sessions.length > 0 && (
            <div className="mac-inset" style={{ padding: 0 }}>
              <table className="mac-table">
                <thead>
                  <tr>
                    <th>STATUS</th>
                    <th>TITLE</th>
                    <th>DIFFICULTY</th>
                    <th>PROBLEMS</th>
                    <th>DURATION</th>
                    <th>PLAYERS</th>
                    <th>HOST</th>
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
                          {session.status === "waiting"
                            ? "WAIT"
                            : session.status === "active"
                              ? "LIVE"
                              : "END"}
                        </span>
                      </td>
                      <td style={{ fontWeight: "bold" }}>{session.title}</td>
                      <td>
                        <span
                          className={`mac-badge ${getDifficultyBadgeClass(
                            session.difficulty,
                          )}`}
                        >
                          {session.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td>{session.max_problems}</td>
                      <td>{session.duration} min</td>
                      <td>👥 {session.participant_count}</td>
                      <td>@{session.admin_username}</td>
                      <td>
                        <button
                          onClick={() => handleJoinSession(session.id)}
                          disabled={session.status === "finished"}
                          className={
                            session.status === "finished"
                              ? "mac-button mac-disabled"
                              : "mac-button-primary"
                          }
                          style={{ fontSize: "10px", padding: "4px 12px" }}
                        >
                          {session.status === "waiting"
                            ? "JOIN"
                            : session.status === "active"
                              ? "JOIN"
                              : "ENDED"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Session Count */}
          {!loading && sessions.length > 0 && (
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
              className="mac-button"
              style={{ width: "100%" }}
            >
              ➕ Create Session
            </button>
            <button
              onClick={() => navigate("/pvp")}
              className="mac-button"
              style={{ width: "100%" }}
            >
              🔑 Join by Code
            </button>
            <button
              onClick={loadPublicSessions}
              className="mac-button"
              style={{ width: "100%" }}
            >
              🔄 Refresh List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSessions;
