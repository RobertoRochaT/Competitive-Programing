import type { Problem, ProblemListResponse } from "../types/problem";

// Mock data - Reemplaza esto con llamadas reales a tu API
const mockProblems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    acceptanceRate: 49.2,
    solved: true,
    tags: ["Array", "Hash Table"],
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  },
  {
    id: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Medium",
    acceptanceRate: 38.5,
    solved: false,
    tags: ["Linked List", "Math", "Recursion"],
    description:
      "You are given two non-empty linked lists representing two non-negative integers.",
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    acceptanceRate: 33.8,
    solved: true,
    tags: ["Hash Table", "String", "Sliding Window"],
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "Hard",
    acceptanceRate: 35.2,
    solved: false,
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    difficulty: "Medium",
    acceptanceRate: 32.1,
    solved: false,
    tags: ["String", "Dynamic Programming"],
    description:
      "Given a string s, return the longest palindromic substring in s.",
  },
  {
    id: 6,
    title: "Reverse Integer",
    slug: "reverse-integer",
    difficulty: "Medium",
    acceptanceRate: 27.3,
    solved: true,
    tags: ["Math"],
    description:
      "Given a signed 32-bit integer x, return x with its digits reversed.",
  },
  {
    id: 7,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    acceptanceRate: 40.7,
    solved: true,
    tags: ["String", "Stack"],
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
  },
  {
    id: 8,
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    difficulty: "Easy",
    acceptanceRate: 61.2,
    solved: false,
    tags: ["Linked List", "Recursion"],
    description:
      "You are given the heads of two sorted linked lists list1 and list2.",
  },
  {
    id: 9,
    title: "Generate Parentheses",
    slug: "generate-parentheses",
    difficulty: "Medium",
    acceptanceRate: 71.4,
    solved: false,
    tags: ["String", "Dynamic Programming", "Backtracking"],
    description:
      "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
  },
  {
    id: 10,
    title: "Regular Expression Matching",
    slug: "regular-expression-matching",
    difficulty: "Hard",
    acceptanceRate: 27.9,
    solved: false,
    tags: ["String", "Dynamic Programming", "Recursion"],
    description:
      "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
  },
];

// Simula una llamada a la API
export const fetchProblems = async (): Promise<ProblemListResponse> => {
  // Simula delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    problems: mockProblems,
    total: mockProblems.length,
  };
};

// Obtener un problema específico por slug
export const fetchProblemBySlug = async (
  slug: string,
): Promise<Problem | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const problem = mockProblems.find((p) => p.slug === slug);
  return problem || null;
};

// TODO: Conectar con tu API real
// export const fetchProblems = async (): Promise<ProblemListResponse> => {
//   const response = await fetch('/api/problems');
//   const data = await response.json();
//   return data;
// };
