import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { userService } from "../../../services/userService";
import type { UserProfile } from "../../../types/user";

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        const data = await userService.getUserProfile(username);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

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
              Loading...
            </span>
          </div>
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div className="mac-loading" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", fontSize: "12px" }}>
              Loading user profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
              Error
            </span>
          </div>
          <div
            className="mac-panel"
            style={{
              margin: "16px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              ⚠️
            </div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>
              {error || "Profile not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats, recentACs = [], languages = {} } = profile;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header Window */}
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
            User Profile - {user.username}
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#000",
                border: "2px solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
                {user.username}
              </h1>
              {user.fullName && (
                <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                  {user.fullName}
                </p>
              )}
              {user.bio && (
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "11px",
                    color: "#404040",
                  }}
                >
                  {user.bio}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "11px",
                  color: "#606060",
                }}
              >
                {user.country && <span>📍 {user.country}</span>}
                {user.school && <span>🎓 {user.school}</span>}
                <span>🏆 Rank #{user.ranking || "Unranked"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Total Solved */}
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
              Total Solved
            </span>
          </div>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
              {stats.totalSolved}
            </div>
            <div className="mac-divider" style={{ margin: "12px 0" }}></div>
            <div style={{ fontSize: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span>Easy:</span>
                <span style={{ fontWeight: "bold" }}>{stats.easySolved}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span>Medium:</span>
                <span style={{ fontWeight: "bold" }}>{stats.mediumSolved}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Hard:</span>
                <span style={{ fontWeight: "bold" }}>{stats.hardSolved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Rate */}
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
              Acceptance Rate
            </span>
          </div>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
              {stats.acceptanceRate.toFixed(1)}%
            </div>
            <div className="mac-divider" style={{ margin: "12px 0" }}></div>
            <div style={{ fontSize: "10px" }}>
              <div style={{ marginBottom: "4px" }}>
                Accepted: {stats.acceptedSubmissions}
              </div>
              <div>Total: {stats.totalSubmissions}</div>
            </div>
          </div>
        </div>

        {/* Current Streak */}
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
              Streak
            </span>
          </div>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
              {stats.streak}
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>days</div>
            <div className="mac-divider" style={{ margin: "12px 0" }}></div>
            <div style={{ fontSize: "10px" }}>Max: {stats.maxStreak} days</div>
          </div>
        </div>

        {/* Last Solved */}
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
              Last Solved
            </span>
          </div>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>
              {stats.lastSolvedAt
                ? new Date(stats.lastSolvedAt).toLocaleDateString()
                : "Never"}
            </div>
            <div style={{ fontSize: "10px", marginTop: "8px" }}>
              {stats.lastSolvedAt
                ? new Date(stats.lastSolvedAt).toLocaleTimeString()
                : "No submissions yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Languages */}
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
                style={{
                  padding: "24px",
                  textAlign: "center",
                }}
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
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#606060",
                  }}
                >
                  No accepted submissions yet
                </p>
              </div>
            ) : (
              <div className="mac-inset" style={{ padding: "8px" }}>
                {recentACs.slice(0, 10).map((submission, idx) => (
                  <div
                    key={submission.id}
                    style={{
                      padding: "8px",
                      borderBottom:
                        idx < Math.min(9, recentACs.length - 1)
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
                      {submission.memory}KB
                    </div>
                    <div style={{ fontSize: "9px", color: "#808080" }}>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Language Statistics */}
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
              Languages Used
            </span>
          </div>

          <div style={{ padding: "16px" }}>
            {!languages || Object.keys(languages).length === 0 ? (
              <div
                className="mac-inset"
                style={{
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "8px",
                    filter: "grayscale(1)",
                  }}
                >
                  💻
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#606060",
                  }}
                >
                  No submissions yet
                </p>
              </div>
            ) : (
              <div className="mac-inset" style={{ padding: "12px" }}>
                {Object.entries(languages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([language, count]) => {
                    const total = Object.values(languages).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={language} style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>{language}</span>
                          <span>
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div
                          style={{
                            background: "#fff",
                            border: "2px solid #000",
                            height: "12px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              background: "#000",
                              height: "100%",
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
