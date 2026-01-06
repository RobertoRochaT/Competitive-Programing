import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import pvpService, {
  type SessionWithDetails,
  type PvPProblem,
  type LeaderboardEntry,
} from "../services/pvpService";
import Editor from "@monaco-editor/react";

const PvPSession = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionWithDetails | null>(null);
  const [problems, setProblems] = useState<PvPProblem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<PvPProblem | null>(
    null,
  );
  const [code, setCode] = useState<string>("// Write your solution here\n");
  const [language, setLanguage] = useState<string>("cpp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        const sessionData = await pvpService.getSessionByID(parseInt(id));
        setSession(sessionData);

        if (sessionData.status !== "active") {
          navigate(`/pvp/lobby/${sessionData.code}`);
          return;
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load session");
      }
    };

    fetchSession();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;

    const fetchProblems = async () => {
      try {
        const problemsData = await pvpService.getSessionProblems(parseInt(id));
        setProblems(problemsData);
        if (problemsData.length > 0 && !selectedProblem) {
          setSelectedProblem(problemsData[0]);
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      }
    };

    fetchProblems();
  }, [id, selectedProblem]);

  useEffect(() => {
    if (!id) return;

    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await pvpService.getLeaderboard(parseInt(id));
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!session?.started_at || !session?.duration) {
      if (session?.duration) {
        setTimeLeft(session.duration * 60);
      }
      return;
    }

    const calculateTimeLeft = () => {
      const startTime = new Date(session.started_at!).getTime();
      const durationMs = session.duration * 60 * 1000;
      const endTime = startTime + durationMs;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeLeft(remaining);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !id) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mockResults = {
        problem_id: selectedProblem.problem_id,
        problem_slug: selectedProblem.problem_slug,
        code: code,
        language: language,
        status: "Accepted",
        runtime: Math.floor(Math.random() * 100) + 10,
        memory: Math.floor(Math.random() * 1000) + 100,
        passed_tests: 10,
        total_tests: 10,
      };

      await pvpService.submitSolution(parseInt(id), mockResults);
      setSuccess("Solution submitted successfully!");

      const leaderboardData = await pvpService.getLeaderboard(parseInt(id));
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError((err as Error).message || "Failed to submit solution");
    } finally {
      setLoading(false);
    }
  };

  if (!session || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="mac-loading"></div>
      </div>
    );
  }

  const sessionEnded = timeLeft === 0;

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      {/* Session Ended Overlay */}
      {sessionEnded && (
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
                Session Ended
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
                🏁
              </div>
              <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
                Time's Up!
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  marginBottom: "20px",
                }}
              >
                The session has ended. Check the final leaderboard below.
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
      )}

      {/* Header Bar */}
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
            ⚔️ {session.title}
          </span>
        </div>

        <div style={{ padding: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                {session.title}
              </h2>
              <p
                style={{ fontSize: "10px", color: "#404040", marginTop: "2px" }}
              >
                Code: {session.code}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="mac-panel" style={{ padding: "8px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    textAlign: "center",
                  }}
                >
                  TIME LEFT
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    fontFamily: "Courier New, monospace",
                    color: timeLeft && timeLeft < 300 ? "#ff0000" : "#000",
                    textAlign: "center",
                  }}
                >
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr 300px",
          gap: "20px",
          height: "calc(100vh - 150px)",
        }}
      >
        {/* Left Sidebar - Problems */}
        <div
          className="mac-window"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="mac-title-bar">
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Problems
            </span>
          </div>
          <div style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
            {problems.map((problem, index) => (
              <div
                key={problem.id}
                className={
                  selectedProblem?.id === problem.id ? "mac-panel" : "mac-inset"
                }
                style={{
                  padding: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedProblem(problem)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      fontFamily: "Courier New, monospace",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span
                    className={`mac-badge ${
                      problem.problem_difficulty === "easy"
                        ? "mac-green"
                        : problem.problem_difficulty === "medium"
                          ? "mac-yellow"
                          : "mac-red"
                    }`}
                    style={{ fontSize: "8px" }}
                  >
                    {problem.problem_difficulty.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                  {problem.problem_title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Problem & Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Problem Description */}
          <div
            className="mac-window"
            style={{
              flex: "0 0 200px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="mac-title-bar">
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {selectedProblem
                  ? `Problem ${String.fromCharCode(65 + problems.indexOf(selectedProblem))}`
                  : "Select a Problem"}
              </span>
            </div>
            <div
              className="mac-inset"
              style={{
                margin: "12px",
                padding: "12px",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {selectedProblem ? (
                <>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedProblem.problem_title}
                  </h3>
                  <p
                    style={{
                      fontSize: "11px",
                      lineHeight: "1.6",
                      color: "#404040",
                    }}
                  >
                    Problem: {selectedProblem.problem_slug}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    fontSize: "11px",
                    color: "#404040",
                    textAlign: "center",
                  }}
                >
                  Select a problem from the list
                </p>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div
            className="mac-window"
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <div className="mac-title-bar">
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Code Editor
              </span>
            </div>
            <div
              style={{
                padding: "12px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <select
                  className="mac-input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ width: "150px" }}
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div
                style={{
                  flex: 1,
                  border: "2px solid #000",
                  background: "#fff",
                }}
              >
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              {error && (
                <div
                  className="mac-panel mac-red"
                  style={{ marginTop: "8px", padding: "8px" }}
                >
                  <p style={{ fontSize: "10px", margin: 0 }}>{error}</p>
                </div>
              )}

              {success && (
                <div
                  className="mac-panel mac-green"
                  style={{ marginTop: "8px", padding: "8px" }}
                >
                  <p style={{ fontSize: "10px", margin: 0 }}>{success}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedProblem || sessionEnded}
                className={
                  loading || !selectedProblem || sessionEnded
                    ? "mac-button mac-disabled"
                    : "mac-button-primary"
                }
                style={{ marginTop: "8px", width: "100%" }}
              >
                {loading ? "Submitting..." : "Submit Solution"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Leaderboard */}
        <div
          className="mac-window"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="mac-title-bar">
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              🏆 Leaderboard
            </span>
          </div>
          <div style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
            {leaderboard.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={
                      entry.user_id === user.id ? "mac-panel" : "mac-inset"
                    }
                    style={{
                      padding: "8px",
                      background:
                        entry.user_id === user.id ? "#000080" : undefined,
                      color: entry.user_id === user.id ? "#fff" : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
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
                            fontSize: "14px",
                            fontWeight: "bold",
                            fontFamily: "Courier New, monospace",
                          }}
                        >
                          #{index + 1}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                          {entry.username}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {entry.problems_solved}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      {problems.map((_, pIndex) => {
                        const problemLetter = String.fromCharCode(65 + pIndex);
                        const problemStatus = entry.problems[problemLetter];
                        const isSolved = problemStatus?.accepted || false;
                        return (
                          <div
                            key={pIndex}
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "1px solid #000",
                              background: isSolved ? "#00ff00" : "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            {problemLetter}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "11px",
                  color: "#404040",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No submissions yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PvPSession;
