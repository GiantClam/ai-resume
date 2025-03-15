package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"unicode/utf8"

	"cloud.google.com/go/vertexai/genai"
	"github.com/GiantClam/ai-resume/models"
	"github.com/GiantClam/ai-resume/services"
	"github.com/GiantClam/ai-resume/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GenerateInterviewQuestions 处理面试题生成请求
func GenerateInterviewQuestions(c *gin.Context) {
	// 解析表单数据
	err := c.Request.ParseMultipartForm(10 << 20) // 10MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无法解析表单"})
		return
	}

	jobRequirements := c.Request.FormValue("jobRequirements")
	industry := c.Request.FormValue("industry")
	industryKeywords := c.Request.FormValue("industryKeywords")

	if jobRequirements == "" || industry == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "招聘要求和行业不能为空"})
		return
	}

	// 获取简历文件
	file, header, err := c.Request.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传简历文件"})
		return
	}
	defer file.Close()

	// 检查文件类型
	ext := filepath.Ext(header.Filename)
	if ext != ".pdf" && ext != ".docx" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "仅支持PDF和Word文件"})
		return
	}

	// 直接从文件流中读取内容而不保存到本地
	content, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法读取文件内容"})
		return
	}

	// 清理文件内容中的无效UTF-8字符
	resumeContent := sanitizeUTF8(string(content))

	// 调用Vertex AI生成面试题
	vertexClient := services.NewVertexAIClient()
	sysInstruction, prompt := services.BuildInterviewQuestionsPrompt(jobRequirements, industry, resumeContent, industryKeywords)

	response, err := vertexClient.GenerateContent(sysInstruction, prompt)
	if err != nil {
		log.Printf("Vertex AI错误: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI生成失败"})
		return
	}

	// 清理响应中的Markdown代码块格式
	cleanedResponse := services.CleanMarkdownCodeBlock(response)
	log.Printf("原始响应长度: %d字节", len(response))
	log.Printf("清理后响应长度: %d字节", len(cleanedResponse))
	log.Printf("清理后的前100个字符: %s", cleanedResponse[:utils.Min(100, len(cleanedResponse))])

	// 添加打印末尾100个字符的日志
	if len(cleanedResponse) > 100 {
		startIdx := utils.Max(0, len(cleanedResponse)-100)
		log.Printf("清理后的后100个字符: %s", cleanedResponse[startIdx:])
	} else {
		log.Printf("清理后的后100个字符与前100个字符相同（响应过短）")
	}

	// 确保JSON格式完整
	cleanedResponse = services.EnsureCompleteJSON(cleanedResponse)

	// 解析AI响应
	var questionsResult models.QuestionsResponse
	if err := json.Unmarshal([]byte(cleanedResponse), &questionsResult); err != nil {
		log.Printf("解析响应失败: %v, 错误类型: %T", err, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法解析AI响应"})
		return
	}

	// 返回完整的问题列表
	finalResponse := models.QuestionsResponse{
		Questions: questionsResult.Questions,
	}

	log.Printf("返回给客户端的数据: %d个问题", len(finalResponse.Questions))
	c.JSON(http.StatusOK, gin.H{"data": finalResponse})
}

// SummarizeInterview 处理面试总结请求
func SummarizeInterview(c *gin.Context) {
	var req models.SummaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	if req.Industry == "" || req.InterviewNotes == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "行业和面试记录是必填字段"})
		return
	}

	// 调用Vertex AI生成面试总结
	vertexClient := services.NewVertexAIClient()
	sysInstruction, prompt := services.BuildInterviewSummaryPrompt(req.JobRequirements, req.Industry, req.InterviewNotes, req.IndustryKeywords)

	response, err := vertexClient.GenerateContent(sysInstruction, prompt)
	if err != nil {
		log.Printf("Vertex AI错误: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI生成失败"})
		return
	}

	// 清理响应中的Markdown代码块格式
	cleanedResponse := services.CleanMarkdownCodeBlock(response)
	log.Printf("原始响应长度: %d字节", len(response))
	log.Printf("清理后响应长度: %d字节", len(cleanedResponse))
	log.Printf("清理后的前100个字符: %s", cleanedResponse[:utils.Min(100, len(cleanedResponse))])

	// 添加打印末尾100个字符的日志
	if len(cleanedResponse) > 100 {
		startIdx := utils.Max(0, len(cleanedResponse)-100)
		log.Printf("清理后的后100个字符: %s", cleanedResponse[startIdx:])
	} else {
		log.Printf("清理后的后100个字符与前100个字符相同（响应过短）")
	}

	// 确保JSON格式完整
	cleanedResponse = services.EnsureCompleteJSON(cleanedResponse)

	// 解析AI响应
	var summaryResult models.SummaryResponse
	if err := json.Unmarshal([]byte(cleanedResponse), &summaryResult); err != nil {
		log.Printf("解析响应失败: %v, 错误类型: %T", err, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法解析AI响应"})
		return
	}

	log.Printf("返回给客户端的数据: %+v", summaryResult)
	c.JSON(http.StatusOK, gin.H{"data": summaryResult})
}

// handleStreamRequest 处理SSE流式请求
func handleStreamRequest(c *gin.Context, sessionId string) {
	// 设置响应头，指定为SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// 创建一个上下文，允许请求取消时终止流
	_, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 处理客户端断开连接
	go func() {
		<-c.Request.Context().Done()
		cancel()
	}()

	// 使用ctx在模拟延迟期间检查取消
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	// 通知客户端连接成功
	fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"connected","message":"SSE连接已建立"}`)
	c.Writer.Flush()

	// 这里应该实现从缓存或数据库中读取对应会话的数据
	// 为了简化，我们直接发送一个模拟的问题集
	mockQuestions := []models.Question{
		{
			Question: "您能描述一下您在上一个项目中的角色和贡献吗？",
			Answer:   "候选人应该清晰描述自己的职责、任务和成就，突出关键贡献和解决的问题。",
			Category: "工作经历",
		},
		{
			Question: "您如何处理项目中的紧急情况或突发问题？",
			Answer:   "理想回答应包含问题识别、优先级确定、解决方案制定和执行的清晰步骤。",
			Category: "问题解决能力",
		},
	}

	// 模拟延迟和流式传输
	fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"generating","message":"正在生成问题..."}`)
	c.Writer.Flush()
	time.Sleep(1 * time.Second)

	// 逐个发送问题，模拟实时生成
	for _, q := range mockQuestions {
		qJSON, _ := json.Marshal(q)
		fmt.Fprintf(c.Writer, "data: %s\n\n", fmt.Sprintf(`{"status":"chunk","content":%q}`, string(qJSON)))
		c.Writer.Flush()
		time.Sleep(500 * time.Millisecond)
	}

	// 发送完成信号
	finalData, _ := json.Marshal(gin.H{
		"status":    "complete",
		"questions": mockQuestions,
	})
	fmt.Fprintf(c.Writer, "data: %s\n\n", string(finalData))
	c.Writer.Flush()
}

// StreamGenerateInterviewQuestions 处理面试题流式生成请求
func StreamGenerateInterviewQuestions(c *gin.Context) {
	// 检查是否是第一次请求或者流式请求
	sessionId := c.Query("sessionId")
	if sessionId != "" {
		// 这是流式请求，处理SSE流
		handleStreamRequest(c, sessionId)
		return
	}

	// 第一次请求，创建会话ID
	sessionId = uuid.New().String()
	c.Header("X-Session-Id", sessionId)

	// 解析表单数据
	err := c.Request.ParseMultipartForm(10 << 20) // 10MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无法解析表单"})
		return
	}

	jobRequirements := c.Request.FormValue("jobRequirements")
	industry := c.Request.FormValue("industry")
	industryKeywords := c.Request.FormValue("industryKeywords")

	if jobRequirements == "" || industry == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "招聘要求和行业不能为空"})
		return
	}

	// 获取简历文件
	file, header, err := c.Request.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传简历文件"})
		return
	}
	defer file.Close()

	// 检查文件类型
	ext := filepath.Ext(header.Filename)
	if ext != ".pdf" && ext != ".docx" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "仅支持PDF和Word文件"})
		return
	}

	// 直接从文件流中读取内容而不保存到本地
	content, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法读取文件内容"})
		return
	}

	// 清理文件内容中的无效UTF-8字符
	resumeContent := sanitizeUTF8(string(content))

	// 设置响应头，指定为SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// 创建一个上下文，允许请求取消时终止流
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 处理客户端断开连接
	go func() {
		<-c.Request.Context().Done()
		cancel()
	}()

	// 使用ctx在模拟延迟期间检查取消
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	// 通知客户端处理开始
	fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"processing","message":"正在处理简历和生成问题..."}`)
	c.Writer.Flush()

	// 调用Vertex AI生成面试题
	vertexClient := services.NewVertexAIClient()
	sysInstruction, prompt := services.BuildInterviewQuestionsPrompt(jobRequirements, industry, resumeContent, industryKeywords)

	// 获取流式响应
	iter, err := vertexClient.GenerateContentStream(ctx, sysInstruction, prompt)
	if err != nil {
		log.Printf("Vertex AI错误: %v", err)
		fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"error","message":"AI生成失败"}`)
		c.Writer.Flush()
		return
	}

	// 累积接收到的文本
	var fullResponse strings.Builder

	// 给客户端发送预备消息
	fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"generating","message":"正在生成面试问题..."}`)
	c.Writer.Flush()

	// 处理流式响应
	for {
		resp, err := iter.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("流处理错误: %v", err)
			fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"error","message":"处理AI响应流时出错"}`)
			c.Writer.Flush()
			return
		}

		// 提取响应内容
		for _, candidate := range resp.Candidates {
			for _, part := range candidate.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					textStr := string(text)
					fullResponse.WriteString(textStr)

					// 每次收到新内容时发送更新
					fmt.Fprintf(c.Writer, "data: %s\n\n", fmt.Sprintf(`{"status":"chunk","content":%q}`, textStr))
					c.Writer.Flush()

					// 给客户端一点时间处理
					time.Sleep(10 * time.Millisecond)
				}
			}
		}
	}

	// 清理和处理最终响应
	finalResponse := fullResponse.String()
	cleanedResponse := services.CleanMarkdownCodeBlock(finalResponse)

	// 确保JSON格式完整
	cleanedResponse = services.EnsureCompleteJSON(cleanedResponse)

	// 解析JSON响应
	var questionsResult models.QuestionsResponse
	if err := json.Unmarshal([]byte(cleanedResponse), &questionsResult); err != nil {
		log.Printf("解析响应失败: %v", err)
		fmt.Fprintf(c.Writer, "data: %s\n\n", `{"status":"error","message":"无法解析AI生成的问题"}`)
		c.Writer.Flush()
		return
	}

	// 发送完成信号和最终的问题列表
	finalData, _ := json.Marshal(gin.H{
		"status":    "complete",
		"questions": questionsResult.Questions,
	})
	fmt.Fprintf(c.Writer, "data: %s\n\n", string(finalData))
	c.Writer.Flush()
}

// 清理UTF-8字符串
func sanitizeUTF8(s string) string {
	if utf8.ValidString(s) {
		return s
	}

	// 创建一个新的字符串构建器
	var builder strings.Builder
	builder.Grow(len(s))

	// 遍历字符串，只保留有效的UTF-8字符
	for i := 0; i < len(s); {
		r, size := utf8.DecodeRuneInString(s[i:])
		if r != utf8.RuneError || size == 1 {
			builder.WriteRune(r)
		}
		i += size
	}

	return builder.String()
}
