package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/GiantClam/ai-resume/models"
	"github.com/GiantClam/ai-resume/services"
	"github.com/gin-gonic/gin"
)

// ScreenResumes 处理简历筛选请求
func ScreenResumes(c *gin.Context) {
	// 解析表单数据
	err := c.Request.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无法解析表单"})
		return
	}

	jobRequirements := c.Request.FormValue("jobRequirements")
	industry := c.Request.FormValue("industry")

	if jobRequirements == "" || industry == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "招聘要求和行业不能为空"})
		return
	}

	// 处理上传的简历文件
	form, _ := c.MultipartForm()
	files := form.File["resumes"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传至少一份简历"})
		return
	}

	log.Printf("开始处理 %d 份简历", len(files))

	// 最终结果
	allResults := models.ScreeningResponse{
		Passed: []models.ResumeResult{},
		Failed: []models.ResumeResult{},
	}

	// 逐个处理每个简历文件
	for i, file := range files {
		log.Printf("处理简历 %d/%d: %s", i+1, len(files), file.Filename)

		// 检查文件类型
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".pdf" && ext != ".docx" && ext != ".doc" {
			log.Printf("不支持的文件类型: %s", ext)
			allResults.Failed = append(allResults.Failed, models.ResumeResult{
				Name:   file.Filename,
				Reason: "不支持的文件类型，仅支持PDF和Word文件",
			})
			continue
		}

		// 打开文件流
		src, err := file.Open()
		if err != nil {
			log.Printf("无法打开文件 %s: %v", file.Filename, err)
			allResults.Failed = append(allResults.Failed, models.ResumeResult{
				Name:   file.Filename,
				Reason: "文件读取失败",
			})
			continue
		}
		defer src.Close()

		// 直接从文件流读取内容
		content, err := io.ReadAll(src)
		if err != nil {
			log.Printf("无法读取文件 %s: %v", file.Filename, err)
			allResults.Failed = append(allResults.Failed, models.ResumeResult{
				Name:   file.Filename,
				Reason: "文件读取失败",
			})
			continue
		}

		// 确定MIME类型
		mimeType := http.DetectContentType(content)
		log.Printf("文件: %s, MIME类型: %s", file.Filename, mimeType)

		// 创建系统指令和提示
		systemInstruction := fmt.Sprintf(`
			你是一个%s行业的高级招聘专家，精通人才筛选。请基于以下招聘要求和行业，评估简历。

			招聘要求:
			%s

			请分析我提供的简历文件，判断它是否符合招聘要求，并简要说明你的判断理由。
			
			请以下面的JSON格式回复:
			{
			"passed": [
				{"name": "%s", "reason": "通过原因"}
			],
			"failed": [
				{"name": "%s", "reason": "不通过原因"}
			]
			}

			注意：简历只能出现在passed或failed其中一个数组中，不能同时出现在两个数组中。请直接返回JSON，不要使用Markdown代码块，不要添加任何额外的解释。
		`, industry, jobRequirements, file.Filename, file.Filename)

		// 文本提示
		textPrompt := fmt.Sprintf("请分析这份简历是否满足以下职位要求：%s", jobRequirements)

		// 调用Vertex AI分析当前简历文件
		vertexClient := services.NewVertexAIClient()
		log.Printf("开始AI分析简历文件: %s", file.Filename)

		response, err := vertexClient.GenerateContentWithBinaryFile(systemInstruction, string(content), mimeType, textPrompt)
		if err != nil {
			log.Printf("分析简历 %s 时出错: %v", file.Filename, err)
			// 将该简历标记为失败，但继续处理其他简历
			allResults.Failed = append(allResults.Failed, models.ResumeResult{
				Name:   file.Filename,
				Reason: fmt.Sprintf("AI分析失败: %v", err),
			})
			continue
		}

		// 清理响应中的Markdown代码块格式
		cleanedResponse := services.CleanMarkdownCodeBlock(response)
		log.Printf("简历 %s 分析完成，响应长度: %d字节", file.Filename, len(cleanedResponse))

		// 解析当前简历的AI响应
		var screeningResult models.ScreeningResponse
		if err := json.Unmarshal([]byte(cleanedResponse), &screeningResult); err != nil {
			log.Printf("解析简历 %s 的响应失败: %v", file.Filename, err)

			// 尝试修复JSON格式
			if len(cleanedResponse) > 0 {
				fixedJson := services.TryFixJsonFormat(cleanedResponse)
				if err := json.Unmarshal([]byte(fixedJson), &screeningResult); err != nil {
					log.Printf("尝试修复后仍解析失败: %v", err)
					// 将该简历标记为失败，但继续处理其他简历
					allResults.Failed = append(allResults.Failed, models.ResumeResult{
						Name:   file.Filename,
						Reason: "简历解析失败",
					})
					continue
				} else {
					log.Printf("JSON修复成功，继续处理简历 %s", file.Filename)
				}
			} else {
				// 将该简历标记为失败，但继续处理其他简历
				allResults.Failed = append(allResults.Failed, models.ResumeResult{
					Name:   file.Filename,
					Reason: "简历解析失败",
				})
				continue
			}
		}

		// 确保返回的结果使用正确的文件名
		for i := range screeningResult.Passed {
			if screeningResult.Passed[i].Name == "简历文件名" || screeningResult.Passed[i].Name == "" {
				screeningResult.Passed[i].Name = file.Filename
			}
		}

		for i := range screeningResult.Failed {
			if screeningResult.Failed[i].Name == "简历文件名" || screeningResult.Failed[i].Name == "" {
				screeningResult.Failed[i].Name = file.Filename
			}
		}

		// 如果AI没有提供任何结果，默认将该简历标记为通过
		if len(screeningResult.Passed) == 0 && len(screeningResult.Failed) == 0 {
			log.Printf("简历 %s 没有明确结果，默认标记为通过", file.Filename)
			allResults.Passed = append(allResults.Passed, models.ResumeResult{
				Name:   file.Filename,
				Reason: "简历符合基本要求",
			})
		} else {
			// 合并结果
			passedCount := len(screeningResult.Passed)
			failedCount := len(screeningResult.Failed)
			log.Printf("简历 %s 分析结果: 通过 %d 条, 未通过 %d 条", file.Filename, passedCount, failedCount)

			allResults.Passed = append(allResults.Passed, screeningResult.Passed...)
			allResults.Failed = append(allResults.Failed, screeningResult.Failed...)
		}
	}

	totalPassed := len(allResults.Passed)
	totalFailed := len(allResults.Failed)
	log.Printf("简历筛选完成: 共分析 %d 份简历, 通过 %d 份, 不通过 %d 份", len(files), totalPassed, totalFailed)

	c.JSON(http.StatusOK, gin.H{"data": allResults})
}

// extractTextFromFile 从PDF或Word文件中提取文本
func extractTextFromFile(file io.Reader, fileType string) (string, error) {
	// 实际应用中，您需要使用专门的库来解析PDF和Word文件
	// 这里只是简单地读取文件内容
	content, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	// 这里简化处理：返回原始内容
	// 在实际项目中，应该使用专门的库解析PDF/Word并提取文本
	return string(content), nil
}
