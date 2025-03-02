"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Briefcase, CheckCircle, Loader2, Copy, Check } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/constants"
import { useSharedFields } from "@/lib/contexts/shared-fields-context"

interface QuestionResult {
  questions: Array<{
    question: string
    answer: string
    category: string
  }>
}

export function InterviewQuestions() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QuestionResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 使用共享上下文
  const { 
    industry, 
    setIndustry, 
    industryKeywords, 
    setIndustryKeywords, 
    jobRequirements, 
    setJobRequirements 
  } = useSharedFields()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    const fileType = selectedFile.type
    if (
      fileType === "application/pdf" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setFile(selectedFile)
    } else {
      toast({
        variant: "destructive",
        title: "文件格式错误",
        description: "请上传 PDF 或 Word 文件",
      })
    }
  }

  // 处理拖拽事件
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // 处理文件放置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  // 通过点击触发文件选择
  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleGenerate = async () => {
    console.log("面试题生成按钮被点击");
    
    if (!file) {
      console.log("验证失败: 缺少简历文件");
      toast({
        variant: "destructive",
        title: "请上传文件",
        description: "需要上传简历文件才能生成面试题",
      })
      return
    }

    if (!jobRequirements || !industry) {
      console.log("验证失败: 缺少招聘要求或行业信息");
      toast({
        variant: "destructive",
        title: "请填写完整信息",
        description: "招聘要求和行业信息都是必填项",
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("resume", file)
    formData.append("jobRequirements", jobRequirements)
    formData.append("industry", industry)
    formData.append("industryKeywords", industryKeywords)

    console.log("开始请求API:", `${API_BASE_URL}/api/interview/questions`);
    console.log("上传文件:", file.name);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/interview/questions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // 不使用withCredentials，因为使用了AllowAllOrigins
          withCredentials: false
        }
      )
      console.log("API响应成功:", response.data);
      setResult(response.data.data)
      toast({
        title: "生成完成",
        description: "面试题目已生成，请查看结果",
      })
    } catch (error) {
      console.error("API请求失败:", error);
      toast({
        variant: "destructive",
        title: "生成失败",
        description: "请稍后重试或检查控制台日志",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyAllQuestions = async () => {
    if (!result) return;
    
    try {
      const formattedText = result.questions.map((item, index) => {
        return `【问题${index + 1}】${item.category ? `[${item.category}]` : ''}\n问题：${item.question}\n参考答案：${item.answer}\n`;
      }).join('\n');
      
      await navigator.clipboard.writeText(formattedText);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "复制成功",
        description: "所有面试题已复制到剪贴板",
      });
    } catch (error) {
      console.error("复制失败:", error);
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "无法复制到剪贴板，请手动复制",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Briefcase className="h-5 w-5 text-purple-500" />
              职位信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industry">所属行业</Label>
              <Input
                id="industry"
                placeholder="请输入行业，如：互联网、金融、教育等"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industryKeywords">岗位关键词</Label>
              <Input
                id="industryKeywords"
                placeholder="请输入关键词，用逗号分隔"
                value={industryKeywords}
                onChange={(e) => setIndustryKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                输入岗位特性关键词，帮助AI更好理解岗位特点
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">招聘要求</Label>
              <Textarea
                id="requirements"
                placeholder="请详细描述职位要求、技能要求等..."
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                className="min-h-[120px] md:min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <FileText className="h-5 w-5 text-purple-500" />
              简历上传
            </CardTitle>
            <CardDescription>
              上传候选人简历以生成针对性面试题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-all duration-300 group
                ${dragActive ? "border-purple-500 bg-purple-50/80 dark:bg-purple-950/50" : "hover:border-primary/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/50"}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <Input
                ref={inputRef}
                id="resume"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="cursor-pointer flex flex-col items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-purple-500 group-hover:text-purple-600" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-sm font-medium">
                    {file ? file.name : "点击或拖拽文件到此处"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 PDF 或 Word 格式
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full md:w-auto px-4 md:px-8 py-5 md:py-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-sm md:text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              生成中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              生成面试题
            </span>
          )}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl mb-2 md:mb-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
              面试题目
            </CardTitle>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-xs md:text-sm"
              onClick={copyAllQuestions}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  复制全部面试题
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              {result.questions.map((item, index) => (
                <div
                  key={index}
                  className="p-3 md:p-4 rounded-lg bg-muted/30 space-y-2 md:space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium">Q: {item.question}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">A: {item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 