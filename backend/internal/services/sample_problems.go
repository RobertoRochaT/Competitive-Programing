package services

import (
	"github.com/RobertoRochaT/CPP-backend/internal/models"
)

// GetSampleProblems returns hardcoded sample problems with test cases
// This is used until full integration with ROJUDGER is complete
func GetSampleProblems() []models.Problem {
	return []models.Problem{
		{
			ID:             1,
			Title:          "Two Sum",
			Slug:           "two-sum",
			Difficulty:     models.Easy,
			AcceptanceRate: 49.2,
			Solved:         false,
			Tags:           []string{"Array", "Hash Table"},
			Description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
			Examples: []models.Example{
				{
					Input:       `[2,7,11,15]\n9`,
					Output:      `[0,1]`,
					Explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
				},
				{
					Input:  `[3,2,4]\n6`,
					Output: `[1,2]`,
				},
				{
					Input:  `[3,3]\n6`,
					Output: `[0,1]`,
				},
			},
			TestCases: []models.TestCase{
				{
					Input:          "[2,7,11,15]\n9",
					ExpectedOutput: "[0,1]",
					Description:    "Basic test case",
				},
				{
					Input:          "[3,2,4]\n6",
					ExpectedOutput: "[1,2]",
					Description:    "Target in middle",
				},
				{
					Input:          "[3,3]\n6",
					ExpectedOutput: "[0,1]",
					Description:    "Duplicate numbers",
				},
				{
					Input:          "[1,5,3,7,9,2]\n10",
					ExpectedOutput: "[2,4]",
					Description:    "Larger array",
				},
				{
					Input:          "[-1,-2,-3,-4,-5]\n-8",
					ExpectedOutput: "[2,4]",
					Description:    "Negative numbers",
				},
			},
		},
		{
			ID:             2,
			Title:          "Add Two Numbers",
			Slug:           "add-two-numbers",
			Difficulty:     models.Medium,
			AcceptanceRate: 38.9,
			Solved:         false,
			Tags:           []string{"Linked List", "Math", "Recursion"},
			Description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

Example 1:
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.

Example 2:
Input: l1 = [0], l2 = [0]
Output: [0]

Example 3:
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]

Constraints:
- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.`,
			Examples: []models.Example{
				{
					Input:       "[2,4,3]\n[5,6,4]",
					Output:      "[7,0,8]",
					Explanation: "342 + 465 = 807",
				},
				{
					Input:  "[0]\n[0]",
					Output: "[0]",
				},
			},
			TestCases: []models.TestCase{
				{
					Input:          "[2,4,3]\n[5,6,4]",
					ExpectedOutput: "[7,0,8]",
					Description:    "Basic addition",
				},
				{
					Input:          "[0]\n[0]",
					ExpectedOutput: "[0]",
					Description:    "Zero case",
				},
			},
		},
		{
			ID:             3,
			Title:          "Longest Substring Without Repeating Characters",
			Slug:           "longest-substring-without-repeating-characters",
			Difficulty:     models.Medium,
			AcceptanceRate: 33.8,
			Solved:         false,
			Tags:           []string{"Hash Table", "String", "Sliding Window"},
			Description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
			Examples: []models.Example{
				{
					Input:       "abcabcbb",
					Output:      "3",
					Explanation: `The answer is "abc", with the length of 3.`,
				},
				{
					Input:       "bbbbb",
					Output:      "1",
					Explanation: `The answer is "b", with the length of 1.`,
				},
			},
			TestCases: []models.TestCase{
				{
					Input:          "abcabcbb",
					ExpectedOutput: "3",
					Description:    "Repeating pattern",
				},
				{
					Input:          "bbbbb",
					ExpectedOutput: "1",
					Description:    "All same character",
				},
				{
					Input:          "pwwkew",
					ExpectedOutput: "3",
					Description:    "Mixed repeating",
				},
				{
					Input:          "",
					ExpectedOutput: "0",
					Description:    "Empty string",
				},
			},
		},
		{
			ID:             4,
			Title:          "Reverse Integer",
			Slug:           "reverse-integer",
			Difficulty:     models.Medium,
			AcceptanceRate: 27.4,
			Solved:         false,
			Tags:           []string{"Math"},
			Description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

Example 1:
Input: x = 123
Output: 321

Example 2:
Input: x = -123
Output: -321

Example 3:
Input: x = 120
Output: 21

Constraints:
- -2^31 <= x <= 2^31 - 1`,
			Examples: []models.Example{
				{
					Input:  "123",
					Output: "321",
				},
				{
					Input:  "-123",
					Output: "-321",
				},
				{
					Input:  "120",
					Output: "21",
				},
			},
			TestCases: []models.TestCase{
				{
					Input:          "123",
					ExpectedOutput: "321",
					Description:    "Positive number",
				},
				{
					Input:          "-123",
					ExpectedOutput: "-321",
					Description:    "Negative number",
				},
				{
					Input:          "120",
					ExpectedOutput: "21",
					Description:    "Trailing zeros",
				},
				{
					Input:          "0",
					ExpectedOutput: "0",
					Description:    "Zero",
				},
			},
		},
		{
			ID:             5,
			Title:          "Palindrome Number",
			Slug:           "palindrome-number",
			Difficulty:     models.Easy,
			AcceptanceRate: 52.7,
			Solved:         false,
			Tags:           []string{"Math"},
			Description: `Given an integer x, return true if x is a palindrome, and false otherwise.

Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

Example 2:
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

Example 3:
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.

Constraints:
- -2^31 <= x <= 2^31 - 1`,
			Examples: []models.Example{
				{
					Input:       "121",
					Output:      "true",
					Explanation: "121 reads as 121 from left to right and from right to left.",
				},
				{
					Input:       "-121",
					Output:      "false",
					Explanation: "From left to right, it reads -121. From right to left, it becomes 121-.",
				},
			},
			TestCases: []models.TestCase{
				{
					Input:          "121",
					ExpectedOutput: "true",
					Description:    "Positive palindrome",
				},
				{
					Input:          "-121",
					ExpectedOutput: "false",
					Description:    "Negative number",
				},
				{
					Input:          "10",
					ExpectedOutput: "false",
					Description:    "Not palindrome",
				},
				{
					Input:          "12321",
					ExpectedOutput: "true",
					Description:    "Odd length palindrome",
				},
			},
		},
	}
}

// GetProblemBySlug returns a sample problem by its slug
func GetProblemBySlug(slug string) *models.Problem {
	problems := GetSampleProblems()
	for _, p := range problems {
		if p.Slug == slug {
			return &p
		}
	}
	return nil
}
