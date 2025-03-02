import { Metadata } from "next"

import { InterviewQuestionsStream } from "@/components/interview/interview-questions-stream"
import { InterviewNav } from "@/components/interview/interview-nav"

export const metadata: Metadata = {
  title: "面试问题生成（流式）",
  description: "使用大模型流式生成面试问题",
}

export default function InterviewStreamPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">面试问题生成（流式）</h1>
        <p className="text-muted-foreground">
          使用人工智能流式生成针对特定职位和简历的面试问题，实时查看生成过程
        </p>
      </div>
      
      <InterviewNav />
      <InterviewQuestionsStream />
    </div>
  )
} 