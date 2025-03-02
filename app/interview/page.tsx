import { Metadata } from "next"

import { InterviewQuestions } from "@/components/interview/interview-questions"
import { InterviewNav } from "@/components/interview/interview-nav"

export const metadata: Metadata = {
  title: "面试问题生成",
  description: "使用人工智能生成面试问题",
}

export default function InterviewPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">面试问题生成</h1>
        <p className="text-muted-foreground">
          使用人工智能生成针对特定职位和简历的面试问题
        </p>
      </div>
      
      <InterviewNav />
      <InterviewQuestions />
    </div>
  )
} 