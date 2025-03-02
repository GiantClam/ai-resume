package models

// 面试题生成请求
type QuestionsRequest struct {
	JobRequirements string `json:"jobRequirements" binding:"required"`
	Industry        string `json:"industry" binding:"required"`
	Resume          string `json:"resume"` // base64编码的简历内容
}

// Question 表示一个面试问题
type Question struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Category string `json:"category"`
}

// QuestionsResponse 表示面试题生成的API响应
type QuestionsResponse struct {
	Questions []Question `json:"questions"`
}

// 面试总结请求
type SummaryRequest struct {
	JobRequirements  string `json:"jobRequirements"`
	Industry         string `json:"industry" binding:"required"`
	InterviewNotes   string `json:"interviewNotes" binding:"required"`
	IndustryKeywords string `json:"industryKeywords"`
}

// SummaryResponse 表示面试总结的API响应
type SummaryResponse struct {
	Overall          string   `json:"overall"`
	Strengths        []string `json:"strengths"`
	Weaknesses       []string `json:"weaknesses"`
	Recommendation   string   `json:"recommendation"`
	FurtherQuestions []string `json:"furtherQuestions"` // 需进一步了解的问题
	RiskPoints       []string `json:"riskPoints"`       // 风险点
	Suggestions      []string `json:"suggestions"`      // 建议
}
