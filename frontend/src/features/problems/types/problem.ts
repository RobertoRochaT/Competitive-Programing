export type Difficulty = "Easy" | "Medium" | "Hard";

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  solved: boolean;
  tags?: string[];
  description?: string;
  testCases?: TestCase[];
  examples?: {
    input: string;
    output: string;
    explanation?: string;
  }[];
}

export interface ProblemListResponse {
  problems: Problem[];
  total: number;
}
