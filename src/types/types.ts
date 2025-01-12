import * as z from "zod"

export const formSchema = z.object({
  email: z.string().email("Valid email required"),
  jobDescription: z.string().min(1, "Job description required"),
  cv: z.any()
    .refine((file) => file?.length > 0, "CV file required")
    .refine((file) => file?.[0]?.type === "application/pdf", "Must be a PDF file")
    .refine((file) => file?.[0]?.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
})

export type CVFormData = z.infer<typeof formSchema>

export type AnalysisResult = {
  technicalSkills: string[];
  softSkills: string[];
  matchScore: number;
  missingSkills: string[];
  improvements: string[];
  generatedEmail: {
    subject: string;
    body: string;
  };
  cv: File | null;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
}

export const initialAnalysisState: AnalysisResult = {
  technicalSkills: [],
  softSkills: [],
  matchScore: 0,
  missingSkills: [],
  improvements: [],
  generatedEmail: {
    subject: '',
    body: ''
  },
  status: 'idle'
}