"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"
import { Header } from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { AnalyzerForm } from "@/components/cv-analyzer/AnalyzerForm"
import { AnalysisResults } from "@/components/cv-analyzer/AnalysisResults"
import type { EmailData } from "@/components/cv-analyzer/EmailPanel"
import { AnalysisState, CVFormData, initialAnalysisState } from "@/types/types"

export default function ResumeAnalyzer() {
  const { data: session, status } = useSession()
  const [analysis, setAnalysis] = useState<AnalysisState>(initialAnalysisState)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    redirect("/signin?callbackUrl=/tools/resume-analyzer")
  }

  const scrollToResults = () => {
    // On small screens the results sit below the form.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  async function onSubmit(data: CVFormData) {
    setAnalysis({ status: "analyzing", result: null, error: null })
    setRecipientEmail(data.email)
    setCvFile(data.cv)
    scrollToResults()

    try {
      const formData = new FormData()
      formData.append("jobDescription", data.jobDescription)
      formData.append("cv", data.cv)
      formData.append("options", JSON.stringify(data.options))

      const response = await fetch("/api/submit", { method: "POST", body: formData })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || "The analysis could not be completed. Please try again.")
      }

      setAnalysis({ status: "complete", result: body, error: null })
      scrollToResults()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again."
      setAnalysis({ status: "error", result: null, error: message })
      toast.error(message)
    }
  }

  const handleSendEmail = async (email: EmailData) => {
    if (!cvFile) {
      toast.error("Upload your CV again to attach it to the email.")
      return
    }
    try {
      const formData = new FormData()
      formData.append("to", email.to)
      formData.append("subject", email.subject)
      formData.append("message", email.message)
      formData.append("cv", cvFile)

      const response = await fetch("/api/send-email", { method: "POST", body: formData })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Failed to send email")
      }
      toast.success(`Email sent to ${email.to}`)
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email. Please try again.")
    }
  }

  const firstName = session.user?.name?.split(" ")[0]

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="no-print relative overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-medium text-primary">{firstName ? `Hi ${firstName} 👋` : "Welcome 👋"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">CV Analyzer</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            See how your CV stacks up against a specific job — requirement by requirement — and get a clear plan to improve it.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="no-print space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-6">
                <AnalyzerForm onSubmit={onSubmit} isLoading={analysis.status === "analyzing"} />
              </CardContent>
            </Card>
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Your CV is only used to run this analysis and isn&apos;t saved by The AI Tools.
            </p>
          </div>

          <div ref={resultsRef} className="scroll-mt-24">
            <AnalysisResults
              state={analysis}
              recipientEmail={recipientEmail}
              cvFileName={cvFile?.name}
              onSendEmail={handleSendEmail}
              onReset={() => setAnalysis(initialAnalysisState)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
