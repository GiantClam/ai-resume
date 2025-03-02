"use client"

import { useState } from "react"
import { Upload, FileText, Briefcase, CheckCircle, Loader2 } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/constants"
import { useSharedFields } from "@/lib/contexts/shared-fields-context"

interface SummaryResult {
  overall: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  furtherQuestions?: string[]
  riskPoints?: string[]
  suggestions?: string[]
}

export function InterviewSummary() {
  const [interviewNotes, setInterviewNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const { toast } = useToast()
  
  // 使用共享上下文
  const { 
    industry, 
    setIndustry, 
    industryKeywords, 
    setIndustryKeywords, 
    jobRequirements, 
    setJobRequirements 
  } = useSharedFields()

  const handleSummarize = async () => {
    console.log("生成总结按钮被点击");
    
    if (!interviewNotes) {
      console.log("验证失败: 缺少面试记录");
      toast({
        variant: "destructive",
        title: "请输入面试记录",
        description: "需要面试记录才能生成总结",
      })
      return
    }

    if (!industry) {
      console.log("验证失败: 缺少行业信息");
      toast({
        variant: "destructive",
        title: "请填写完整信息",
        description: "行业信息是必填项",
      })
      return
    }

    setLoading(true)
    console.log("开始请求API:", `${API_BASE_URL}/api/interview/summary`);
    console.log("请求数据:", { interviewNotes, industry, industryKeywords });
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/interview/summary`,
        {
          interviewNotes,
          industry,
          industryKeywords,
        },
        {
          // 不使用withCredentials，因为使用了AllowAllOrigins
          withCredentials: false
        }
      )
      console.log("API响应成功:", response.data);
      setResult(response.data.data)
      toast({
        title: "生成完成",
        description: "面试总结已生成，请查看结果",
      })
    } catch (error: any) {
      console.error("API请求失败:", error);
      let errorMessage = "请稍后重试或检查控制台日志";
      if (error.response) {
        console.error("错误状态:", error.response.status);
        console.error("错误数据:", error.response.data);
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      toast({
        variant: "destructive",
        title: "生成失败",
        description: errorMessage,
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
              <Briefcase className="h-5 w-5 text-cyan-500" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <FileText className="h-5 w-5 text-cyan-500" />
              面试记录
            </CardTitle>
            <CardDescription>
              输入面试过程中的问答记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="请输入面试记录，包括问题和答案..."
              className="min-h-[200px] md:min-h-[250px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSummarize}
          disabled={loading}
          className="w-full md:w-auto px-4 md:px-8 py-5 md:py-6 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-sm md:text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              生成中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              生成总结
            </span>
          )}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <CheckCircle className="h-5 w-5 text-green-500" />
              面试总结
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-medium">总体评价</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{result.overall}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-medium">优势</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="text-xs md:text-sm text-muted-foreground">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-medium">不足</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-xs md:text-sm text-muted-foreground">
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>

            {result.furtherQuestions && result.furtherQuestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-medium">需进一步了解的问题</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.furtherQuestions.map((question, index) => (
                    <li key={index} className="text-xs md:text-sm text-muted-foreground">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.riskPoints && result.riskPoints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-medium">风险点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.riskPoints.map((risk, index) => (
                    <li key={index} className="text-xs md:text-sm text-muted-foreground">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-medium">建议</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-xs md:text-sm text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-medium">录用建议</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 