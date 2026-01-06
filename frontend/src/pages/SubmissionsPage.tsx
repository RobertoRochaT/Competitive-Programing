import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  submissionService,
  type Submission,
} from "../services/submissionService";

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        const data = await submissionService.getMySubmissions(100);
        setSubmissions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("accepted")) return "#00AA00";
    if (statusLower.includes("wrong")) return "#CC0000";
    if (statusLower.includes("error")) return "#CC6600";
    if (statusLower.includes("timeout") || statusLower.includes("limit"))
      return "#9900CC";
    return "#000000";
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("accepted")) return "✓";
    if (statusLower.includes("wrong")) return "✗";
    if (statusLower.includes("error")) return "⚠";
    if (statusLower.includes("timeout") || statusLower.includes("limit"))
      return "⏱";
    return "○";
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true;
    return s.status.toLowerCase().includes(filter.toLowerCase());
  });

  if (isLoading) {
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
        <div
          className="mac-window"
          style={{ maxWidth: "400px", width: "100%" }}
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
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div className="mac-loading" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", fontSize: "12px" }}>
              Loading submissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
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
              Submission History
            </span>
          </div>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                  My Submissions
                </h2>
                <p style={{ margin: 0, fontSize: "11px", color: "#404040" }}>
                  {filteredSubmissions.length} submission
                  {filteredSubmissions.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button className="mac-button">← Back to Home</button>
              </Link>
            </div>

            <div className="mac-divider" style={{ margin: "16px 0" }}></div>

            {/* Filters */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Filter by Status:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className={
                    filter === "all" ? "mac-button-primary" : "mac-button"
                  }
                  onClick={() => setFilter("all")}
                  style={{ fontSize: "11px" }}
                >
                  All ({submissions.length})
                </button>
                <button
                  className={
                    filter === "accepted" ? "mac-button-primary" : "mac-button"
                  }
                  onClick={() => setFilter("accepted")}
                  style={{ fontSize: "11px" }}
                >
                  Accepted (
                  {
                    submissions.filter((s) =>
                      s.status.toLowerCase().includes("accepted"),
                    ).length
                  }
                  )
                </button>
                <button
                  className={
                    filter === "wrong" ? "mac-button-primary" : "mac-button"
                  }
                  onClick={() => setFilter("wrong")}
                  style={{ fontSize: "11px" }}
                >
                  Wrong Answer (
                  {
                    submissions.filter((s) =>
                      s.status.toLowerCase().includes("wrong"),
                    ).length
                  }
                  )
                </button>
                <button
                  className={
                    filter === "error" ? "mac-button-primary" : "mac-button"
                  }
                  onClick={() => setFilter("error")}
                  style={{ fontSize: "11px" }}
                >
                  Error (
                  {
                    submissions.filter((s) =>
                      s.status.toLowerCase().includes("error"),
                    ).length
                  }
                  )
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mac-window" style={{ marginBottom: "20px" }}>
            <div className="mac-title-bar">
              <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                Error
              </span>
            </div>
            <div
              className="mac-panel"
              style={{ padding: "16px", margin: "12px" }}
            >
              <p style={{ margin: 0, color: "#CC0000" }}>⚠️ {error}</p>
            </div>
          </div>
        )}

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="mac-window">
            <div className="mac-title-bar">
              <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                No Submissions
              </span>
            </div>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>📝</p>
              <p style={{ margin: 0, fontSize: "11px" }}>
                {filter === "all"
                  ? "You haven't submitted any solutions yet."
                  : `No ${filter} submissions found.`}
              </p>
              {filter === "all" && (
                <Link to="/problems" style={{ textDecoration: "none" }}>
                  <button
                    className="mac-button-primary"
                    style={{ marginTop: "16px" }}
                  >
                    Browse Problems
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mac-window">
            <div className="mac-title-bar">
              <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                Submission Results
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              <div className="mac-inset" style={{ padding: "0" }}>
                {/* Table Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 100px 120px 80px 80px 140px",
                    padding: "8px 12px",
                    background: "#DDDDDD",
                    borderBottom: "1px solid #000",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  <div>ID</div>
                  <div>Problem</div>
                  <div>Language</div>
                  <div>Status</div>
                  <div>Runtime</div>
                  <div>Memory</div>
                  <div>Submitted</div>
                </div>

                {/* Table Rows */}
                {filteredSubmissions.map((submission, idx) => (
                  <div
                    key={submission.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "50px 1fr 100px 120px 80px 80px 140px",
                      padding: "10px 12px",
                      borderBottom:
                        idx < filteredSubmissions.length - 1
                          ? "1px solid #C0C0C0"
                          : "none",
                      fontSize: "11px",
                      background: idx % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>#{submission.id}</div>
                    <div>
                      <Link
                        to={`/problems/${submission.problemSlug}`}
                        style={{
                          color: "#0000EE",
                          textDecoration: "underline",
                          fontWeight: "bold",
                        }}
                      >
                        {submission.problemTitle}
                      </Link>
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      {submission.language}
                    </div>
                    <div
                      style={{
                        color: getStatusColor(submission.status),
                        fontWeight: "bold",
                      }}
                    >
                      {getStatusIcon(submission.status)} {submission.status}
                    </div>
                    <div>
                      {submission.runtime > 0 ? `${submission.runtime}ms` : "-"}
                    </div>
                    <div>
                      {submission.memory > 0
                        ? `${(submission.memory / 1024).toFixed(1)}MB`
                        : "-"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#606060" }}>
                      {new Date(submission.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div
                className="mac-panel"
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  fontSize: "11px",
                }}
              >
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>Total:</span>{" "}
                    {filteredSubmissions.length}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#00AA00" }}>
                      Accepted:
                    </span>{" "}
                    {
                      filteredSubmissions.filter((s) =>
                        s.status.toLowerCase().includes("accepted"),
                      ).length
                    }
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#CC0000" }}>
                      Wrong Answer:
                    </span>{" "}
                    {
                      filteredSubmissions.filter((s) =>
                        s.status.toLowerCase().includes("wrong"),
                      ).length
                    }
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#CC6600" }}>
                      Errors:
                    </span>{" "}
                    {
                      filteredSubmissions.filter((s) =>
                        s.status.toLowerCase().includes("error"),
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
