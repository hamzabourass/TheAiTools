"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'
import * as z from "zod"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  jobDescription: z.string().min(1, "Job description required"),
  cv: z.instanceof(File, { message: "CV file required" })
})

type FormData = z.infer<typeof formSchema>

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("jobDescription", data.jobDescription)
      formData.append("cv", data.cv)

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData
      })

      if (!response.ok) throw new Error("Submission failed")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
            <p className="text-lg text-muted-foreground">
              Optimize your job application with AI-powered CV analysis
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Job Application Details</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Fill in the details below to analyze your CV and generate a personalized cover letter
            </p>

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
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
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
                {form.formState.errors.jobDescription && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.jobDescription.message}
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
                {form.formState.errors.cv && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.cv.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted format: PDF (Max size: 5MB)
                </p>

                {pdfUrl && (
                  <div className="mt-4 border rounded-lg p-4">
                    <Document 
                      file={pdfUrl} 
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="flex justify-center"
                    >
                      <Page 
                        pageNumber={1} 
                        width={400}
                      />
                    </Document>
                    {numPages && (
                      <p className="text-sm text-center text-muted-foreground mt-2">
                        Page 1 of {numPages}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
              >
                {isLoading ? "Processing..." : "Analyze & Send"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}