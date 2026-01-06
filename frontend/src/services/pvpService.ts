const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8083/api";

export interface CreateSessionRequest {
  title: string;
  topics: string[];
  difficulty: string;
  max_problems: number;
  duration: number;
  is_public: boolean;
}

export interface JoinSessionRequest {
  code: string;
}

export interface PvPSubmitRequest {
  problem_id: number;
  problem_slug: string;
  code: string;
  language: string;
  status: string;
  runtime: number;
  memory: number;
  passed_tests: number;
  total_tests: number;
}

export interface PvPSession {
  id: number;
  code: string;
  admin_user_id: number;
  title: string;
  topics: string[];
  difficulty: string;
  status: "waiting" | "active" | "finished";
  max_problems: number;
  duration: number;
  is_public: boolean;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface PvPProblem {
  id: number;
  session_id: number;
  problem_id: number;
  problem_slug: string;
  problem_title: string;
  problem_difficulty: string;
  letter: string;
  points: number;
}

export interface PvPParticipant {
  id: number;
  session_id: number;
  user_id: number;
  username: string;
  joined_at: string;
  score: number;
  problems_solved: number;
  total_penalty: number;
}

export interface SessionWithDetails extends PvPSession {
  admin_username: string;
  participant_count: number;
  problems?: PvPProblem[];
  participants?: PvPParticipant[];
}

export interface ProblemAC {
  letter: string;
  accepted: boolean;
  attempts: number;
  accepted_at?: string;
  time_penalty: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  problems_solved: number;
  total_penalty: number;
  problems: Record<string, ProblemAC>;
  last_ac_time?: string;
}

export interface PvPSubmission {
  id: number;
  session_id: number;
  user_id: number;
  problem_id: number;
  problem_slug: string;
  code: string;
  language: string;
  status: string;
  runtime?: number;
  memory?: number;
  passed_tests: number;
  total_tests: number;
  submitted_at: string;
  time_penalty: number;
  is_accepted: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const pvpService = {
  // Create a new PvP session
  createSession: async (
    data: CreateSessionRequest,
  ): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create session");
    }

    return response.json();
  },

  // Get session by code
  getSessionByCode: async (code: string): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions/${code}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get session");
    }

    return response.json();
  },

  // Get session by ID
  getSessionByID: async (id: number): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions/id/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get session");
    }

    return response.json();
  },

  // Join a session by code
  joinSession: async (
    data: JoinSessionRequest,
  ): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions/join`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join session");
    }

    return response.json();
  },

  // Join a session by ID (for public sessions)
  joinSessionByID: async (id: number): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions/${id}/join`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join session");
    }

    return response.json();
  },

  // Start a session (admin only)
  startSession: async (id: number): Promise<SessionWithDetails> => {
    const response = await fetch(`${API_URL}/pvp/sessions/${id}/start`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start session");
    }

    return response.json();
  },

  // Get session problems
  getSessionProblems: async (id: number): Promise<PvPProblem[]> => {
    const response = await fetch(`${API_URL}/pvp/sessions/${id}/problems`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get problems");
    }

    return response.json();
  },

  // Get leaderboard
  getLeaderboard: async (id: number): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_URL}/pvp/sessions/${id}/leaderboard`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get leaderboard");
    }

    return response.json();
  },

  // Submit solution
  submitSolution: async (
    sessionId: number,
    data: PvPSubmitRequest,
  ): Promise<PvPSubmission> => {
    const response = await fetch(
      `${API_URL}/pvp/sessions/${sessionId}/submit`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit solution");
    }

    return response.json();
  },

  // Get user's sessions
  getUserSessions: async (): Promise<SessionWithDetails[]> => {
    const response = await fetch(`${API_URL}/pvp/my-sessions`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get sessions");
    }

    return response.json();
  },

  // Get public sessions with filters
  getPublicSessions: async (params?: {
    status?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SessionWithDetails[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const url = `${API_URL}/pvp/public${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get public sessions");
    }

    return response.json();
  },
};

export default pvpService;
