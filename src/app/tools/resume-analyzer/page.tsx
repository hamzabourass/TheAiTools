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
import { AnalysisState, CVFormData, ErrorKey, initialAnalysisState } from "@/types/types"
import { LANG_FOR_OUTPUT, Lang, dictionaries } from "@/lib/i18n/dictionaries"
import { useI18n } from "@/lib/i18n/I18nProvider"

const isErrorKey = (code: unknown): code is ErrorKey =>
  typeof code === "string" && code in dictionaries.en.errors

export default function ResumeAnalyzer() {
  const { data: session, status } = useSession()
  const { t, lang } = useI18n()
  const [analysis, setAnalysis] = useState<AnalysisState>(initialAnalysisState)
  const [reportLang, setReportLang] = useState<Lang>(lang)
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
    setReportLang(LANG_FOR_OUTPUT[data.options.language])
    scrollToResults()

    try {
      const formData = new FormData()
      formData.append("jobDescription", data.jobDescription)
      formData.append("cv", data.cv)
      formData.append("options", JSON.stringify(data.options))

      const response = await fetch("/api/submit", { method: "POST", body: formData })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        const code: ErrorKey = isErrorKey(body?.code) ? body.code : "ANALYSIS_FAILED"
        setAnalysis({ status: "error", result: null, error: code })
        toast.error(t.errors[code])
        return
      }

      setAnalysis({ status: "complete", result: body, error: null })
      scrollToResults()
    } catch (error) {
      console.error("Analysis request failed:", error)
      setAnalysis({ status: "error", result: null, error: "generic" })
      toast.error(t.errors.generic)
    }
  }

  const handleSendEmail = async (email: EmailData) => {
    if (!cvFile) {
      toast.error(t.analyzer.reuploadCv)
      return
    }
    try {
      const formData = new FormData()
      formData.append("to", email.to)
      formData.append("subject", email.subject)
      formData.append("message", email.message)
      formData.append("cv", cvFile)

      const response = await fetch("/api/send-email", { method: "POST", body: formData })
      if (!response.ok) throw new Error(`Send failed with status ${response.status}`)
      toast.success(t.analyzer.emailSent(email.to))
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error(t.analyzer.emailFailed)
    }
  }

  const firstName = session.user?.name?.split(" ")[0]

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="relative overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-medium text-primary">{t.analyzer.greeting(firstName)}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{t.analyzer.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.analyzer.subtitle}</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-6">
                <AnalyzerForm onSubmit={onSubmit} isLoading={analysis.status === "analyzing"} />
              </CardContent>
            </Card>
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {t.analyzer.privacyNote}
            </p>
          </div>

          <div ref={resultsRef} className="scroll-mt-24">
            <AnalysisResults
              state={analysis}
              reportLang={reportLang}
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
