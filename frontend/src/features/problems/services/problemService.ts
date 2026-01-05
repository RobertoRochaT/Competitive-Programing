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

// Obtener todos los problemas con paginación automática (carga incremental)
export const fetchAllProblems = async (
  onProgress?: (loaded: number, total: number) => void,
): Promise<Problem[]> => {
  const allProblems: Problem[] = [];
  let skip = 0;
  let total = 0;

  try {
    // Primera request para obtener el total
    const firstPage = await fetchProblems(PROBLEMS_PER_PAGE, skip);
    total = firstPage.total;
    allProblems.push(...firstPage.problems);
    skip += PROBLEMS_PER_PAGE;

    if (onProgress) {
      onProgress(allProblems.length, total);
    }

    // Cargar el resto de páginas
    while (skip < total) {
      const page = await fetchProblems(PROBLEMS_PER_PAGE, skip);
      allProblems.push(...page.problems);
      skip += PROBLEMS_PER_PAGE;

      if (onProgress) {
        onProgress(allProblems.length, total);
      }
    }

    return allProblems;
  } catch (error) {
    console.error("Error fetching all problems:", error);
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
