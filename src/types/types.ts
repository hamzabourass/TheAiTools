import * as z from "zod"
import { analysisOptionsSchema, CVAnalysis } from "@/lib/ai/cv/schema"
import type { Dictionary } from "@/lib/i18n/dictionaries"

export const ACCEPTED_CV_EXTENSIONS = [".pdf", ".docx"]
export const MAX_CV_SIZE = 5 * 1024 * 1024
export const MIN_JOB_DESCRIPTION_LENGTH = 50

// Validation messages and API error codes are keys of the "errors" translations.
export type ErrorKey = keyof Dictionary["errors"]
const message = (key: ErrorKey) => key

const hasAcceptedExtension = (file: File) =>
  ACCEPTED_CV_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))

export const formSchema = z.object({
  cv: z
    .custom<File>((file) => typeof File !== "undefined" && file instanceof File, message("cvRequired"))
    .refine((file) => hasAcceptedExtension(file), message("cvType"))
    .refine((file) => file.size <= MAX_CV_SIZE, message("cvSize")),
  jobDescription: z.string().trim().min(MIN_JOB_DESCRIPTION_LENGTH, message("jdShort")),
  email: z.union([z.literal(""), z.string().trim().email(message("emailInvalid"))]),
  options: analysisOptionsSchema,
})

export type CVFormData = z.infer<typeof formSchema>

export type AnalysisStatus = "idle" | "analyzing" | "complete" | "error"

export type AnalysisState = {
  status: AnalysisStatus
  result: CVAnalysis | null
  // Translation key of the error to show
  error: ErrorKey | null
}

export const initialAnalysisState: AnalysisState = {
  status: "idle",
  result: null,
  error: null,
}
