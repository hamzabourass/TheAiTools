"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CVUploadForm } from "@/components/CVUploadForm"
import { AnalysisResults } from "@/components/AnalysisResults"
import { CVFormData, AnalysisResult, initialAnalysisState } from "@/types/types"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"
import { toast } from 'sonner' // Import toast from sonner

export default function ResumeAnalyzer() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysisState)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null) // Add state for CV file

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
      setCvFile(data.cv[0]) // Store the CV file

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

  const handleSendEmail = async (emailData: { to: string; subject: string; message: string }) => {
    try {
      const formData = new FormData()
      formData.append("to", emailData.to)
      formData.append("subject", emailData.subject)
      formData.append("message", emailData.message)

      // Append the CV file if it exists
      if (cvFile) {
        formData.append("cv", cvFile)
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      const result = await response.json()
      console.log("Email sent successfully:", result)

      // Show success toast
      toast.success("Email sent successfully!", {
        position: "top-center",
        duration: 3000, // 3 seconds
      })
    } catch (error) {
      console.error("Error sending email:", error)

      // Show error toast
      toast.error("Failed to send email. Please try again.", {
        position: "top-center",
        duration: 3000,
      })
    }
  }

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="text-center py-8 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CV Assistant
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Optimize your job application with AI-powered CV analysis
        </p>
      </div>
      <div className="container mx-auto py-10 px-4">
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