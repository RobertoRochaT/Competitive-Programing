import React from "react";
import type { Problem, Difficulty } from "../types/problem";

interface ProblemRowProps {
  problem: Problem;
  onClick: (problem: Problem) => void;
}

const ProblemRow: React.FC<ProblemRowProps> = ({ problem, onClick }) => {
  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 dark:text-green-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getAcceptanceColor = (rate: number): string => {
    if (rate >= 50) return "text-green-600 dark:text-green-400";
    if (rate >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <tr
      onClick={() => onClick(problem)}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    >
      {/* Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {problem.solved ? (
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
          )}
        </div>
      </td>

      {/* Title Column */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {problem.id}. {problem.title}
          </div>
        </div>
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {problem.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
                +{problem.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </td>

      {/* Difficulty Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`text-sm font-medium ${getDifficultyColor(
            problem.difficulty,
          )}`}
        >
          {problem.difficulty}
        </span>
      </td>

      {/* Acceptance Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`text-sm font-medium ${getAcceptanceColor(
            problem.acceptanceRate,
          )}`}
        >
          {problem.acceptanceRate.toFixed(1)}%
        </span>
      </td>
    </tr>
  );
};

export default ProblemRow;
