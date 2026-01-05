import { useState, useEffect, useCallback } from "react";
import type { Problem } from "../types/problem";
import { fetchProblems, fetchAllProblems } from "../services/problemService";

const PROBLEMS_PER_PAGE = 100;

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Cargar la primera página
  useEffect(() => {
    const loadInitialProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProblems(PROBLEMS_PER_PAGE, 0);
        setProblems(response.problems);
        setTotal(response.total);
        setHasMore(response.problems.length < response.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load problems",
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialProblems();
  }, []);

  // Cargar más problemas (siguiente página)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);
      const skip = problems.length;
      const response = await fetchProblems(PROBLEMS_PER_PAGE, skip);

      setProblems((prev) => [...prev, ...response.problems]);
      setHasMore(problems.length + response.problems.length < response.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more problems",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [problems.length, loadingMore, hasMore]);

  // Cargar TODOS los problemas de una vez (con progreso)
  const loadAll = useCallback(
    async (onProgress?: (loaded: number, total: number) => void) => {
      try {
        setLoading(true);
        setError(null);
        const allProblems = await fetchAllProblems(onProgress);
        setProblems(allProblems);
        setTotal(allProblems.length);
        setHasMore(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load all problems",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    problems,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    loadMore,
    loadAll,
  };
};
