"use client"

import { useState } from "react"
import { Upload, FileText, Briefcase, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [jobRequirements, setJobRequirements] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    analysis: string
    questions: string
  } | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileType = selectedFile.type
      if (
        fileType === "application/pdf" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "请上传文件",
        description: "需要上传简历文件才能进行分析",
      })
      return
    }

    if (!jobRequirements) {
      toast({
        variant: "destructive",
        title: "请输入招聘要求",
        description: "需要输入招聘要求才能进行分析",
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("resume", file)
    formData.append("jobRequirements", jobRequirements)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        formData
      )
      setAnalysis(response.data.data)
      toast({
        title: "分析完成",
        description: "简历分析已完成，请查看结果",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "分析失败",
        description: "请稍后重试",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
      {/* 标题部分 */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent animate-fade-in">
          AI HR Assistant
        </h1>
        <p className="text-muted-foreground">
          智能简历分析 & 面试助手
        </p>
      </div>

      {/* 上传区域 */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="animate-fade-slide-up">
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                上传简历
              </CardTitle>
              <CardDescription>
                支持 PDF 或 Word 格式的简历文件
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300 group">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="resume"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {file ? file.name : "点击或拖拽文件到此处"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file 
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB` 
                        : "最大支持 10MB"}
                    </p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-slide-up [animation-delay:200ms]">
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 h-full">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                招聘要求
              </CardTitle>
              <CardDescription>
                请详细描述职位要求和技能需求
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                id="requirements"
                placeholder="例如：
1. 职位职责：负责产品开发和维护
2. 技能要求：熟悉 React、Node.js
3. 工作经验：3年以上相关经验
4. 教育背景：本科及以上学历"
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                className="min-h-[250px] resize-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分析按钮 */}
      <div className="flex justify-center animate-fade-slide-up [animation-delay:400ms]">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={loading}
          className="px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              分析中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              开始分析
            </span>
          )}
        </Button>
      </div>

      {/* 分析结果 */}
      {analysis && (
        <div className="animate-fade-slide-up">
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                分析结果
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger 
                    value="analysis" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <FileText className="h-4 w-4" />
                    简历分析
                  </TabsTrigger>
                  <TabsTrigger 
                    value="questions"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    面试题目
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="analysis">
                  <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-1">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-6 rounded-lg">
                          {analysis.analysis}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="questions">
                  <div className="mt-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-1">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-6 rounded-lg">
                          {analysis.questions}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 