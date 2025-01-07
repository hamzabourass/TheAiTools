"use client";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload, AlertCircle, Loader2 } from "lucide-react"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  jobDescription: z.string().min(1, "Job description required"),
  cv: z.any()
    .refine((file) => file?.length > 0, "CV file required")
    .refine((file) => file?.[0]?.type === "application/pdf", "Must be a PDF file")
    .refine((file) => file?.[0]?.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
})

type FormData = z.infer<typeof formSchema>
type AnalysisResult = {
  technicalSkills: string[];
  softSkills: string[];
  matchScore: number;
  missingSkills: string[];
  improvements: string[];
  generatedEmail: string;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
}

const initialAnalysisState: AnalysisResult = {
  technicalSkills: [],
  softSkills: [],
  matchScore: 0,
  missingSkills: [],
  improvements: [],
  generatedEmail: '',
  status: 'idle'
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysisState)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type === 'application/pdf') {
      setFileName(file.name)
    }
  }

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true)
      setAnalysis(prev => ({ ...prev, status: 'analyzing' }))

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Optimize your job application with AI-powered CV analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form Section */}
          <div className="dark:bg-gray-800 p-6 shadow-lg h-fit">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  HR Email
                </label>
                <Input 
                  {...form.register("email")}
                  placeholder="recruiter@company.com"
                  className="border-2 focus:ring-2"
                />
                {form.formState.errors.email?.message && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message.toString()}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Job Description
                </label>
                <Textarea 
                  {...form.register("jobDescription")}
                  placeholder="Paste the job description here..."
                  className="min-h-[200px] border-2 focus:ring-2"
                />
                {form.formState.errors.jobDescription?.message && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.jobDescription.message.toString()}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload CV (PDF, max 5MB)
                </label>
                <Input 
                  type="file"
                  {...form.register("cv")}
                  accept=".pdf"
                  className="border-2 focus:ring-2"
                  onChange={handleFileChange}
                />
                {form.formState.errors.cv?.message && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.cv.message.toString()}
                  </p>
                )}
                {fileName && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <FileText className="w-4 h-4" />
                    {fileName}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze & Generate
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
                <div className="pl-8">
            {analysis.status === 'idle' && (
              <div className="h-full flex items-center justify-center text-center p-8 text-muted-foreground">
                Fill out the form and upload your CV to get started
              </div>
            )}

            {analysis.status === 'analyzing' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Analyzing your application...</p>
              </div>
            )}

            {analysis.status === 'complete' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-2xl font-bold">Analysis Results</h2>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analysis.matchScore}%</div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Skills Analysis */}
                  <div className="space-y-4">
                    {analysis.technicalSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Technical Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.technicalSkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.softSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Soft Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.softSkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.missingSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingSkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Improvements */}
                  {analysis.improvements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Suggested Improvements</p>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Generated Email */}
                  {analysis.generatedEmail && (
                    <div>
                      <p className="text-sm font-medium mb-2">Generated Email</p>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm whitespace-pre-wrap">
                          {analysis.generatedEmail}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysis.status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  An error occurred while analyzing your application. Please try again.
                </AlertDescription>
              </Alert>
            )}
                </div>
              </div>
            </div>
          </div>
        </div>    
  );
}