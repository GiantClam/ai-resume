package models

// 简历筛选请求
type ScreeningRequest struct {
	JobRequirements string   `json:"jobRequirements" binding:"required"`
	Industry        string   `json:"industry" binding:"required"`
	Resumes         []string `json:"resumes"` // base64编码的简历内容
}

// ResumeResult 表示单个简历的分析结果
type ResumeResult struct {
	Name   string `json:"name"`
	Reason string `json:"reason"`
}

// ScreeningResponse 表示简历筛选的API响应
type ScreeningResponse struct {
	Passed []ResumeResult `json:"passed"`
	Failed []ResumeResult `json:"failed"`
}
