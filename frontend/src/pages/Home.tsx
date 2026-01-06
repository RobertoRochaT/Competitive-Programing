import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { fetchProblems } from "../features/problems/services/problemService";
import type { UserProfile } from "../types/user";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [problemCount, setProblemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const problemsResponse = await fetchProblems(1, 0);
        setProblemCount(problemsResponse.total);

        if (isAuthenticated && user?.username) {
          const userProfile = await userService.getUserProfile(user.username);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  if (isLoading) {
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

  const stats = profile?.stats;
  const recentACs = profile?.recentACs || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Welcome Window */}
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
            Welcome to Code Practice System
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
              💻
            </div>
            <h1 style={{ marginBottom: "8px", fontSize: "24px" }}>
              Welcome Back, {user?.username || "User"}!
            </h1>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Ready to sharpen your programming skills?
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Quick Stats */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div className="mac-panel" style={{ padding: "12px" }}>
                <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                  TOTAL SOLVED
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                  {stats.totalSolved}
                </div>
              </div>
              <div className="mac-panel" style={{ padding: "12px" }}>
                <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                  ACCEPTANCE
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                  {stats.acceptanceRate.toFixed(1)}%
                </div>
              </div>
              <div className="mac-panel" style={{ padding: "12px" }}>
                <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                  STREAK
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                  {stats.streak} days
                </div>
              </div>
              <div className="mac-panel" style={{ padding: "12px" }}>
                <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                  RANKING
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                  #{user?.ranking || "N/A"}
                </div>
              </div>
            </div>
          )}

          <div className="mac-divider"></div>

          {/* Main Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            {/* Practice Problems Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/problems")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                📚
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "13px" }}>
                Practice Problems
              </h3>
              <p style={{ fontSize: "11px", margin: "0 0 12px 0" }}>
                Browse and solve coding challenges
              </p>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#404040",
                }}
              >
                {problemCount} problems available
              </div>
            </div>

            {/* Leaderboard Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/leaderboard")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                🏆
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "13px" }}>
                Leaderboard
              </h3>
              <p style={{ fontSize: "11px", margin: "0 0 12px 0" }}>
                See top performers
              </p>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#404040",
                }}
              >
                Current rank: #{user?.ranking || "Unranked"}
              </div>
            </div>

            {/* My Submissions Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/submissions")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                📝
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "13px" }}>
                My Submissions
              </h3>
              <p style={{ fontSize: "11px", margin: "0 0 12px 0" }}>
                View your submission history
              </p>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#404040",
                }}
              >
                Track your progress
              </div>
            </div>

            {/* My Profile Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/users/${user?.username}`)}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                👤
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "13px" }}>
                My Profile
              </h3>
              <p style={{ fontSize: "11px", margin: "0 0 12px 0" }}>
                View your stats and achievements
              </p>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#404040",
                }}
              >
                @{user?.username}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Progress */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Recent Accepted Solutions */}
        <div className="mac-window">
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
              Recent Accepted Solutions
            </span>
          </div>

          <div style={{ padding: "16px" }}>
            {!recentACs || recentACs.length === 0 ? (
              <div
                className="mac-inset"
                style={{ padding: "20px", textAlign: "center" }}
              >
                <p style={{ margin: 0, fontSize: "11px", color: "#606060" }}>
                  No accepted submissions yet. Start solving problems!
                </p>
              </div>
            ) : (
              <div className="mac-inset" style={{ padding: "12px" }}>
                {recentACs.slice(0, 5).map((submission, idx) => (
                  <div
                    key={submission.id}
                    style={{
                      padding: "8px",
                      borderBottom:
                        idx < Math.min(4, recentACs.length - 1)
                          ? "1px solid #c0c0c0"
                          : "none",
                    }}
                  >
                    <Link
                      to={`/problems/${submission.problemSlug}`}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textDecoration: "underline",
                        color: "#000",
                      }}
                    >
                      {submission.problemTitle}
                    </Link>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#606060",
                        marginTop: "4px",
                      }}
                    >
                      {submission.language} • {submission.runtime}ms •{" "}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Link to={`/users/${user?.username}`}>
                <button className="mac-button" style={{ fontSize: "11px" }}>
                  VIEW ALL SUBMISSIONS
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Your Progress */}
        {stats && (
          <div className="mac-window">
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
                Your Progress
              </span>
            </div>

            <div style={{ padding: "16px" }}>
              {/* Difficulty Breakdown */}
              <div className="mac-panel" style={{ padding: "12px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "11px" }}>
                  Problems Solved by Difficulty
                </h4>
                <div style={{ fontSize: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Easy:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.easySolved}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Medium:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.mediumSolved}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Hard:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.hardSolved}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submissions Stats */}
              <div
                className="mac-panel"
                style={{ padding: "12px", marginTop: "12px" }}
              >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "11px" }}>
                  Submission Statistics
                </h4>
                <div style={{ fontSize: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Total Submissions:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.totalSubmissions}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Accepted:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.acceptedSubmissions}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Max Streak:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {stats.maxStreak} days
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <Link to={`/users/${user?.username}`}>
                  <button className="mac-button" style={{ fontSize: "11px" }}>
                    VIEW FULL PROFILE
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips Window */}
      <div className="mac-window" style={{ marginTop: "20px" }}>
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
            Quick Tips
          </span>
        </div>

        <div style={{ padding: "16px" }}>
          <div
            className="mac-inset"
            style={{
              padding: "12px",
              fontSize: "11px",
              lineHeight: "1.6",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>💡 Tip:</strong> Try to solve at least one problem every
              day to maintain your streak!
            </p>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>⚡ Pro Tip:</strong> Start with Easy problems to build
              confidence, then gradually move to Medium and Hard.
            </p>
            <p style={{ margin: 0 }}>
              <strong>🎯 Goal:</strong> Aim for a 50%+ acceptance rate by
              reviewing wrong submissions and learning from mistakes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
