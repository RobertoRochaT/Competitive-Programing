export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  country?: string;
  school?: string;
  ranking: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  streak: number;
  maxStreak: number;
  lastSolvedAt?: string;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  recentACs?: Submission[];
  languages?: Record<string, number>;
  tagStats?: Record<string, number>;
}

export interface Submission {
  id: number;
  userId: number;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  runtime: number;
  memory: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  testResults?: string;
  createdAt: string;
}

export interface SubmissionDetail extends Submission {
  username: string;
  testCases?: TestResult[];
  problemTags?: string[];
  difficulty?: string;
}

export interface TestResult {
  testNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime?: number;
  memory?: number;
  error?: string;
}

export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compilation_error";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  country?: string;
  school?: string;
  avatar?: string;
}

export interface SubmissionRequest {
  problemSlug: string;
  language: string;
  code: string;
}

export interface SubmissionListResponse {
  submissions: SubmissionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmissionStats {
  totalSubmissions: number;
  byStatus: Record<SubmissionStatus, number>;
  byLanguage: Record<string, number>;
  byDifficulty: Record<string, number>;
  recentActivity: SubmissionActivityDay[];
}

export interface SubmissionActivityDay {
  date: string;
  count: number;
}
