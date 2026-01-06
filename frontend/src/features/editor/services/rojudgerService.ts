/**
 * ROJUDGER Service
 *
 * Service for executing code submissions using the ROJUDGER API.
 * Handles code execution, polling for results, and test case evaluation.
 */

const ROJUDGER_API_URL =
  import.meta.env.VITE_ROJUDGER_API_URL || "http://localhost:8080/api/v1";

// Language ID mapping (ROJUDGER uses Judge0-compatible IDs)
export const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  go: 60, // Go (1.13.5)
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_IDS;

export interface SubmissionRequest {
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
  priority?: number;
}

export interface SubmissionResponse {
  id: string;
  status: string;
  language_id: number;
  created_at: string;
}

export interface SubmissionResult {
  id: string;
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
  status: "queued" | "processing" | "completed" | "error" | "timeout";
  stdout?: string;
  stderr?: string;
  exit_code: number;
  time: number;
  memory: number;
  compile_output?: string;
  message?: string;
  created_at: string;
  finished_at?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  time?: number;
  memory?: number;
}

export interface ExecutionResult {
  success: boolean;
  testResults: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalTime: number;
  averageMemory: number;
  error?: string;
}

/**
 * Submit code for execution
 */
export async function submitCode(
  language: SupportedLanguage,
  sourceCode: string,
  stdin?: string,
  expectedOutput?: string,
  priority: number = 0,
): Promise<SubmissionResponse> {
  const languageId = LANGUAGE_IDS[language];

  const response = await fetch(`${ROJUDGER_API_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: sourceCode,
      stdin: stdin || "",
      expected_output: expectedOutput || "",
      priority,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || `Failed to submit code: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Get submission result
 */
export async function getSubmissionResult(
  submissionId: string,
): Promise<SubmissionResult> {
  const response = await fetch(
    `${ROJUDGER_API_URL}/submissions/${submissionId}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to get submission: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Poll for submission result with timeout
 */
export async function pollSubmissionResult(
  submissionId: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000,
): Promise<SubmissionResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getSubmissionResult(submissionId);

    // Check if submission is finished
    if (["completed", "error", "timeout"].includes(result.status)) {
      return result;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Submission timeout: took too long to complete");
}

/**
 * Run code with a single test case
 */
export async function runSingleTest(
  language: SupportedLanguage,
  sourceCode: string,
  testCase: TestCase,
): Promise<TestResult> {
  try {
    // Submit code
    const submission = await submitCode(
      language,
      sourceCode,
      testCase.input,
      testCase.expectedOutput,
      5, // Higher priority for quick feedback
    );

    // Poll for result
    const result = await pollSubmissionResult(submission.id);

    // Check for compilation errors
    if (result.compile_output) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: "",
        error: `Compilation Error:\n${result.compile_output}`,
      };
    }

    // Check for runtime errors
    if (result.status === "error") {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.stdout || "",
        error: result.message || result.stderr || "Runtime error",
      };
    }

    // Check for timeout
    if (result.status === "timeout") {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.stdout || "",
        error: "Time Limit Exceeded",
        time: result.time,
      };
    }

    // Compare output
    const actualOutput = (result.stdout || "").trim();
    const expectedOutput = testCase.expectedOutput.trim();

    // Try to normalize JSON arrays/objects for comparison
    let passed = actualOutput === expectedOutput;
    if (!passed) {
      try {
        // Try parsing as JSON and compare
        const actualJson = JSON.parse(actualOutput);
        const expectedJson = JSON.parse(expectedOutput);
        passed = JSON.stringify(actualJson) === JSON.stringify(expectedJson);
      } catch {
        // If not valid JSON, fall back to string comparison
        passed = actualOutput === expectedOutput;
      }
    }

    return {
      passed,
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput,
      time: result.time,
      memory: result.memory,
    };
  } catch (error) {
    return {
      passed: false,
      input: testCase.input,
      expected: testCase.expectedOutput,
      actual: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run code against multiple test cases
 */
export async function runAllTests(
  language: SupportedLanguage,
  sourceCode: string,
  testCases: TestCase[],
): Promise<ExecutionResult> {
  if (testCases.length === 0) {
    return {
      success: false,
      testResults: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
      averageMemory: 0,
      error: "No test cases provided",
    };
  }

  const testResults: TestResult[] = [];
  let totalTime = 0;
  let totalMemory = 0;

  // Run tests sequentially to avoid overwhelming the server
  for (const testCase of testCases) {
    const result = await runSingleTest(language, sourceCode, testCase);
    testResults.push(result);

    if (result.time) totalTime += result.time;
    if (result.memory) totalMemory += result.memory;
  }

  const passedTests = testResults.filter((r) => r.passed).length;
  const failedTests = testResults.length - passedTests;
  const averageMemory = totalMemory / testResults.length;

  return {
    success: passedTests === testResults.length,
    testResults,
    totalTests: testResults.length,
    passedTests,
    failedTests,
    totalTime,
    averageMemory,
  };
}

/**
 * Quick run - just execute code with stdin
 */
export async function quickRun(
  language: SupportedLanguage,
  sourceCode: string,
  stdin: string = "",
): Promise<SubmissionResult> {
  const submission = await submitCode(
    language,
    sourceCode,
    stdin,
    undefined,
    5,
  );
  return pollSubmissionResult(submission.id);
}

/**
 * Get available languages
 */
export async function getLanguages() {
  try {
    const response = await fetch(`${ROJUDGER_API_URL}/languages`);
    if (!response.ok) {
      throw new Error("Failed to fetch languages");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching languages:", error);
    // Return default languages if API fails
    return Object.entries(LANGUAGE_IDS).map(([name, id]) => ({
      id,
      name,
      display_name: name.charAt(0).toUpperCase() + name.slice(1),
    }));
  }
}
