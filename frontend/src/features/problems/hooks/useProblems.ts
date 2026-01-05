import { useState, useEffect } from "react";
import type { Problem, ProblemListResponse } from "../types/problem";
import { fetchProblems } from "../services/problemService";

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: ProblemListResponse = await fetchProblems();
        setProblems(response.problems);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load problems",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  return { problems, loading, error };
};
