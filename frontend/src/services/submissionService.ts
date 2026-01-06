const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8083/api";

export interface CreateSubmissionRequest {
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Runtime Error"
    | "Compilation Error"
    | "Time Limit Exceeded";
  runtime?: number;
  memory?: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  testResults?: string;
}

export interface Submission {
  id: number;
  userId: number;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status: string;
  runtime: number;
  memory: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  testResults?: string;
  createdAt: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  languageStats: Record<string, number>;
  recentSubmissions: Submission[];
}

class SubmissionService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Not authenticated");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async createSubmission(data: CreateSubmissionRequest): Promise<Submission> {
    const response = await fetch(`${API_URL}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to create submission" }));
      throw new Error(error.error || "Failed to create submission");
    }

    return response.json();
  }

  async getMySubmissions(
    limit?: number,
    offset?: number,
  ): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    const response = await fetch(`${API_URL}/me/submissions?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch submissions");
    }

    const data = await response.json();
    return data.submissions || [];
  }

  async getSubmission(id: number): Promise<Submission> {
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch submission");
    }

    return response.json();
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    const response = await fetch(`${API_URL}/me/submissions/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch submission stats");
    }

    return response.json();
  }

  async getProblemSubmissions(problemSlug: string): Promise<Submission[]> {
    const response = await fetch(
      `${API_URL}/problems/${problemSlug}/submissions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch problem submissions");
    }

    const data = await response.json();
    return data.submissions || [];
  }

  async getUserSubmissions(
    username: string,
    limit?: number,
  ): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(
      `${API_URL}/users/${username}/submissions?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user submissions");
    }

    return response.json();
  }
}

export const submissionService = new SubmissionService();
