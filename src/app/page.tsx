"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import * as z from "zod"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Valid email required"),
  jobDescription: z.string().min(1, "Job description required"),
  cv: z.any()
    .refine((file) => file?.length > 0, "CV file is required")
    .refine((file) => {
      if (file?.length > 0) {
        return file[0]?.type === "application/pdf"
      }
      return false
    }, "Must be a PDF file")
    .refine((file) => {
      if (file?.length > 0) {
        return file[0]?.size <= 5 * 1024 * 1024 // 5MB
      }
      return false
    }, "File size must be less than 5MB")
})

type FormData = z.infer<typeof formSchema>

// API Response Types
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
    if (file && file.type === 'application/pdf') {
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
      console.log('API Response:', result)
      
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
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Optimize your job application with AI-powered CV analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left side - Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Job Application Details</h2>
            </div>

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
                  Upload CV
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
                <p className="text-xs text-muted-foreground">
                  Accepted format: PDF (Max size: 5MB)
                </p>

                {fileName && (
                  <div className="mt-4 border rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-6 h-6 text-blue-500" />
                      <p className="text-sm font-medium">{fileName}</p>
                    </div>
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

          {/* Right side - Analysis Results */}
          <div className="space-y-6">
            {analysis.status === 'idle' && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready for Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fill out the form and upload your CV to get started with the analysis.
                  </p>
                </CardContent>
              </Card>
            )}

            {analysis.status === 'analyzing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Your Application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please wait while we analyze your CV...
                  </p>
                </CardContent>
              </Card>
            )}

            {analysis.status === 'complete' && (
              <>
                {/* Technical Skills */}
                {analysis.technicalSkills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.technicalSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Soft Skills */}
                {analysis.softSkills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Soft Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.softSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Match Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold mb-2">{analysis.matchScore}%</div>
                    <p className="text-muted-foreground">
                      This score indicates how well the candidate's CV matches the job requirements.
                    </p>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                {analysis.missingSkills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Missing Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Improvements */}
                {analysis.improvements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggested Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Email */}
                {analysis.generatedEmail && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                        
                        </p>
                        <div className="text-muted-foreground whitespace-pre-wrap">
                          {analysis.generatedEmail}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
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
  )
}