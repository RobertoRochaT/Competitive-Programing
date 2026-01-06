import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import ProblemDescription from "../components/ProblemDescription";
import ConsoleOutput from "../components/ConsoleOutput";
import { fetchProblemBySlug } from "../../problems/services/problemService";
import type { Problem } from "../../problems/types/problem";
import {
  runAllTests,
  quickRun,
  type SupportedLanguage,
} from "../services/rojudgerService";
import {
  submissionService,
  type Submission,
} from "../../../services/submissionService";
import { useAuth } from "../../../contexts/AuthContext";

type TabType = "description" | "submissions" | "solutions";

const EditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [problemSubmissions, setProblemSubmissions] = useState<Submission[]>(
    [],
  );
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Language templates
  const languageTemplates: Record<SupportedLanguage, string> = {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
    // Write your solution here

}

// Read input from stdin
const input = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');
const nums = JSON.parse(input[0]);
const target = parseInt(input[1]);

// Call solution and print result
const result = solution(nums, target);
console.log(JSON.stringify(result));`,
    python: `def solution(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass

# Read input from stdin
import sys
import json

lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0])
target = int(lines[1])

# Call solution and print result
result = solution(nums, target)
print(json.dumps(result))`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your solution here

    }
};

int main() {
    Solution s;
    // Read input (simplified for demo)
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    vector<int> result = s.solution(nums, target);

    // Print result
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;

    return 0;
}`,

    java: `import java.util.*;

class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here

    }

    public static void main(String[] args) {
        Solution s = new Solution();
        // Read input (simplified for demo)
        int[] nums = {2, 7, 11, 15};
        int target = 9;

        int[] result = s.solution(nums, target);

        // Print result
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) System.out.print(",");
            System.out.print(result[i]);
        }
        System.out.println("]");
    }
}`,

    go: `package main

import (
	"encoding/json"
	"fmt"
)

func solution(nums []int, target int) []int {
	// Write your solution here
	return []int{}
}

func main() {
	// Read input (simplified for demo)
	nums := []int{2, 7, 11, 15}
	target := 9

	result := solution(nums, target)

	// Print result
	jsonResult, _ := json.Marshal(result)
	fmt.Println(string(jsonResult))
}`,
  };

  useEffect(() => {
    const loadProblem = async () => {
      if (!slug) {
        navigate("/problems");
        return;
      }

      try {
        setLoading(true);
        const data = await fetchProblemBySlug(slug);
        if (data) {
          setProblem(data);
          setCode(languageTemplates[language]);
        } else {
          navigate("/problems");
        }
      } catch (error) {
        console.error("Error loading problem:", error);
        navigate("/problems");
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [slug, navigate]);

  // Load submissions for this problem
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!slug || !isAuthenticated) return;

      try {
        setLoadingSubmissions(true);
        const subs = await submissionService.getProblemSubmissions(slug);
        setProblemSubmissions(subs);
      } catch (error) {
        console.error("Failed to load submissions:", error);
        setProblemSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    if (activeTab === "submissions") {
      loadSubmissions();
    }
  }, [slug, activeTab, isAuthenticated]);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage] || "");
  };

  // Utility function commented out - not currently used
  // const formatTestResult = (result: ExecutionResult): string[] => {
  //   const lines: string[] = [];
  //   lines.push("> Running test cases...");
  //   lines.push("");
  //   result.testResults.forEach((test, index) => {
  //     lines.push(`Test Case ${index + 1}:`);
  //     lines.push(`Input: ${test.input.substring(0, 100)}${test.input.length > 100 ? "..." : ""}`);
  //     lines.push(`Expected: ${test.expected}`);
  //     lines.push(`Your Output: ${test.actual || "(empty)"}`);
  //     if (test.error) {
  //       lines.push(`Error: ${test.error}`);
  //     }
  //     lines.push(`Status: ${test.passed ? "✓ PASSED" : "✗ FAILED"}`);
  //     lines.push("");
  //   });
  //   return lines;
  // };

  const handleRunCode = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput(["> Running code..."]);

    try {
      // Always run test cases if available (like LeetCode)
      if (problem?.testCases && problem.testCases.length > 0) {
        // Run first 3 test cases for quick feedback (like LeetCode "Run Code")
        const testCasesToRun = problem.testCases.slice(0, 3);
        const result = await runAllTests(language, code, testCasesToRun);

        const lines: string[] = [];
        lines.push("> Running sample test cases...");
        lines.push("");

        // Show detailed results for each test
        result.testResults.forEach((test, index) => {
          lines.push(`Test Case ${index + 1}:`);
          lines.push(`Input: ${test.input}`);
          lines.push(`Expected: ${test.expected}`);
          lines.push(`Your Output: ${test.actual || "(empty)"}`);
          lines.push("");

          if (test.error) {
            lines.push(`❌ ERROR: ${test.error}`);
          } else if (test.passed) {
            lines.push(
              `✓ PASSED ${test.time ? `(${(test.time * 1000).toFixed(0)}ms)` : ""}`,
            );
          } else {
            lines.push(`✗ FAILED - Output mismatch`);
          }
          lines.push("");
        });

        lines.push("═══════════════════════════════");

        if (result.success) {
          lines.push(
            `✓ All sample tests passed (${result.passedTests}/${result.totalTests})`,
          );
          lines.push("");
          lines.push("Ready to submit? Click 'Submit' to run all test cases.");
        } else {
          lines.push(
            `✗ ${result.failedTests}/${result.totalTests} tests failed`,
          );
          lines.push("");
          lines.push("Fix the issues and try again.");
        }

        setOutput(lines);
        setHasError(!result.success);
      } else {
        // Fallback: run code with example input if no test cases
        setOutput(["> Running code with example input..."]);
        const exampleInput = "[2,7,11,15]\n9";
        const result = await quickRun(language, code, exampleInput);

        const lines: string[] = [];
        lines.push("> Execution completed");
        lines.push("");

        if (result.compile_output) {
          lines.push("❌ Compilation Error:");
          lines.push(result.compile_output);
          setHasError(true);
        } else if (result.status === "error") {
          lines.push("❌ Runtime Error:");
          lines.push(result.message || result.stderr || "Unknown error");
          setHasError(true);
        } else if (result.status === "timeout") {
          lines.push("❌ Time Limit Exceeded");
          setHasError(true);
        } else {
          lines.push("Output:");
          lines.push(result.stdout || "(empty)");

          if (result.stderr) {
            lines.push("");
            lines.push("Errors:");
            lines.push(result.stderr);
          }

          lines.push("");
          lines.push(`Exit Code: ${result.exit_code}`);
          lines.push(`Time: ${result.time.toFixed(3)}s`);
          lines.push(`Memory: ${(result.memory / 1024).toFixed(2)} MB`);
        }

        setOutput(lines);
      }
    } catch (error) {
      setHasError(true);
      setOutput([
        "❌ Execution Error:",
        "",
        error instanceof Error ? error.message : "Unknown error occurred",
        "",
        "Please check your code and try again.",
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput(["> Submitting solution..."]);

    try {
      if (!problem?.testCases || problem.testCases.length === 0) {
        setOutput([
          "❌ No test cases available",
          "",
          "Cannot submit without test cases.",
          "Please use 'Run Code' to test your solution.",
        ]);
        setHasError(true);
        setIsRunning(false);
        return;
      }

      const result = await runAllTests(language, code, problem.testCases);

      const lines: string[] = [];
      lines.push("> Submitting solution...");
      lines.push("");
      lines.push(`Running ${result.totalTests} test cases...`);
      lines.push("");

      // Show brief summary of each test
      result.testResults.forEach((test, index) => {
        if (test.passed) {
          lines.push(
            `Test Case ${index + 1}: ✓ PASSED ${test.time ? `(${(test.time * 1000).toFixed(0)}ms)` : ""}`,
          );
        } else {
          lines.push(`Test Case ${index + 1}: ✗ FAILED`);
          if (test.error) {
            lines.push(`  Error: ${test.error.split("\n")[0]}`);
          }
        }
      });

      lines.push("");
      lines.push("═══════════════════════════════");

      if (result.success) {
        lines.push("✓ ACCEPTED");
        lines.push("═══════════════════════════════");
        lines.push(`All ${result.totalTests} test cases passed!`);
        lines.push(`Runtime: ${result.totalTime.toFixed(3)}s`);
        if (result.averageMemory > 0) {
          lines.push(`Memory: ${(result.averageMemory / 1024).toFixed(2)} MB`);
        }
        lines.push("");
        lines.push("🎉 Congratulations! Your solution is correct.");

        // Save submission to backend
        if (isAuthenticated && problem) {
          try {
            await submissionService.createSubmission({
              problemId: problem.id,
              problemSlug: problem.slug,
              problemTitle: problem.title,
              language: language,
              code: code,
              status: "Accepted",
              runtime: Math.round(result.totalTime * 1000),
              memory: Math.round(result.averageMemory / 1024),
              passedTests: result.passedTests,
              totalTests: result.totalTests,
              testResults: JSON.stringify(result.testResults),
            });
            lines.push("");
            lines.push("✓ Submission saved successfully!");
            // Reload submissions if on submissions tab
            if (activeTab === "submissions") {
              const subs = await submissionService.getProblemSubmissions(
                problem.slug,
              );
              setProblemSubmissions(subs);
            }
          } catch (error) {
            console.error("Failed to save submission:", error);
            lines.push("");
            lines.push("⚠️ Warning: Failed to save submission to history");
          }
        }
      } else {
        lines.push("✗ WRONG ANSWER");
        lines.push("═══════════════════════════════");
        lines.push(
          `Failed ${result.failedTests} of ${result.totalTests} test cases`,
        );
        lines.push("");
        lines.push("Please review the failed test cases above.");
        setHasError(true);

        // Save failed submission to backend
        if (isAuthenticated && problem) {
          try {
            await submissionService.createSubmission({
              problemId: problem.id,
              problemSlug: problem.slug,
              problemTitle: problem.title,
              language: language,
              code: code,
              status: "Wrong Answer",
              runtime: Math.round(result.totalTime * 1000),
              memory: Math.round(result.averageMemory / 1024),
              passedTests: result.passedTests,
              totalTests: result.totalTests,
              testResults: JSON.stringify(result.testResults),
            });
          } catch (error) {
            console.error("Failed to save submission:", error);
          }
        }
      }

      setOutput(lines);
    } catch (error) {
      setHasError(true);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setOutput([
        "❌ Submission Error:",
        "",
        errorMessage,
        "",
        "Please try again.",
      ]);

      // Save error submission to backend
      if (isAuthenticated && problem) {
        try {
          let status:
            | "Runtime Error"
            | "Compilation Error"
            | "Time Limit Exceeded" = "Runtime Error";

          if (
            errorMessage.toLowerCase().includes("compilation") ||
            errorMessage.toLowerCase().includes("compile")
          ) {
            status = "Compilation Error";
          } else if (
            errorMessage.toLowerCase().includes("timeout") ||
            errorMessage.toLowerCase().includes("time limit")
          ) {
            status = "Time Limit Exceeded";
          }

          await submissionService.createSubmission({
            problemId: problem.id,
            problemSlug: problem.slug,
            problemTitle: problem.title,
            language: language,
            code: code,
            status: status,
            runtime: 0,
            memory: 0,
            passedTests: 0,
            totalTests: problem.testCases?.length || 0,
            errorMessage: errorMessage,
          });
        } catch (saveError) {
          console.error("Failed to save error submission:", saveError);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(languageTemplates[language] || "");
    setOutput([]);
    setHasError(false);
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
          <p style={{ margin: 0, fontWeight: "bold" }}>Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Menu Bar - System 7 Style */}
      <div
        style={{
          background: "#DDDDDD",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #000",
          boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080",
          fontFamily: '"Chicago", "Geneva", system-ui, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="mac-button"
            onClick={() => navigate("/problems")}
            style={{
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            ◄ Problems
          </button>
          <div
            style={{
              width: "2px",
              height: "20px",
              background: "#000",
            }}
          ></div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            Problem {problem.id}: {problem.title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Language:
            </span>
            <select
              className="mac-select"
              value={language}
              onChange={(e) =>
                handleLanguageChange(e.target.value as SupportedLanguage)
              }
              style={{ fontSize: "11px", padding: "2px 20px 2px 6px" }}
              disabled={isRunning}
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
            </select>
          </div>

          <button
            className="mac-button"
            onClick={handleReset}
            style={{ padding: "4px 12px", fontSize: "11px" }}
            disabled={isRunning}
          >
            Reset Code
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          background: "#C0C0C0",
        }}
      >
        {/* Left Panel - Problem Description */}
        <div
          style={{
            width: "40%",
            borderRight: "3px solid #000",
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "2px",
              padding: "8px 6px 6px 6px",
              borderBottom: "2px solid #000",
              background: "#DDDDDD",
              boxShadow: "inset 1px 1px 0 #FFFFFF",
            }}
          >
            <button
              className={
                activeTab === "description"
                  ? "mac-button-primary"
                  : "mac-button"
              }
              onClick={() => setActiveTab("description")}
              style={{
                padding: "5px 14px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              📄 Description
            </button>
            <button
              className={
                activeTab === "submissions"
                  ? "mac-button-primary"
                  : "mac-button"
              }
              onClick={() => setActiveTab("submissions")}
              style={{
                padding: "5px 14px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              📋 Submissions
            </button>
            <button
              className={
                activeTab === "solutions" ? "mac-button-primary" : "mac-button"
              }
              onClick={() => setActiveTab("solutions")}
              style={{
                padding: "5px 14px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              💡 Solutions
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeTab === "description" && (
              <ProblemDescription problem={problem} />
            )}
            {activeTab === "submissions" && (
              <div style={{ padding: "16px", overflow: "auto" }}>
                {!isAuthenticated ? (
                  <div
                    className="mac-inset"
                    style={{
                      padding: "40px",
                      marginTop: "40px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      🔒
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                      Login Required
                    </p>
                    <p style={{ fontSize: "11px", margin: "8px 0 0 0" }}>
                      Please login to view submissions
                    </p>
                  </div>
                ) : loadingSubmissions ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      className="mac-loading"
                      style={{ margin: "0 auto" }}
                    ></div>
                    <p style={{ marginTop: "16px", fontSize: "11px" }}>
                      Loading submissions...
                    </p>
                  </div>
                ) : problemSubmissions.length === 0 ? (
                  <div
                    className="mac-inset"
                    style={{
                      padding: "40px",
                      marginTop: "40px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      📋
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                      No submissions yet
                    </p>
                    <p style={{ fontSize: "11px", margin: "8px 0 0 0" }}>
                      Submit your solution to see it here
                    </p>
                  </div>
                ) : (
                  <div className="mac-inset" style={{ padding: "8px" }}>
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "8px",
                        background: "#DDDDDD",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Your Submissions ({problemSubmissions.length})
                    </div>
                    {problemSubmissions.map((sub, idx) => {
                      const statusColor = sub.status
                        .toLowerCase()
                        .includes("accepted")
                        ? "#00AA00"
                        : sub.status.toLowerCase().includes("wrong")
                          ? "#CC0000"
                          : sub.status.toLowerCase().includes("error")
                            ? "#CC6600"
                            : "#000000";
                      const statusIcon = sub.status
                        .toLowerCase()
                        .includes("accepted")
                        ? "✓"
                        : sub.status.toLowerCase().includes("wrong")
                          ? "✗"
                          : sub.status.toLowerCase().includes("error")
                            ? "⚠"
                            : "○";

                      return (
                        <div
                          key={sub.id}
                          style={{
                            padding: "10px",
                            borderBottom:
                              idx < problemSubmissions.length - 1
                                ? "1px solid #C0C0C0"
                                : "none",
                            background: idx % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "6px",
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
                                  fontWeight: "bold",
                                  fontSize: "10px",
                                  color: "#606060",
                                }}
                              >
                                #{sub.id}
                              </span>
                              <span
                                style={{
                                  color: statusColor,
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                }}
                              >
                                {statusIcon} {sub.status}
                              </span>
                            </div>
                            <div style={{ fontSize: "10px", color: "#606060" }}>
                              {new Date(sub.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              fontSize: "10px",
                              color: "#404040",
                              marginBottom: "4px",
                            }}
                          >
                            <span>
                              <strong>Language:</strong> {sub.language}
                            </span>
                            {sub.runtime > 0 && (
                              <span>
                                <strong>Runtime:</strong> {sub.runtime}ms
                              </span>
                            )}
                            {sub.memory > 0 && (
                              <span>
                                <strong>Memory:</strong>{" "}
                                {(sub.memory / 1024).toFixed(1)}MB
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "10px", color: "#606060" }}>
                            <strong>Tests:</strong> {sub.passedTests}/
                            {sub.totalTests} passed
                          </div>
                          {sub.errorMessage && (
                            <div
                              style={{
                                marginTop: "6px",
                                padding: "6px",
                                background: "#FFE0E0",
                                border: "1px solid #CC0000",
                                fontSize: "10px",
                                fontFamily: "monospace",
                              }}
                            >
                              {sub.errorMessage}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === "solutions" && (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <div
                  className="mac-inset"
                  style={{ padding: "40px", marginTop: "40px" }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    💡
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                    Solutions locked
                  </p>
                  <p style={{ fontSize: "11px", margin: "8px 0 0 0" }}>
                    Solve the problem first to unlock solutions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editor and Console */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Code Editor */}
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div
              className="mac-window"
              style={{
                height: "100%",
                border: "none",
                boxShadow: "none",
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  background: "#000000",
                  color: "#FFFFFF",
                  padding: "4px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderBottom: "2px solid #000",
                  fontFamily: '"Chicago", "Geneva", system-ui, sans-serif',
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    background: "#FFFFFF",
                    border: "2px solid #FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "2px",
                      background: "#000000",
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                  }}
                >
                  CodeWarrior IDE -{" "}
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </span>
                <span
                  style={{ fontSize: "10px", marginLeft: "auto", opacity: 0.7 }}
                >
                  Powered by ROJUDGER
                </span>
              </div>
              <div style={{ height: "calc(100% - 26px)" }}>
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={setCode}
                />
              </div>
            </div>
          </div>

          {/* Console Output */}
          <div
            style={{
              height: "250px",
              borderTop: "3px solid #000",
            }}
          >
            <ConsoleOutput
              output={output}
              isRunning={isRunning}
              hasError={hasError}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              background: "#DDDDDD",
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "3px solid #000",
              boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080",
              fontFamily: '"Geneva", "Chicago", system-ui, sans-serif',
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="mac-button"
                onClick={handleRunCode}
                disabled={isRunning}
                style={{
                  padding: "6px 18px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "100px",
                }}
              >
                {isRunning ? "⏳ Running..." : "▶ Run Code"}
              </button>
              <button
                className="mac-button-primary"
                onClick={handleSubmit}
                disabled={isRunning}
                style={{
                  padding: "6px 18px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "100px",
                }}
              >
                {isRunning ? "⏳ Submitting..." : "✓ Submit"}
              </button>
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#000000",
                fontWeight: "bold",
                fontFamily: '"Chicago", "Geneva", monospace',
                letterSpacing: "0.5px",
              }}
            >
              © 1984-2024 Classic Computing Systems™
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
