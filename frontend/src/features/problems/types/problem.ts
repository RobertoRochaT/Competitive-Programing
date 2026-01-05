export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  solved: boolean;
  tags?: string[];
  description?: string;
}

export interface ProblemListResponse {
  problems: Problem[];
  total: number;
}
