"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, FileText, Briefcase, CheckCircle, Loader2, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"

interface Question {
  question: string
  answer: string
  category: string
}

export function InterviewQuestionsStream() {
  const [file, setFile] = useState<File | null>(null)
  const [jobRequirements, setJobRequirements] = useState("")
  const [industry, setIndustry] = useState("")
  const [industryKeywords, setIndustryKeywords] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  const [currentResponse, setCurrentResponse] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const eventSourceRef = useRef<EventSource | null>(null)

  // 组件卸载时关闭EventSource
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
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
  }

  const handleGenerateStream = async () => {
    console.log("流式面试题生成按钮被点击")
    
    if (!file) {
      console.log("验证失败: 缺少简历文件")
      toast({
        variant: "destructive",
        title: "请上传文件",
        description: "需要上传简历文件才能生成面试题",
      })
      return
    }

    if (!jobRequirements || !industry) {
      console.log("验证失败: 缺少招聘要求或行业信息")
      toast({
        variant: "destructive",
        title: "请填写完整信息",
        description: "招聘要求和行业信息都是必填项",
      })
      return
    }

    // 重置状态
    setLoading(true)
    setProgress(0)
    setQuestions([])
    setStatusMessage("准备生成面试问题...")
    setCurrentResponse("")
    
    // 关闭之前可能存在的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // 准备表单数据
    const formData = new FormData()
    formData.append("resume", file)
    formData.append("jobRequirements", jobRequirements)
    formData.append("industry", industry)
    formData.append("industryKeywords", industryKeywords)

    try {
      // 使用fetch发送初始请求
      const response = await fetch(`${API_BASE_URL}/api/interview/questions/stream`, {
        method: 'POST',
        body: formData,
        // 不使用credentials，因为使用了AllowAllOrigins
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      // 创建EventSource处理流式响应
      const sessionId = response.headers.get('X-Session-Id')
      if (!sessionId) {
        throw new Error('没有收到会话ID')
      }
      
      const url = new URL(`${API_BASE_URL}/api/interview/questions/stream`)
      url.searchParams.append('sessionId', sessionId)
      const eventSource = new EventSource(url.toString())
      eventSourceRef.current = eventSource

      // 处理流事件
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.status) {
            case 'processing':
              setStatusMessage(data.message || "处理中...")
              setProgress(10)
              break
              
            case 'generating':
              setStatusMessage(data.message || "AI生成中...")
              setProgress(30)
              break
              
            case 'chunk':
              // 增量更新当前响应
              setCurrentResponse(prev => prev + (data.content || ""))
              setProgress(prev => Math.min(prev + 2, 95)) // 缓慢增加进度
              break
              
            case 'complete':
              setProgress(100)
              setStatusMessage("生成完成!")
              
              if (data.questions && Array.isArray(data.questions)) {
                setQuestions(data.questions)
              }
              
              eventSource.close()
              setLoading(false)
              toast({
                title: "生成完成",
                description: "面试题目已生成，请查看结果",
              })
              break
              
            case 'error':
              setStatusMessage(`错误: ${data.message || "生成失败"}`)
              eventSource.close()
              setLoading(false)
              toast({
                variant: "destructive",
                title: "生成失败",
                description: data.message || "请稍后重试",
              })
              break
          }
        } catch (e) {
          console.error("解析事件数据错误:", e)
        }
      }

      eventSource.onerror = (error) => {
        console.error("事件流错误:", error)
        eventSource.close()
        setLoading(false)
        toast({
          variant: "destructive",
          title: "连接错误",
          description: "与服务器的连接中断，请重试",
        })
      }
    } catch (error) {
      console.error("流请求错误:", error)
      setLoading(false)
      toast({
        variant: "destructive",
        title: "请求失败",
        description: "无法启动流式生成，请检查网络连接",
      })
    }
  }

  const copyAllQuestions = async () => {
    if (questions.length === 0) return;
    
    try {
      const formattedText = questions.map((item, index) => {
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              <Label htmlFor="industryKeywords-stream">行业关键词</Label>
              <Input
                id="industryKeywords-stream"
                placeholder="请输入关键词，用逗号分隔，如：人工智能,大数据,云计算"
                value={industryKeywords}
                onChange={(e) => setIndustryKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                输入行业特性关键词，帮助AI更好理解行业特点，生成更有针对性的面试题
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">招聘要求</Label>
              <Textarea
                id="requirements"
                placeholder="请详细描述职位要求、技能要求等..."
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              简历上传
            </CardTitle>
            <CardDescription>
              上传候选人简历以生成针对性面试题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/50 transition-all duration-300 group">
              <Input
                id="resume-stream"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="resume-stream"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-purple-500 group-hover:text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {file ? file.name : "点击或拖拽文件到此处"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 PDF 或 Word 格式
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={handleGenerateStream}
          disabled={loading}
          className="px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {statusMessage || "生成中..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              生成面试题（流式）
            </span>
          )}
        </Button>
        
        {loading && (
          <div className="w-full max-w-md">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center mt-2 text-muted-foreground">{statusMessage}</p>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              面试题目
            </CardTitle>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={copyAllQuestions}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制全部面试题
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/30 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.category || "未分类"}
                    </span>
                  </div>
                  <p className="font-medium">Q: {item.question}</p>
                  <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentResponse && loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              正在生成的内容
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm">{currentResponse}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 