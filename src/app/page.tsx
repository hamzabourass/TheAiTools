"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CVUploadForm } from "@/components/CVUploadForm"
import { AnalysisResults } from "@/components/AnalysisResults"
import { CVFormData, AnalysisResult, initialAnalysisState } from "@/types/types"
import { SignInButton } from "@/components/auth/signin-button"
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to CV Assistant</h1>
          <SignInButton />
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="container py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Optimize your job application with AI-powered CV analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form Section */}
          <div className="dark:bg-gray-800 p-8 shadow-lg rounded-lg">
            <CVUploadForm onSubmit={onSubmit} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          <div className="dark:bg-gray-800 p-8 shadow-lg rounded-lg">
            <AnalysisResults
              analysis={analysis}
              recipientEmail={recipientEmail}
              onSendEmail={handleSendEmail}
            />
          </div>
        </div>
      </div>
    </div>
  )
}