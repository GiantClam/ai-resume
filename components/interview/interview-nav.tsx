"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { FileQuestion, Zap } from "lucide-react"

export function InterviewNav() {
  const pathname = usePathname()

  return (
    <div className="pb-4 mb-8 border-b">
      <ButtonGroup>
        <ButtonGroupItem asChild active={pathname === "/interview" || pathname === "/interview/"}>
          <Link href="/interview">
            <FileQuestion className="mr-2 h-4 w-4" />
            标准模式
          </Link>
        </ButtonGroupItem>
        <ButtonGroupItem asChild active={pathname === "/interview/stream"}>
          <Link href="/interview/stream">
            <Zap className="mr-2 h-4 w-4" />
            流式模式
          </Link>
        </ButtonGroupItem>
      </ButtonGroup>
      
      <div className="mt-2 text-sm text-muted-foreground">
        {pathname === "/interview/stream" ? (
          <p>流式模式可以实时查看AI生成过程，避免大模型输出被截断</p>
        ) : (
          <p>标准模式一次性生成所有面试问题</p>
        )}
      </div>
    </div>
  )
} 