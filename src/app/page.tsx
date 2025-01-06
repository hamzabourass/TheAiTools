// src/app/page.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">CV Assistant</h1>
            <p className="text-lg text-muted-foreground">
              Optimize your job application with AI-powered CV analysis
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg  p-8">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Job Application Details</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Fill in the details below to analyze your CV and generate a personalized cover letter
            </p>

            <form className="space-y-6">
              {/* HR Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  HR Email
                </label>
                <Input 
                  type="email" 
                  placeholder="recruiter@company.com"
                  className="border-2 focus:ring-2"
                />
              </div>
              
              {/* Job Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Job Description
                </label>
                <Textarea 
                  placeholder="Paste the job description here..."
                  className="min-h-[200px] border-2 focus:ring-2"
                />
              </div>
              
              {/* CV Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload CV
                </label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    className="border-2 focus:ring-2"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                </p>
              </div>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
              >
                Analyze & Send
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}