import type { Problem, ProblemListResponse } from "../types/problem";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const PROBLEMS_PER_PAGE = 100;

// Obtener problemas con paginación
export const fetchProblems = async (
  limit: number = PROBLEMS_PER_PAGE,
  skip: number = 0,
): Promise<ProblemListResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/problems?limit=${limit}&skip=${skip}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch problems: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw error;
  }
};

// Obtener un problema específico por slug
export const fetchProblemBySlug = async (
  slug: string,
): Promise<Problem | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch problem: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching problem ${slug}:`, error);
    throw error;
  }
};
