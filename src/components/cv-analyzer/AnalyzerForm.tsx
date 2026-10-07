"use client"

import { useRef, useState } from "react"
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
  MIN_JOB_DESCRIPTION_LENGTH,
  formSchema,
} from "@/types/types"
import { EMAIL_TONES, OUTPUT_LANGUAGES, defaultAnalysisOptions } from "@/lib/ai/cv/schema"

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  )
}

export function AnalyzerForm({ onSubmit, isLoading }: AnalyzerFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const form = useForm<CVFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      email: "",
      options: defaultAnalysisOptions,
    },
  })
  const { errors } = form.formState
  const jobDescription = form.watch("jobDescription") || ""
  const includeEmail = form.watch("options.includeEmail")
  // Keep the options open while they hold a validation error the user needs to see.
  const optionsOpen = showOptions || !!errors.email

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" noValidate>
      {/* Step 1: CV */}
      <section className="space-y-3">
        <StepTitle step={1} title="Upload your CV" hint="PDF or DOCX, up to 5MB" />
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
                    aria-label="Remove file"
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
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF or DOCX · max 5MB</p>
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
        <StepTitle step={2} title="Paste the job description" hint="The more complete, the more accurate the analysis" />
        <Textarea
          {...form.register("jobDescription")}
          placeholder="Paste the full job posting: responsibilities, requirements, nice-to-haves…"
          className={cn("min-h-[200px] resize-y", errors.jobDescription && "border-destructive")}
        />
        <div className="flex items-center justify-between">
          <FieldError message={errors.jobDescription?.message} />
          <span
            className={cn(
              "ml-auto text-xs tabular-nums",
              jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH ? "text-muted-foreground" : "text-emerald-600"
            )}
          >
            {jobDescription.trim().length.toLocaleString()} characters
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
          <StepTitle step={3} title="Options" hint="Language, application email and interview prep" />
          <Settings2 className={cn("h-4 w-4 text-muted-foreground transition-transform", optionsOpen && "rotate-90")} />
        </button>

        {optionsOpen && (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Report language</Label>
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
                          <SelectItem key={language} value={language}>{language}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email tone</Label>
                <Controller
                  control={form.control}
                  name="options.tone"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!includeEmail}>
                      <SelectTrigger className="bg-background capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TONES.map((tone) => (
                          <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>
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
                    <span className="block text-sm font-medium">Write an application email</span>
                    <span className="block text-xs text-muted-foreground">A tailored email you can edit and send</span>
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
                    <span className="block text-sm font-medium">Interview preparation</span>
                    <span className="block text-xs text-muted-foreground">Likely questions with tips for answering</span>
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />

            {includeEmail && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  Recruiter email <span className="font-normal text-muted-foreground">(optional)</span>
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
            Analyzing…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze my CV
          </>
        )}
      </Button>
    </form>
  )
}
