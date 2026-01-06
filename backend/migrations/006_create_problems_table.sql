-- Migration: Create problems table and seed with initial data
-- This table stores the problem catalog for PvP sessions

CREATE TABLE IF NOT EXISTS problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    description TEXT,
    topics TEXT[] DEFAULT '{}',
    constraints TEXT,
    example_input TEXT,
    example_output TEXT,
    example_explanation TEXT,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topics ON problems USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);

-- Seed initial problems data
INSERT INTO problems (title, slug, difficulty, description, topics, constraints, example_input, example_output, example_explanation) VALUES
-- Easy Problems
('Two Sum', 'two-sum', 'easy',
'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
ARRAY['array', 'hash-table'],
'2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
'nums = [2,7,11,15], target = 9',
'[0,1]',
'Because nums[0] + nums[1] == 9, we return [0, 1]'),

('Palindrome Number', 'palindrome-number', 'easy',
'Given an integer x, return true if x is a palindrome, and false otherwise.',
ARRAY['math'],
'-2^31 <= x <= 2^31 - 1',
'x = 121',
'true',
'121 reads as 121 from left to right and from right to left'),

('Roman to Integer', 'roman-to-integer', 'easy',
'Given a roman numeral, convert it to an integer.',
ARRAY['hash-table', 'math', 'string'],
'1 <= s.length <= 15, s contains only the characters (I, V, X, L, C, D, M)',
's = "III"',
'3',
'III = 3'),

('Valid Parentheses', 'valid-parentheses', 'easy',
'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
ARRAY['string', 'stack'],
'1 <= s.length <= 10^4',
's = "()"',
'true',
'The string is valid'),

('Merge Two Sorted Lists', 'merge-two-sorted-lists', 'easy',
'Merge two sorted linked lists and return it as a sorted list.',
ARRAY['linked-list', 'recursion'],
'The number of nodes in both lists is in the range [0, 50]',
'list1 = [1,2,4], list2 = [1,3,4]',
'[1,1,2,3,4,4]',
'The merged list'),

('Remove Duplicates from Sorted Array', 'remove-duplicates-sorted-array', 'easy',
'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place.',
ARRAY['array', 'two-pointers'],
'1 <= nums.length <= 3 * 10^4',
'nums = [1,1,2]',
'2, nums = [1,2,_]',
'Your function should return k = 2'),

('Maximum Subarray', 'maximum-subarray', 'easy',
'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
ARRAY['array', 'divide-and-conquer', 'dynamic-programming'],
'1 <= nums.length <= 10^5',
'nums = [-2,1,-3,4,-1,2,1,-5,4]',
'6',
'The subarray [4,-1,2,1] has the largest sum 6'),

('Climbing Stairs', 'climbing-stairs', 'easy',
'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps.',
ARRAY['math', 'dynamic-programming', 'memoization'],
'1 <= n <= 45',
'n = 2',
'2',
'There are two ways to climb to the top: 1+1 or 2'),

-- Medium Problems
('Add Two Numbers', 'add-two-numbers', 'medium',
'You are given two non-empty linked lists representing two non-negative integers.',
ARRAY['linked-list', 'math', 'recursion'],
'The number of nodes in each linked list is in the range [1, 100]',
'l1 = [2,4,3], l2 = [5,6,4]',
'[7,0,8]',
'342 + 465 = 807'),

('Longest Substring Without Repeating Characters', 'longest-substring-without-repeating', 'medium',
'Given a string s, find the length of the longest substring without repeating characters.',
ARRAY['hash-table', 'string', 'sliding-window'],
'0 <= s.length <= 5 * 10^4',
's = "abcabcbb"',
'3',
'The answer is "abc", with the length of 3'),

('Longest Palindromic Substring', 'longest-palindromic-substring', 'medium',
'Given a string s, return the longest palindromic substring in s.',
ARRAY['string', 'dynamic-programming'],
'1 <= s.length <= 1000',
's = "babad"',
'"bab"',
'"aba" is also a valid answer'),

('Container With Most Water', 'container-most-water', 'medium',
'Find two lines that together with the x-axis form a container that contains the most water.',
ARRAY['array', 'two-pointers', 'greedy'],
'n == height.length, 2 <= n <= 10^5',
'height = [1,8,6,2,5,4,8,3,7]',
'49',
'The max area is between height[1] and height[8]'),

('3Sum', '3sum', 'medium',
'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
ARRAY['array', 'two-pointers', 'sorting'],
'3 <= nums.length <= 3000',
'nums = [-1,0,1,2,-1,-4]',
'[[-1,-1,2],[-1,0,1]]',
'The distinct triplets are [-1,0,1] and [-1,-1,2]'),

('Letter Combinations of a Phone Number', 'letter-combinations-phone', 'medium',
'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.',
ARRAY['hash-table', 'string', 'backtracking'],
'0 <= digits.length <= 4',
'digits = "23"',
'["ad","ae","af","bd","be","bf","cd","ce","cf"]',
'All possible combinations'),

('Generate Parentheses', 'generate-parentheses', 'medium',
'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
ARRAY['string', 'dynamic-programming', 'backtracking'],
'1 <= n <= 8',
'n = 3',
'["((()))","(()())","(())()","()(())","()()()"]',
'All valid combinations'),

('Swap Nodes in Pairs', 'swap-nodes-pairs', 'medium',
'Given a linked list, swap every two adjacent nodes and return its head.',
ARRAY['linked-list', 'recursion'],
'The number of nodes in the list is in the range [0, 100]',
'head = [1,2,3,4]',
'[2,1,4,3]',
'Swap adjacent pairs'),

-- Hard Problems
('Median of Two Sorted Arrays', 'median-two-sorted-arrays', 'hard',
'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
ARRAY['array', 'binary-search', 'divide-and-conquer'],
'0 <= m <= 1000, 0 <= n <= 1000',
'nums1 = [1,3], nums2 = [2]',
'2.00000',
'The median is 2.0'),

('Regular Expression Matching', 'regular-expression-matching', 'hard',
'Given an input string s and a pattern p, implement regular expression matching with support for . and *.',
ARRAY['string', 'dynamic-programming', 'recursion'],
'1 <= s.length <= 20, 1 <= p.length <= 20',
's = "aa", p = "a"',
'false',
'a does not match the entire string aa'),

('Merge k Sorted Lists', 'merge-k-sorted-lists', 'hard',
'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.',
ARRAY['linked-list', 'divide-and-conquer', 'heap', 'merge-sort'],
'k == lists.length, 0 <= k <= 10^4',
'lists = [[1,4,5],[1,3,4],[2,6]]',
'[1,1,2,3,4,4,5,6]',
'The merged list'),

('Trapping Rain Water', 'trapping-rain-water', 'hard',
'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
ARRAY['array', 'two-pointers', 'dynamic-programming', 'stack'],
'n == height.length, 1 <= n <= 2 * 10^4',
'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
'6',
'Water trapped between the bars'),

('Wildcard Matching', 'wildcard-matching', 'hard',
'Given an input string s and a pattern p, implement wildcard pattern matching with support for ? and *.',
ARRAY['string', 'dynamic-programming', 'greedy', 'recursion'],
'0 <= s.length, p.length <= 2000',
's = "aa", p = "a"',
'false',
'a does not match the entire string aa'),

('N-Queens', 'n-queens', 'hard',
'The n-queens puzzle is the problem of placing n queens on an n×n chessboard such that no two queens attack each other.',
ARRAY['array', 'backtracking'],
'1 <= n <= 9',
'n = 4',
'[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
'Two distinct solutions to the 4-queens puzzle'),

('Word Ladder', 'word-ladder', 'hard',
'A transformation sequence from word beginWord to word endWord using a dictionary wordList.',
ARRAY['hash-table', 'string', 'breadth-first-search'],
'1 <= beginWord.length <= 10, endWord.length == beginWord.length',
'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
'5',
'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog"'),

('Reverse Nodes in k-Group', 'reverse-nodes-k-group', 'hard',
'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.',
ARRAY['linked-list', 'recursion'],
'The number of nodes in the list is n, 1 <= k <= n <= 5000',
'head = [1,2,3,4,5], k = 2',
'[2,1,4,3,5]',
'Reverse every k nodes')

ON CONFLICT (slug) DO NOTHING;

-- Update acceptance rates (mock data)
UPDATE problems SET
    total_submissions = FLOOR(RANDOM() * 10000 + 1000),
    total_accepted = FLOOR(RANDOM() * 5000 + 500)
WHERE acceptance_rate = 0.0;

UPDATE problems SET
    acceptance_rate = ROUND((total_accepted::DECIMAL / NULLIF(total_submissions, 0) * 100), 2)
WHERE total_submissions > 0;

COMMIT;
