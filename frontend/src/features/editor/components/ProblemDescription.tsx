import React from "react";
import type { Problem } from "../../problems/types/problem";

interface ProblemDescriptionProps {
  problem: Problem;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  const getDifficultyClass = (difficulty: string): string => {
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

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      {/* Problem Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "2px solid #000",
          background: "#c0c0c0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            {problem.id}. {problem.title}
          </h2>
          <div
            className={`mac-badge ${getDifficultyClass(problem.difficulty)}`}
            style={{ fontSize: "10px" }}
          >
            {problem.difficulty}
          </div>
        </div>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {problem.tags.map((tag) => (
              <span key={tag} className="mac-badge" style={{ fontSize: "9px" }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Problem Content */}
      <div style={{ padding: "16px" }}>
        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <div
            className="mac-inset"
            style={{
              padding: "12px",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
            dangerouslySetInnerHTML={{
              __html:
                problem.description ||
                "Write a function that solves the given problem.",
            }}
          />
        </div>

        {/* Acceptance Rate */}
        <div className="mac-panel" style={{ padding: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>ACCEPTANCE RATE:</span>
            <div
              className="mac-inset"
              style={{
                padding: "4px 12px",
                background:
                  problem.acceptanceRate >= 50 ? "#00ff00" : "#ffff00",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {problem.acceptanceRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;
