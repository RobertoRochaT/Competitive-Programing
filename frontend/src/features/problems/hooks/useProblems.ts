import { useState, useEffect, useCallback } from "react";
import type { Problem } from "../types/problem";
import { fetchProblems } from "../services/problemService";

const PROBLEMS_PER_PAGE = 100;

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Cargar problemas de una página específica
  const loadPage = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const skip = (page - 1) * PROBLEMS_PER_PAGE;
      const response = await fetchProblems(PROBLEMS_PER_PAGE, skip);

      setProblems(response.problems);
      setTotal(response.total);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.total / PROBLEMS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar la primera página al inicio
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // Ir a la página siguiente
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  // Ir a la página anterior
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  // Ir a una página específica
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        loadPage(page);
      }
    },
    [totalPages, loadPage],
  );

  return {
    problems,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
  };
};
