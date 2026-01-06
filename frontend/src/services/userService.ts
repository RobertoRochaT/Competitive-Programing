import { authService } from './authService';
import type {
  User,
  UserProfile,
  UserStats,
  UpdateProfileRequest,
  Submission,
  SubmissionListResponse,
  SubmissionStats,
  SubmissionRequest,
  SubmissionDetail,
} from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

class UserService {
  // Get user profile by username
  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/users/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  // Get current user's profile
  async getMyProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/me/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  // Update current user's profile
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await fetch(`${API_URL}/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // Get user statistics
  async getUserStats(username: string): Promise<UserStats> {
    const response = await fetch(`${API_URL}/users/${username}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user stats');
    }

    return response.json();
  }

  // Get solved problems
  async getSolvedProblems(username: string): Promise<Submission[]> {
    const response = await fetch(`${API_URL}/users/${username}/solved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get solved problems');
    }

    const data = await response.json();
    return data.problems || [];
  }

  // Get language statistics
  async getLanguageStats(username: string): Promise<Record<string, number>> {
    const response = await fetch(`${API_URL}/users/${username}/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get language stats');
    }

    return response.json();
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
    const response = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get leaderboard');
    }

    const data = await response.json();
    return data.users || [];
  }

  // Submission methods

  // Create a new submission
  async createSubmission(data: SubmissionRequest): Promise<Submission> {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create submission' }));
      throw new Error(error.error || 'Failed to create submission');
    }

    return response.json();
  }

  // Update submission result
  async updateSubmissionResult(
    submissionId: number,
    result: {
      status: string;
      runtime: number;
      memory: number;
      passedTests: number;
      totalTests: number;
      errorMessage?: string;
      testResults?: any[];
      difficulty?: string;
    }
  ): Promise<void> {
    const response = await fetch(`${API_URL}/submissions/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error('Failed to update submission');
    }
  }

  // Get submission by ID
  async getSubmission(submissionId: number): Promise<SubmissionDetail> {
    const response = await fetch(`${API_URL}/submissions/${submissionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get submission');
    }

    return response.json();
  }

  // Get my submissions
  async getMySubmissions(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<SubmissionListResponse> {
    let url = `${API_URL}/me/submissions?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get submissions');
    }

    return response.json();
  }

  // Get user submissions by username
  async getUserSubmissions(
    username: string,
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<SubmissionListResponse> {
    let url = `${API_URL}/users/${username}/submissions?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get submissions');
    }

    return response.json();
  }

  // Get problem submissions
  async getProblemSubmissions(problemSlug: string): Promise<SubmissionDetail[]> {
    const response = await fetch(`${API_URL}/problems/${problemSlug}/submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get problem submissions');
    }

    const data = await response.json();
    return data.submissions || [];
  }

  // Get submission statistics
  async getSubmissionStats(): Promise<SubmissionStats> {
    const response = await fetch(`${API_URL}/me/submissions/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get submission stats');
    }

    return response.json();
  }

  // Get recent submissions (public)
  async getRecentSubmissions(limit: number = 20): Promise<SubmissionDetail[]> {
    const response = await fetch(`${API_URL}/submissions/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get recent submissions');
    }

    const data = await response.json();
    return data.submissions || [];
  }

  // Delete submission
  async deleteSubmission(submissionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete submission');
    }
  }
}

export const userService = new UserService();
