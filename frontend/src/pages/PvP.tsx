import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import pvpService from "../services/pvpService";

const PvP = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState({
    title: "",
    topics: [] as string[],
    difficulty: "mixed",
    max_problems: 3,
    duration: 60,
    is_public: false,
  });

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await pvpService.createSession(createForm);
      setShowCreateModal(false);
      navigate(`/pvp/lobby/${session.code}`);
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await pvpService.joinSession({
        code: joinCode.toUpperCase(),
      });
      setShowJoinModal(false);
      navigate(`/pvp/lobby/${session.code}`);
    } catch (err: any) {
      setError(err.message || "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMySessions = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/pvp/my-sessions");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Main PvP Window */}
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
            ⚔️ Player vs Player Arena
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                filter: "grayscale(1)",
              }}
            >
              ⚔️
            </div>
            <h1 style={{ marginBottom: "8px", fontSize: "24px" }}>
              Compete in Real-Time Coding Battles
            </h1>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Challenge others or join public sessions
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Action Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Create Session */}
            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  filter: "grayscale(1)",
                  textAlign: "center",
                }}
              >
                ➕
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                CREATE SESSION
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Start your own coding battle
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mac-button-primary"
                style={{ width: "100%" }}
              >
                Create
              </button>
            </div>

            {/* Join by Code */}
            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  filter: "grayscale(1)",
                  textAlign: "center",
                }}
              >
                🔑
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                JOIN BY CODE
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Enter a private session code
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="mac-button"
                style={{ width: "100%" }}
              >
                Join
              </button>
            </div>

            {/* Public Sessions */}
            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  filter: "grayscale(1)",
                  textAlign: "center",
                }}
              >
                🌐
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                PUBLIC SESSIONS
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Browse and join open battles
              </p>
              <button
                onClick={() => navigate("/pvp/public")}
                className="mac-button"
                style={{ width: "100%" }}
              >
                Browse
              </button>
            </div>

            {/* My Sessions */}
            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  filter: "grayscale(1)",
                  textAlign: "center",
                }}
              >
                📋
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                MY SESSIONS
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                View your active battles
              </p>
              <button
                onClick={handleViewMySessions}
                className="mac-button"
                style={{ width: "100%" }}
              >
                View
              </button>
            </div>
          </div>

          <div className="mac-divider"></div>

          {/* Info Section */}
          <div className="mac-inset" style={{ padding: "16px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              HOW IT WORKS
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  1️⃣ CREATE OR JOIN
                </div>
                <p style={{ fontSize: "10px", margin: 0, color: "#404040" }}>
                  Start a new session or join an existing one
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  2️⃣ WAIT FOR PLAYERS
                </div>
                <p style={{ fontSize: "10px", margin: 0, color: "#404040" }}>
                  Share the code with friends or wait in lobby
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  3️⃣ COMPETE
                </div>
                <p style={{ fontSize: "10px", margin: 0, color: "#404040" }}>
                  Solve problems faster than your opponents
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  4️⃣ WIN
                </div>
                <p style={{ fontSize: "10px", margin: 0, color: "#404040" }}>
                  Top the leaderboard and claim victory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="mac-window"
            style={{
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mac-title-bar">
              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#000",
                    border: "1px solid #000",
                  }}
                  onClick={() => setShowCreateModal(false)}
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
                Create New Session
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              {error && (
                <div
                  className="mac-panel mac-red"
                  style={{ marginBottom: "12px", padding: "8px" }}
                >
                  <p style={{ fontSize: "11px", margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateSession}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    SESSION TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    placeholder="Enter session title..."
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    DIFFICULTY:
                  </label>
                  <select
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={createForm.difficulty}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    NUMBER OF PROBLEMS:
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={createForm.max_problems}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        max_problems: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    DURATION (minutes):
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="180"
                    className="mac-input"
                    style={{ width: "100%" }}
                    value={createForm.duration}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        duration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="mac-checkbox"
                      style={{ marginRight: "8px" }}
                      checked={createForm.is_public}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          is_public: e.target.checked,
                        })
                      }
                    />
                    PUBLIC SESSION
                  </label>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#404040",
                      marginTop: "4px",
                      marginLeft: "24px",
                    }}
                  >
                    Anyone can join without a code
                  </p>
                </div>

                <div className="mac-divider"></div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="mac-button"
                    style={{ flex: 1 }}
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="mac-button-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="mac-window"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mac-title-bar">
              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#000",
                    border: "1px solid #000",
                  }}
                  onClick={() => setShowJoinModal(false)}
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
                Join Session
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              {error && (
                <div
                  className="mac-panel mac-red"
                  style={{ marginBottom: "12px", padding: "8px" }}
                >
                  <p style={{ fontSize: "11px", margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleJoinSession}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    SESSION CODE:
                  </label>
                  <input
                    type="text"
                    required
                    className="mac-input"
                    style={{
                      width: "100%",
                      textTransform: "uppercase",
                      fontFamily: "Courier New, monospace",
                      fontSize: "14px",
                      fontWeight: "bold",
                      letterSpacing: "2px",
                      textAlign: "center",
                    }}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                  />
                </div>

                <div className="mac-divider"></div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="mac-button"
                    style={{ flex: 1 }}
                    onClick={() => setShowJoinModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="mac-button-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PvP;
