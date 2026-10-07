import * as z from "zod"

// Options the user can pick on the analyzer form.
export const EMAIL_TONES = ["professional", "enthusiastic", "concise"] as const
export const OUTPUT_LANGUAGES = ["English", "French"] as const

export const analysisOptionsSchema = z.object({
  tone: z.enum(EMAIL_TONES).default("professional"),
  language: z.enum(OUTPUT_LANGUAGES).default("English"),
  includeEmail: z.boolean().default(true),
  includeInterviewPrep: z.boolean().default(true),
})

export type AnalysisOptions = z.infer<typeof analysisOptionsSchema>

export const defaultAnalysisOptions: AnalysisOptions = {
  tone: "professional",
  language: "English",
  includeEmail: true,
  includeInterviewPrep: true,
}

// Step 1: what the job actually asks for. Descriptions double as instructions to the model.
export const jobRequirementsSchema = z.object({
  title: z.string().describe("Job title being hired for"),
  seniority: z.string().describe("Seniority level, e.g. Intern, Junior, Mid-level, Senior, Lead"),
  requiredYears: z.number().nullable().describe("Minimum years of experience required, or null if not stated"),
  mustHave: z.array(z.string()).describe("Hard requirements: skills, tools, qualifications the job says are required. Short phrases, max 12"),
  niceToHave: z.array(z.string()).describe("Preferred / bonus requirements. Short phrases, max 8"),
  education: z.array(z.string()).describe("Education or certification requirements, empty if none"),
  keywords: z.array(z.string()).describe("10-25 ATS keywords exactly as written in the job description: technologies, tools, methods, domain terms"),
})

export type JobRequirements = z.infer<typeof jobRequirementsSchema>

// Step 2: how the CV holds up against those requirements.
export const cvEvaluationSchema = z.object({
  candidateName: z.string().describe("Candidate's full name as written on the CV, or empty string if not found"),
  summary: z.string().describe("2-3 sentence honest verdict on how well the candidate fits this role"),
  requirementMatches: z.array(z.object({
    requirement: z.string().describe("The requirement exactly as listed"),
    importance: z.enum(["must", "nice"]),
    status: z.enum(["met", "partial", "missing"]).describe("met = clear evidence; partial = related or weaker evidence; missing = no evidence"),
    evidence: z.string().describe("Short quote or paraphrase from the CV that supports the status, or empty string if missing"),
  })).describe("One entry for EVERY must-have and nice-to-have requirement"),
  scoreBreakdown: z.object({
    experience: z.number().describe("0-100: relevance and length of experience versus what is asked"),
    education: z.number().describe("0-100: education and certifications versus what is asked (100 if nothing is asked and nothing is lacking)"),
    softSkills: z.number().describe("0-100: evidence of the soft skills the role needs"),
  }),
  strengths: z.array(z.string()).describe("3-6 concrete strengths of this CV for this role, each one sentence"),
  technicalSkills: z.array(z.string()).describe("All technical skills found anywhere in the CV, including implied ones"),
  softSkills: z.array(z.string()).describe("Soft skills evidenced in the CV"),
  experience: z.object({
    relevantYears: z.number().describe("Years of experience relevant to this role"),
    summary: z.string().describe("One or two sentences on how the experience lines up with the role"),
  }),
  improvements: z.array(z.object({
    title: z.string().describe("Short imperative title, e.g. 'Quantify your impact'"),
    detail: z.string().describe("Specific, actionable advice referencing this CV and job"),
    priority: z.enum(["high", "medium", "low"]),
    section: z.string().describe("CV section this applies to, e.g. Summary, Experience, Skills, Education, Format"),
  })).describe("4-8 specific improvements, most important first"),
  interviewQuestions: z.array(z.object({
    question: z.string(),
    tip: z.string().describe("How the candidate should approach answering, based on their CV"),
  })).describe("Likely interview questions for this candidate and role, or an empty array if not requested"),
  generatedEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }).describe("Application email from the candidate to the recruiter, or empty strings if not requested"),
})

export type CVEvaluation = z.infer<typeof cvEvaluationSchema>

export type RequirementMatch = CVEvaluation["requirementMatches"][number]

// Final result sent to the client: model output plus scores computed in code.
export type CVAnalysis = Omit<CVEvaluation, "scoreBreakdown" | "experience"> & {
  targetRole: string
  seniority: string
  matchScore: number
  scoreBreakdown: {
    technicalSkills: number
    experience: number
    education: number
    softSkills: number
    keywords: number
  }
  matchedSkills: string[]
  missingSkills: { skill: string; importance: "critical" | "preferred" }[]
  experience: {
    relevantYears: number
    requiredYears: number | null
    summary: string
  }
  keywords: {
    present: string[]
    missing: string[]
  }
}
