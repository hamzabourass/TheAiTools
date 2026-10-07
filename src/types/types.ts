import * as z from "zod"
import { analysisOptionsSchema, CVAnalysis } from "@/lib/ai/cv/schema"

export const ACCEPTED_CV_EXTENSIONS = [".pdf", ".docx"]
export const MAX_CV_SIZE = 5 * 1024 * 1024
export const MIN_JOB_DESCRIPTION_LENGTH = 50

const hasAcceptedExtension = (file: File) =>
  ACCEPTED_CV_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))

export const formSchema = z.object({
  cv: z
    .custom<File>((file) => typeof File !== "undefined" && file instanceof File, "Please upload your CV")
    .refine((file) => hasAcceptedExtension(file), "Upload a PDF or DOCX file")
    .refine((file) => file.size <= MAX_CV_SIZE, "File size must be less than 5MB"),
  jobDescription: z
    .string()
    .trim()
    .min(MIN_JOB_DESCRIPTION_LENGTH, `Paste the full job description (at least ${MIN_JOB_DESCRIPTION_LENGTH} characters)`),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]),
  options: analysisOptionsSchema,
})

export type CVFormData = z.infer<typeof formSchema>

export type AnalysisStatus = "idle" | "analyzing" | "complete" | "error"

export type AnalysisState = {
  status: AnalysisStatus
  result: CVAnalysis | null
  error: string | null
}

export const initialAnalysisState: AnalysisState = {
  status: "idle",
  result: null,
  error: null,
}
