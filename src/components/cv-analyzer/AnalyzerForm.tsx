"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, FileText, Loader2, Mail, Settings2, Sparkles, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ACCEPTED_CV_EXTENSIONS,
  CVFormData,
  ErrorKey,
  MIN_JOB_DESCRIPTION_LENGTH,
  formSchema,
} from "@/types/types"
import { EMAIL_TONES, OUTPUT_LANGUAGES, defaultAnalysisOptions } from "@/lib/ai/cv/schema"
import { OUTPUT_LANGUAGE_FOR } from "@/lib/i18n/dictionaries"
import { useI18n } from "@/lib/i18n/I18nProvider"

type AnalyzerFormProps = {
  onSubmit: (data: CVFormData) => Promise<void>
  isLoading: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StepTitle({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {step}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

// Validation messages are translation keys (see formSchema).
function FieldError({ message }: { message?: string }) {
  const { t } = useI18n()
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {t.errors[message as ErrorKey] ?? message}
    </p>
  )
}

export function AnalyzerForm({ onSubmit, isLoading }: AnalyzerFormProps) {
  const { t, lang } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const form = useForm<CVFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      email: "",
      options: { ...defaultAnalysisOptions, language: OUTPUT_LANGUAGE_FOR[lang] },
    },
  })

  // Switching the interface language also switches the report language.
  useEffect(() => {
    form.setValue("options.language", OUTPUT_LANGUAGE_FOR[lang])
  }, [lang, form])
  const { errors } = form.formState
  const jobDescription = form.watch("jobDescription") || ""
  const includeEmail = form.watch("options.includeEmail")
  // Keep the options open while they hold a validation error the user needs to see.
  const optionsOpen = showOptions || !!errors.email

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" noValidate>
      {/* Step 1: CV */}
      <section className="space-y-3">
        <StepTitle step={1} title={t.form.step1Title} hint={t.form.step1Hint} />
        <Controller
          control={form.control}
          name="cv"
          render={({ field }) => {
            const file = field.value as File | undefined
            const pickFile = (picked?: File) => {
              if (!picked) return
              field.onChange(picked)
              form.trigger("cv")
            }

            if (file) {
              return (
                <div className="flex items-center gap-3 rounded-xl border bg-accent/40 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t.form.removeFile}
                    disabled={isLoading}
                    onClick={() => {
                      field.onChange(undefined)
                      if (inputRef.current) inputRef.current.value = ""
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            }

            return (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  pickFile(e.dataTransfer.files?.[0])
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50",
                  errors.cv && "border-destructive/60"
                )}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <p className="text-sm">
                  <span className="font-medium text-primary">{t.form.clickToUpload}</span> {t.form.dragDrop}
                </p>
                <p className="text-xs text-muted-foreground">{t.form.fileHint}</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_CV_EXTENSIONS.join(",")}
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </div>
            )
          }}
        />
        <FieldError message={errors.cv?.message?.toString()} />
      </section>

      {/* Step 2: job description */}
      <section className="space-y-3">
        <StepTitle step={2} title={t.form.step2Title} hint={t.form.step2Hint} />
        <Textarea
          {...form.register("jobDescription")}
          placeholder={t.form.jdPlaceholder}
          className={cn("min-h-[200px] resize-y", errors.jobDescription && "border-destructive")}
        />
        <div className="flex items-center justify-between">
          <FieldError message={errors.jobDescription?.message} />
          <span
            className={cn(
              "ml-auto shrink-0 whitespace-nowrap pl-2 text-xs tabular-nums",
              jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH ? "text-muted-foreground" : "text-emerald-600"
            )}
          >
            {t.form.chars(jobDescription.trim().length)}
          </span>
        </div>
      </section>

      {/* Step 3: options */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={optionsOpen}
        >
          <StepTitle step={3} title={t.form.step3Title} hint={t.form.step3Hint} />
          <Settings2 className={cn("h-4 w-4 text-muted-foreground transition-transform", optionsOpen && "rotate-90")} />
        </button>

        {optionsOpen && (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t.form.reportLanguage}</Label>
                <Controller
                  control={form.control}
                  name="options.language"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>{t.form.outputLanguages[language]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t.form.emailTone}</Label>
                <Controller
                  control={form.control}
                  name="options.tone"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!includeEmail}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TONES.map((tone) => (
                          <SelectItem key={tone} value={tone}>{t.form.tones[tone]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <Controller
              control={form.control}
              name="options.includeEmail"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-medium">{t.form.writeEmail}</span>
                    <span className="block text-xs text-muted-foreground">{t.form.writeEmailHint}</span>
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <Controller
              control={form.control}
              name="options.includeInterviewPrep"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-medium">{t.form.interviewPrep}</span>
                    <span className="block text-xs text-muted-foreground">{t.form.interviewPrepHint}</span>
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />

            {includeEmail && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  {t.form.recruiterEmail} <span className="font-normal text-muted-foreground">{t.form.optional}</span>
                </Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="recruiter@company.com"
                  className={cn("bg-background", errors.email && "border-destructive")}
                />
                <FieldError message={errors.email?.message} />
              </div>
            )}
          </div>
        )}
      </section>

      <Button type="submit" disabled={isLoading} size="lg" className="h-12 w-full text-base">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.form.analyzing}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            {t.common.analyzeMyCv}
          </>
        )}
      </Button>
    </form>
  )
}
