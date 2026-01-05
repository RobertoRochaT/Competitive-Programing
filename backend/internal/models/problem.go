package models

type Difficulty string

const (
	Easy Difficulty = "Easy"
	Medium Difficulty = "Medium"
	Hard Difficulty = "Hard"
)

type Problem struct {
	ID			int			`json:"id"`
	Title		string		`json:"title"`
	Slug		string		`json:"slug"`
	Difficulty	Difficulty	`json:"difficulty"`
	AcceptanceRate float64	`json:"acceptance_rate"`
	Solved		bool		`json:"solved"`
	Tags		[]string	`json:"tags"`
	Description	string		`json:"description"`

}

type ProblemListResponse struct {
	Problems []Problem `json:"problems"`
	Total    int       `json:"total"`
}

type LeetCodeResponse struct {
    Data struct {
        ProblemsetQuestionList struct {
            Total     int             `json:"totalNum"`
            Questions []LeetCodeProblem `json:"data"`
        } `json:"problemsetQuestionList"`
    } `json:"data"`
}

type LeetCodeProblem struct {
    QuestionID string  `json:"questionId"`
    Title      string  `json:"title"`
    TitleSlug  string  `json:"titleSlug"`
    Difficulty string  `json:"difficulty"`
    AcRate     string  `json:"acRate"`
    TopicTags  []struct {
        Name string `json:"name"`
    } `json:"topicTags"`
}
