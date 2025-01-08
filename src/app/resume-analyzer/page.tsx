"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CVUploadForm } from "@/components/CVUploadForm"
import { AnalysisResults } from "@/components/AnalysisResults"
import { CVFormData, AnalysisResult, initialAnalysisState } from "@/types/types"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysisState)
  const [recipientEmail, setRecipientEmail] = useState("")

  if (status === "loading") {
    return <div>Loading...</div>
  }

if (!session) {
    redirect('/signin')
  }

  
  async function onSubmit(data: CVFormData) {
    try {
      setIsLoading(true)
      setAnalysis(prev => ({ ...prev, status: 'analyzing' }))
      setRecipientEmail(data.email)

      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("jobDescription", data.jobDescription)
      formData.append("cv", data.cv[0])

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData
      })

      if (!response.ok) throw new Error("Analysis failed")

      const result = await response.json()
      setAnalysis({
        ...initialAnalysisState,
        ...result,
        status: 'complete'
      })
    } catch (error) {
      console.error(error)
      setAnalysis(prev => ({ ...prev, status: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = (emailData: { to: string; subject: string; message: string }) => {
    const mailtoLink = `mailto:${encodeURIComponent(emailData.to)}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`
    window.location.href = mailtoLink
  }

  return (
    <div className="min-h-screen  dark:from-gray-900 dark:to-gray-800">
      <Header/>
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Optimize your job application with AI-powered CV analysis
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-7xl">
            {/* Form Section */}
            <div className="dark:bg-gray-800 p-6 shadow-lg h-fit">
              <CVUploadForm onSubmit={onSubmit} isLoading={isLoading} />
            </div>

            {/* Results Section */}
            <div className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
              <div className="pl-8">
                <AnalysisResults
                  analysis={analysis}
                  recipientEmail={recipientEmail}
                  onSendEmail={handleSendEmail}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}