import { ResumeScreening } from "@/components/resume/resume-screening"
import { InterviewQuestions } from "@/components/interview/interview-questions"
import { InterviewSummary } from "@/components/interview/interview-summary"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-16">
        {/* 标题部分 */}
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="AI HR Assistant Logo" 
              width={100} 
              height={100}
              className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] animate-fade-in" 
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in">
            AI HR Assistant
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            智能人力资源助手，为您提供简历筛选、面试题生成和面试总结等智能服务
          </p>
        </div>

        {/* 简历筛选部分 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700 dark:text-blue-300">简历筛选</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-blue-100 dark:border-blue-800">
            <ResumeScreening />
          </div>
        </section>

        {/* 面试题生成部分 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700 dark:text-blue-300">面试题生成</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-blue-100 dark:border-blue-800">
            <InterviewQuestions />
          </div>
        </section>

        {/* 面试总结部分 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700 dark:text-blue-300">面试总结</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-blue-100 dark:border-blue-800">
            <InterviewSummary />
          </div>
        </section>

        {/* 页脚 */}
        <footer className="text-center text-xs md:text-sm text-muted-foreground pt-8 border-t border-blue-200 dark:border-blue-800">
          <p>© 2024 AI HR Assistant. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
} 