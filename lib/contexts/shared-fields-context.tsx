"use client"

import React, { createContext, useState, useContext, ReactNode } from "react"

// 定义共享字段的类型
interface SharedFieldsContextType {
  industry: string
  setIndustry: (value: string) => void
  industryKeywords: string
  setIndustryKeywords: (value: string) => void
  jobRequirements: string
  setJobRequirements: (value: string) => void
}

// 创建Context
const SharedFieldsContext = createContext<SharedFieldsContextType | undefined>(undefined)

// 创建Provider组件
export function SharedFieldsProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustry] = useState("")
  const [industryKeywords, setIndustryKeywords] = useState("")
  const [jobRequirements, setJobRequirements] = useState("")

  return (
    <SharedFieldsContext.Provider 
      value={{ 
        industry, 
        setIndustry, 
        industryKeywords, 
        setIndustryKeywords, 
        jobRequirements, 
        setJobRequirements 
      }}
    >
      {children}
    </SharedFieldsContext.Provider>
  )
}

// 创建自定义Hook，便于组件使用
export function useSharedFields() {
  const context = useContext(SharedFieldsContext)
  if (context === undefined) {
    throw new Error("useSharedFields must be used within a SharedFieldsProvider")
  }
  return context
} 