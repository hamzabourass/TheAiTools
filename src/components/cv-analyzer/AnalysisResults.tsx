"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  CircleDashed,
  FileDown,
  FileSearch,
  Lightbulb,
  ListChecks,
  Loader2,
  Mail,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { CVAnalysis, RequirementMatch } from "@/lib/ai/cv/schema"
import { SCORE_WEIGHTS } from "@/lib/ai/cv/scoring"
import { Lang, dictionaries } from "@/lib/i18n/dictionaries"
import { useI18n } from "@/lib/i18n/I18nProvider"
import type { AnalysisState } from "@/types/types"
import { ScoreBar, ScoreRing, getVerdict } from "./score"
import { EmailPanel, EmailData } from "./EmailPanel"

type AnalysisResultsProps = {
  state: AnalysisState
  reportLang: Lang
  recipientEmail: string
  cvFileName?: string
  onSendEmail: (email: EmailData) => Promise<void>
  onReset: () => void
}

export function AnalysisResults({ state, reportLang, recipientEmail, cvFileName, onSendEmail, onReset }: AnalysisResultsProps) {
  const { t } = useI18n()

  if (state.status === "analyzing") return <AnalyzingState />
  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t.results.failedTitle}</AlertTitle>
        <AlertDescription>{t.errors[state.error ?? "generic"]}</AlertDescription>
      </Alert>
    )
  }
  if (state.status === "complete" && state.result) {
    return (
      <CompleteState
        analysis={state.result}
        reportLang={reportLang}
        recipientEmail={recipientEmail}
        cvFileName={cvFileName}
        onSendEmail={onSendEmail}
        onReset={onReset}
      />
    )
  }
  return <IdleState />
}

/* ------------------------------------------------------------------ */

const IDLE_ICONS = [Target, ListChecks, Lightbulb, FileDown]

function IdleState() {
  const { t } = useI18n()
  return (
    <Card className="border-dashed bg-muted/20 shadow-none">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileSearch className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-semibold">{t.results.idleTitle}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{t.results.idleText}</p>
        <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
          {t.results.idleItems.map((item, index) => {
            const Icon = IDLE_ICONS[index]
            return (
              <div key={item.title} className="flex gap-3 rounded-xl border bg-background p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyzingState() {
  const { t } = useI18n()
  const steps = t.results.steps
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 4000)
    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <ol className="space-y-3">
          {steps.map((label, index) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              {index < step ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : index === step ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <CircleDashed className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span className={cn(index > step && "text-muted-foreground")}>{label}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">{t.results.takesTime}</p>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const
const PRIORITY_STYLE = {
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
} as const

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "bad" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "good" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "bad" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        tone === "neutral" && "bg-secondary text-secondary-foreground"
      )}
    >
      {children}
    </span>
  )
}

function ChipList({ items, tone, empty }: { items: string[]; tone?: "neutral" | "good" | "bad"; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Chip key={item} tone={tone}>{item}</Chip>
      ))}
    </div>
  )
}

function RequirementRow({ match }: { match: RequirementMatch }) {
  const { t } = useI18n()
  const Icon = match.status === "met" ? CheckCircle2 : match.status === "partial" ? CircleDashed : XCircle
  return (
    <li className="flex gap-3 py-3">
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          match.status === "met" && "text-emerald-500",
          match.status === "partial" && "text-amber-500",
          match.status === "missing" && "text-rose-500"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{match.requirement}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              match.importance === "must" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {match.importance === "must" ? t.results.mustHave : t.results.niceToHave}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {match.evidence ? `“${match.evidence}”` : t.results.noEvidence}
        </p>
      </div>
    </li>
  )
}

type CompleteStateProps = {
  analysis: CVAnalysis
  reportLang: Lang
  recipientEmail: string
  cvFileName?: string
  onSendEmail: (email: EmailData) => Promise<void>
  onReset: () => void
}

function CompleteState({ analysis, reportLang, recipientEmail, cvFileName, onSendEmail, onReset }: CompleteStateProps) {
  const { t } = useI18n()
  const [isExporting, setIsExporting] = useState(false)
  const verdict = getVerdict(analysis.matchScore)
  const b = analysis.scoreBreakdown
  const requirements = [...analysis.requirementMatches].sort(
    (a, c) => Number(a.importance === "nice") - Number(c.importance === "nice")
  )
  const metCount = requirements.filter((r) => r.status === "met").length
  const improvements = [...analysis.improvements].sort((a, c) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[c.priority])
  const hasInterview = analysis.interviewQuestions.length > 0
  const hasEmail = Boolean(analysis.generatedEmail.body)
  const { relevantYears, requiredYears } = analysis.experience

  // The PDF is labelled in the language the analysis was written in.
  const downloadPdf = async () => {
    setIsExporting(true)
    try {
      const [{ jsPDF }, { buildPdfReport, reportFileName }] = await Promise.all([import("jspdf"), import("./pdfReport")])
      buildPdfReport(jsPDF, analysis, dictionaries[reportLang], reportLang).save(reportFileName(analysis))
    } catch (error) {
      console.error("PDF export failed:", error)
      toast.error(t.results.pdfFailed)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="overflow-hidden">
        <div className={cn("h-1.5", verdict.bar)} />
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <ScoreRing score={analysis.matchScore} caption={t.results.outOf100} />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="space-y-1">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", verdict.soft, verdict.text)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.results.verdicts[verdict.key]}
                </span>
                <h2 className="text-xl font-semibold tracking-tight">
                  {analysis.targetRole || t.results.defaultTitle}
                  {analysis.seniority && <span className="font-normal text-muted-foreground"> · {analysis.seniority}</span>}
                </h2>
                {analysis.candidateName && <p className="text-sm text-muted-foreground">{analysis.candidateName}</p>}
              </div>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
              <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
                <Button size="sm" onClick={downloadPdf} disabled={isExporting}>
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                  {isExporting ? t.results.generatingPdf : t.results.downloadPdf}
                </Button>
                <Button size="sm" variant="ghost" onClick={onReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.results.newAnalysis}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.results.breakdownTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <ScoreBar label={t.results.breakdown.technicalSkills} value={b.technicalSkills} weight={SCORE_WEIGHTS.technicalSkills} />
          <ScoreBar label={t.results.breakdown.experience} value={b.experience} weight={SCORE_WEIGHTS.experience} />
          <ScoreBar label={t.results.breakdown.keywords} value={b.keywords} weight={SCORE_WEIGHTS.keywords} />
          <ScoreBar label={t.results.breakdown.education} value={b.education} weight={SCORE_WEIGHTS.education} />
          <ScoreBar label={t.results.breakdown.softSkills} value={b.softSkills} weight={SCORE_WEIGHTS.softSkills} />
          <div className="flex items-end text-xs text-muted-foreground">{t.results.capNote}</div>
        </CardContent>
      </Card>

      {/* Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">{t.results.tabs.overview}</TabsTrigger>
          <TabsTrigger value="requirements">
            {t.results.tabs.requirements} <span className="ml-1.5 text-xs text-muted-foreground">{metCount}/{requirements.length}</span>
          </TabsTrigger>
          <TabsTrigger value="improvements">
            {t.results.tabs.improvements} <span className="ml-1.5 text-xs text-muted-foreground">{improvements.length}</span>
          </TabsTrigger>
          {hasInterview && <TabsTrigger value="interview">{t.results.tabs.interview}</TabsTrigger>}
          {hasEmail && <TabsTrigger value="email">{t.results.tabs.email}</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t.results.strengths}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength) => (
                  <li key={strength} className="flex gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" />
                {t.results.experience}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{relevantYears}</p>
                  <p className="text-xs text-muted-foreground">{t.results.relevantYears}</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{requiredYears != null ? `${requiredYears}+` : "—"}</p>
                  <p className="text-xs text-muted-foreground">{t.results.yearsRequired}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.experience.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.results.skillsFound}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.results.technical}</p>
                <ChipList items={analysis.technicalSkills} empty={t.results.noTechnical} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.results.soft}</p>
                <ChipList items={analysis.softSkills} empty={t.results.noSoft} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">{t.results.reqTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {requirements.map((match) => (
                  <RequirementRow key={`${match.importance}-${match.requirement}`} match={match} />
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.results.atsTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.results.atsHint}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.results.missingCount(analysis.keywords.missing.length)}
                </p>
                <ChipList items={analysis.keywords.missing} tone="bad" empty={t.results.noneMissing} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.results.foundCount(analysis.keywords.present.length)}
                </p>
                <ChipList items={analysis.keywords.present} tone="good" empty={t.results.noneFound} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-3">
          {improvements.map((item, index) => (
            <Card key={`${item.title}-${index}`}>
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_STYLE[item.priority])}>
                      {t.results.priority[item.priority]}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {item.section}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {hasInterview && (
          <TabsContent value="interview">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <Accordion type="single" collapsible defaultValue="q-0">
                  {analysis.interviewQuestions.map((item, index) => (
                    <AccordionItem key={item.question} value={`q-${index}`} className="last:border-b-0">
                      <AccordionTrigger className="px-2 text-left text-sm">{item.question}</AccordionTrigger>
                      <AccordionContent className="px-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t.results.tip} </span>
                        {item.tip}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasEmail && (
          <TabsContent value="email">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-primary" />
                  {t.results.emailTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmailPanel
                  recipientEmail={recipientEmail}
                  subject={analysis.generatedEmail.subject}
                  body={analysis.generatedEmail.body}
                  cvFileName={cvFileName}
                  onSend={onSendEmail}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
