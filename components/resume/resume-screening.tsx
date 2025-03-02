"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Briefcase, Building, CheckCircle, XCircle, Loader2, X, Trash2 } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSharedFields } from "@/lib/contexts/shared-fields-context"

interface ScreeningResult {
  passed: Array<{ name: string; reason: string }>
  failed: Array<{ name: string; reason: string }>
}

export function ResumeScreening() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [fileArray, setFileArray] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScreeningResult | null>(null)
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
    const selectedFiles = e.target.files
    if (selectedFiles) {
      validateAndSetFiles(selectedFiles)
    }
  }

  const validateAndSetFiles = (selectedFiles: FileList | File[]) => {
    // 验证所有文件格式
    const allFiles = Array.from(selectedFiles)
    const validFiles = allFiles.every(file => 
      file.type === "application/pdf" || 
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    if (validFiles) {
      // 创建一个合并之前文件和新文件的数组
      let newFileArray = [...fileArray]
      
      // 检查并添加新文件，避免重复（基于文件名）
      allFiles.forEach(file => {
        // 检查文件是否已存在（基于文件名）
        const fileExists = newFileArray.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        )
        
        // 如果文件不存在，添加到数组中
        if (!fileExists) {
          newFileArray.push(file)
        }
      })
      
      // 创建新的DataTransfer对象并添加所有文件
      const dt = new DataTransfer()
      newFileArray.forEach(file => {
        dt.items.add(file)
      })
      
      setFiles(dt.files)
      setFileArray(newFileArray)
      
      // 如果有新文件被添加，显示成功消息
      if (newFileArray.length > fileArray.length) {
        toast({
          title: "文件已添加",
          description: `成功添加了 ${newFileArray.length - fileArray.length} 个文件`,
        })
      }
    } else {
      toast({
        variant: "destructive",
        title: "文件格式错误",
        description: "请只上传 PDF 或 Word 文件",
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
      const droppedFiles = e.dataTransfer.files
      // 显示处理中状态
      toast({
        title: "处理文件中...",
        description: `正在处理 ${droppedFiles.length} 个文件`,
      })
      
      // 稍微延迟以显示处理效果
      setTimeout(() => {
        validateAndSetFiles(droppedFiles)
      }, 300)
    }
  }

  // 通过点击触发文件选择
  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const removeFile = (index: number) => {
    const newFileArray = [...fileArray]
    newFileArray.splice(index, 1)
    setFileArray(newFileArray)
    
    // 创建新的DataTransfer对象并添加剩余文件
    const dt = new DataTransfer()
    newFileArray.forEach(file => {
      dt.items.add(file)
    })
    
    setFiles(dt.files.length > 0 ? dt.files : null)
  }

  // 清空所有已上传文件
  const clearAllFiles = () => {
    setFiles(null)
    setFileArray([])
    toast({
      title: "文件已清空",
      description: "所有已上传的文件已被移除",
    })
  }

  const handleScreening = async () => {
    console.log("简历筛选按钮被点击");
    
    if (!files?.length) {
      console.log("验证失败: 缺少简历文件");
      toast({
        variant: "destructive",
        title: "请上传文件",
        description: "需要上传简历文件才能进行分析",
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
    Array.from(files).forEach(file => {
      formData.append("resumes", file)
    })
    formData.append("jobRequirements", jobRequirements)
    formData.append("industry", industry)
    formData.append("industryKeywords", industryKeywords)


    console.log("开始请求API:", `${API_BASE_URL}/api/resume/screen`);
    console.log("上传文件数量:", files.length);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/resume/screen`,
        formData
      )
      console.log("API响应成功:", response.data);
      setResult(response.data.data)
      toast({
        title: "分析完成",
        description: "简历筛选已完成，请查看结果",
      })
    } catch (error) {
      console.error("API请求失败:", error);
      toast({
        variant: "destructive",
        title: "分析失败",
        description: "请稍后重试或检查控制台日志",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Briefcase className="h-5 w-5 text-blue-500" />
              招聘信息
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
              <FileText className="h-5 w-5 text-blue-500" />
              简历上传
            </CardTitle>
            <CardDescription>
              支持批量上传 PDF 或 Word 格式的简历文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-all duration-300 group
                ${dragActive ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/50" : "hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/50"}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <Input
                ref={inputRef}
                id="resumes"
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="cursor-pointer flex flex-col items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-blue-500 group-hover:text-blue-600" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-sm font-medium">
                    {fileArray.length > 0 
                      ? "继续添加更多文件" 
                      : "点击或拖拽文件到此处"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持多个文件同时上传
                  </p>
                  {fileArray.length > 0 && (
                    <p className="text-xs text-blue-500">
                      当前已有 {fileArray.length} 个文件
                    </p>
                  )}
                </div>
              </div>
            </div>

            {fileArray.length > 0 && (
              <div className="border rounded-md p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs md:text-sm font-medium">已上传 {fileArray.length} 个文件:</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 md:h-8 gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={clearAllFiles}
                  >
                    <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    清空
                  </Button>
                </div>
                <ScrollArea className="h-[120px] md:h-[150px]">
                  <ul className="space-y-2">
                    {fileArray.map((file, index) => (
                      <li key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span className="text-xs md:text-sm truncate" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="px-1.5 text-xs">
                            {(file.size / 1024).toFixed(1)}KB
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">删除</span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleScreening}
          disabled={loading}
          className="w-full md:w-auto px-4 md:px-8 py-5 md:py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-sm md:text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              分析中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              开始筛选
            </span>
          )}
        </Button>
      </div>

      {result && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="border-green-100 dark:border-green-900">
            <CardHeader className="border-b bg-green-50 dark:bg-green-900/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-lg md:text-xl">
                <CheckCircle className="h-5 w-5" />
                通过简历 ({result.passed.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ul className="space-y-4">
                {result.passed.map((item, index) => (
                  <li key={index} className="border-l-4 border-green-500 pl-3 md:pl-4 py-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      <h4 className="font-medium text-green-700 dark:text-green-300 text-sm md:text-base">
                        {item.name}
                      </h4>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-2 md:p-3">
                      <p className="text-xs md:text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                  </li>
                ))}
                {result.passed.length === 0 && (
                  <p className="text-center text-xs md:text-sm text-muted-foreground">无通过简历</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-100 dark:border-red-900">
            <CardHeader className="border-b bg-red-50 dark:bg-red-900/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-lg md:text-xl">
                <XCircle className="h-5 w-5" />
                未通过简历 ({result.failed.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ul className="space-y-4">
                {result.failed.map((item, index) => (
                  <li key={index} className="border-l-4 border-red-500 pl-3 md:pl-4 py-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      <h4 className="font-medium text-red-700 dark:text-red-300 text-sm md:text-base">
                        {item.name}
                      </h4>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-2 md:p-3">
                      <p className="text-xs md:text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                  </li>
                ))}
                {result.failed.length === 0 && (
                  <p className="text-center text-xs md:text-sm text-muted-foreground">无未通过简历</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 