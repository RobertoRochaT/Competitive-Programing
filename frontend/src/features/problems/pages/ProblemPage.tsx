import React from "react";
import { useNavigate } from "react-router-dom";
import { useProblems } from "../hooks/useProblems";
import type { Problem, Difficulty } from "../types/problem";

const ProblemListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    problems,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
  } = useProblems();

  const getDifficultyClass = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case "Easy":
        return "mac-green";
      case "Medium":
        return "mac-yellow";
      case "Hard":
        return "mac-red";
      default:
        return "";
    }
  };

  const getAcceptanceClass = (rate: number): string => {
    if (rate >= 50) return "mac-green";
    if (rate >= 30) return "mac-yellow";
    return "mac-red";
  };

  const handleProblemClick = (problem: Problem) => {
    navigate(`/problems/${problem.slug}`);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div className="mac-loading"></div>
        <div className="mac-panel" style={{ padding: "12px 24px" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#000",
                border: "1px solid #000",
              }}
            ></div>
            <span style={{ fontWeight: "bold", fontSize: "12px" }}>Error</span>
          </div>
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>⚠</p>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Error loading problems
            </p>
            <p style={{ fontSize: "11px", margin: 0 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const solvedCount = problems.filter((p) => p.solved).length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Main Window */}
      <div className="mac-window">
        {/* Title Bar */}
        <div className="mac-title-bar">
          <div
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
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
            Problems Library
          </span>
        </div>

        {/* Window Content */}
        <div style={{ padding: "16px" }}>
          {/* Header */}
          <div style={{ marginBottom: "16px" }}>
            <h1 style={{ marginBottom: "8px" }}>Problem Set</h1>
            <p style={{ fontSize: "12px", margin: "0 0 12px 0" }}>
              Choose a problem to test your programming skills
            </p>

            {/* Stats Panel */}
            <div
              className="mac-panel"
              style={{
                display: "flex",
                gap: "16px",
                padding: "8px 12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  LOADED:
                </span>
                <div
                  className="mac-inset"
                  style={{ padding: "4px 12px", minWidth: "40px" }}
                >
                  <span style={{ fontWeight: "bold" }}>{problems.length}</span>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  TOTAL:
                </span>
                <div
                  className="mac-inset"
                  style={{ padding: "4px 12px", minWidth: "40px" }}
                >
                  <span style={{ fontWeight: "bold" }}>{total}</span>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  SOLVED:
                </span>
                <div
                  className="mac-inset mac-green"
                  style={{ padding: "4px 12px", minWidth: "40px" }}
                >
                  <span style={{ fontWeight: "bold" }}>{solvedCount}</span>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  REMAINING:
                </span>
                <div
                  className="mac-inset"
                  style={{ padding: "4px 12px", minWidth: "40px" }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {problems.length - solvedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Problems Table */}
          <div className="mac-inset" style={{ padding: 0 }}>
            <table className="mac-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>✓</th>
                  <th style={{ width: "60px" }}>#</th>
                  <th>TITLE</th>
                  <th style={{ width: "100px" }}>DIFFICULTY</th>
                  <th style={{ width: "100px" }}>ACCEPTANCE</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => handleProblemClick(problem)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Status Column */}
                    <td style={{ textAlign: "center" }}>
                      {problem.solved ? (
                        <div
                          style={{
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            background: "#00ff00",
                            border: "2px solid #000",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "-4px",
                              left: "1px",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            background: "#fff",
                            border: "2px solid #000",
                            boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.2)",
                          }}
                        ></div>
                      )}
                    </td>

                    {/* ID Column */}
                    <td style={{ fontWeight: "bold", textAlign: "center" }}>
                      {problem.id}
                    </td>

                    {/* Title Column */}
                    <td>
                      <div>
                        <div
                          style={{ fontWeight: "bold", marginBottom: "4px" }}
                        >
                          {problem.title}
                        </div>
                        {problem.tags && problem.tags.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            {problem.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="mac-badge">
                                {tag}
                              </span>
                            ))}
                            {problem.tags.length > 3 && (
                              <span
                                className="mac-badge"
                                style={{ background: "#d0d0d0" }}
                              >
                                +{problem.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Difficulty Column */}
                    <td>
                      <div
                        className={`mac-badge ${getDifficultyClass(problem.difficulty)}`}
                        style={{
                          display: "inline-block",
                          minWidth: "70px",
                          textAlign: "center",
                        }}
                      >
                        {problem.difficulty}
                      </div>
                    </td>

                    {/* Acceptance Column */}
                    <td>
                      <div
                        className={`mac-badge ${getAcceptanceClass(problem.acceptanceRate)}`}
                        style={{
                          display: "inline-block",
                          minWidth: "60px",
                          textAlign: "center",
                        }}
                      >
                        {problem.acceptanceRate.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div
              className="mac-panel"
              style={{
                marginTop: "16px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {/* Previous Button */}
              <button
                className="mac-button"
                onClick={previousPage}
                disabled={currentPage === 1}
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "60px",
                }}
              >
                ◀ Prev
              </button>

              {/* Page Numbers */}
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                {/* First Page */}
                {currentPage > 3 && (
                  <>
                    <button
                      className="mac-button"
                      onClick={() => goToPage(1)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        minWidth: "32px",
                      }}
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span style={{ fontSize: "11px", padding: "0 4px" }}>
                        ...
                      </span>
                    )}
                  </>
                )}

                {/* Page range around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      (page === currentPage - 2 && currentPage <= 3) ||
                      (page === currentPage + 2 &&
                        currentPage >= totalPages - 2),
                  )
                  .map((page) => (
                    <button
                      key={page}
                      className="mac-button"
                      onClick={() => goToPage(page)}
                      disabled={page === currentPage}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: page === currentPage ? "bold" : "normal",
                        minWidth: "32px",
                        background:
                          page === currentPage ? "#000" : "transparent",
                        color: page === currentPage ? "#fff" : "#000",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                {/* Last Page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span style={{ fontSize: "11px", padding: "0 4px" }}>
                        ...
                      </span>
                    )}
                    <button
                      className="mac-button"
                      onClick={() => goToPage(totalPages)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        minWidth: "32px",
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                className="mac-button"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "60px",
                }}
              >
                Next ▶
              </button>
            </div>
          )}

          {/* Page Info */}
          {!loading && totalPages > 0 && (
            <div
              style={{
                marginTop: "8px",
                textAlign: "center",
                fontSize: "11px",
              }}
            >
              Page {currentPage} of {totalPages}
            </div>
          )}

          {/* Empty State */}
          {problems.length === 0 && !loading && (
            <div
              className="mac-panel"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                No problems available.
              </p>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: "16px",
              padding: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "11px" }}>
              Showing {(currentPage - 1) * 100 + 1}-
              {Math.min(currentPage * 100, total)} of {total} problem
              {total !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: "11px" }}>
              © 1984-2024 Classic Computing
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div
        className="mac-window"
        style={{ marginTop: "16px", maxWidth: "600px" }}
      >
        <div className="mac-title-bar">
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#000",
              border: "1px solid #000",
            }}
          ></div>
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>
            Instructions
          </span>
        </div>
        <div style={{ padding: "12px" }}>
          <p style={{ fontSize: "12px", marginBottom: "8px" }}>
            <strong>How to use:</strong>
          </p>
          <ul style={{ fontSize: "11px", paddingLeft: "20px", margin: 0 }}>
            <li>Click on any problem row to open the editor</li>
            <li>Green checkmarks indicate solved problems</li>
            <li>
              Difficulty levels: Easy (Green), Medium (Yellow), Hard (Red)
            </li>
            <li>Acceptance rate shows success percentage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage;
