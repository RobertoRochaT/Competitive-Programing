import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import ProblemDescription from "../components/ProblemDescription";
import ConsoleOutput from "../components/ConsoleOutput";
import { fetchProblemBySlug } from "../../problems/services/problemService";
import type { Problem } from "../../problems/types/problem";

type TabType = "description" | "submissions" | "solutions";

const EditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Language templates
  const languageTemplates: Record<string, string> = {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here

}`,
    python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here

    }
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here

    }
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage] || "");
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setHasError(false);
    setOutput([]);

    // Simulate code execution
    setTimeout(() => {
      setOutput([
        "> Running test cases...",
        "",
        "Test Case 1:",
        "Input: nums = [2,7,11,15], target = 9",
        "Expected: [0,1]",
        "Your Output: [0,1]",
        "✓ PASSED",
        "",
        "Test Case 2:",
        "Input: nums = [3,2,4], target = 6",
        "Expected: [1,2]",
        "Your Output: [1,2]",
        "✓ PASSED",
        "",
        "All test cases passed!",
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setHasError(false);
    setOutput([]);

    // Simulate submission
    setTimeout(() => {
      setOutput([
        "> Submitting solution...",
        "",
        "Running 15 test cases...",
        "",
        "Test Case 1: ✓ PASSED (12ms)",
        "Test Case 2: ✓ PASSED (8ms)",
        "Test Case 3: ✓ PASSED (10ms)",
        "Test Case 4: ✓ PASSED (15ms)",
        "Test Case 5: ✓ PASSED (9ms)",
        "...",
        "",
        "═══════════════════════════════",
        "✓ ACCEPTED",
        "═══════════════════════════════",
        "Runtime: 11ms (Beats 85.2%)",
        "Memory: 42.1MB (Beats 78.5%)",
      ]);
      setIsRunning(false);
    }, 2000);
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
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{ fontSize: "11px", padding: "2px 20px 2px 6px" }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            className="mac-button"
            onClick={handleReset}
            style={{ padding: "4px 12px", fontSize: "11px" }}
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
              <div style={{ padding: "16px", textAlign: "center" }}>
                <div
                  className="mac-inset"
                  style={{ padding: "40px", marginTop: "40px" }}
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
              © 1984-1997 Classic Computing Systems™
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
