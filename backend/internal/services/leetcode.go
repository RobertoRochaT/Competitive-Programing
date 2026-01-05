package services

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "strconv"
    "github.com/RobertoRochaT/CPP-backend/internal/models"
)

const leetcodeGraphQLURL = "https://leetcode.com/graphql"

type LeetCodeService struct {
    client *http.Client
}

func NewLeetCodeService() *LeetCodeService {
    return &LeetCodeService{
        client: &http.Client{},
    }
}

func (s *LeetCodeService) FetchProblems(limit, skip int) (*models.ProblemListResponse, error) {
    query := fmt.Sprintf(`
    query problemsetQuestionList {
      problemsetQuestionList: questionList(
        categorySlug: ""
        limit: %d
        skip: %d
        filters: {}
      ) {
        total: totalNum
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          acRate
          topicTags {
            name
          }
        }
      }
    }
    `, limit, skip)

    requestBody := map[string]string{
        "query": query,
    }

    jsonData, err := json.Marshal(requestBody)
    if err != nil {
        return nil, fmt.Errorf("error marshaling request: %w", err)
    }

    req, err := http.NewRequest("POST", leetcodeGraphQLURL, bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, fmt.Errorf("error creating request: %w", err)
    }

    req.Header.Set("Content-Type", "application/json")

    resp, err := s.client.Do(req)
    if err != nil {
        log.Printf("Error making request to LeetCode: %v", err)
        return nil, fmt.Errorf("error making request: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Printf("Error reading response body: %v", err)
        return nil, fmt.Errorf("error reading response: %w", err)
    }

    var leetcodeResp models.LeetCodeResponse
    if err := json.Unmarshal(body, &leetcodeResp); err != nil {
        log.Printf("Error unmarshaling JSON: %v", err)
        log.Printf("Full response body: %s", string(body))
        return nil, fmt.Errorf("error unmarshaling response: %w", err)
    }

    problems := make([]models.Problem, 0, len(leetcodeResp.Data.ProblemsetQuestionList.Questions))

    for _, p := range leetcodeResp.Data.ProblemsetQuestionList.Questions {
        id, _ := strconv.Atoi(p.QuestionID)

        tags := make([]string, len(p.TopicTags))
        for i, tag := range p.TopicTags {
            tags[i] = tag.Name
        }

        problems = append(problems, models.Problem{
            ID:             id,
            Title:          p.Title,
            Slug:           p.TitleSlug,
            Difficulty:     models.Difficulty(p.Difficulty),
            AcceptanceRate: p.AcRate,
            Solved:         false,
            Tags:           tags,
            Description:    fmt.Sprintf("Acceptance Rate: %.1f%% | Topics: %s", p.AcRate, formatTags(tags)),
        })
    }

    return &models.ProblemListResponse{
        Problems: problems,
        Total:    leetcodeResp.Data.ProblemsetQuestionList.Total,
    }, nil
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func formatTags(tags []string) string {
    if len(tags) == 0 {
        return "No tags"
    }
    if len(tags) <= 3 {
        return joinStrings(tags, ", ")
    }
    return fmt.Sprintf("%s, +%d more", joinStrings(tags[:3], ", "), len(tags)-3)
}

func joinStrings(strs []string, sep string) string {
    if len(strs) == 0 {
        return ""
    }
    result := strs[0]
    for i := 1; i < len(strs); i++ {
        result += sep + strs[i]
    }
    return result
}
