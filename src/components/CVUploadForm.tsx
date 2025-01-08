"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload, Loader2, AlertCircle } from "lucide-react"
import { CVFormData, formSchema } from "@/types/types"

type CVUploadFormProps = {
  onSubmit: (data: CVFormData) => Promise<void>;
  isLoading: boolean;
}

export function CVUploadForm({ onSubmit, isLoading }: CVUploadFormProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  
  const form = useForm<CVFormData>({
    resolver: zodResolver(formSchema)
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type === 'application/pdf') {
      setFileName(file.name)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
      {/* Email Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <Mail className="w-4 h-4 text-muted-foreground" />
          HR Email
        </label>
        <Input 
          {...form.register("email")}
          placeholder="recruiter@company.com"
          className={`transition-all duration-200 ${
            form.formState.errors.email ? 'border-destructive ring-destructive' : 'hover:border-primary/50 focus:border-primary'
          }`}
        />
        {form.formState.errors.email?.message && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.email.message.toString()}
          </div>
        )}
      </div>
      
      {/* Job Description Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Job Description
        </label>
        <Textarea 
          {...form.register("jobDescription")}
          placeholder="Paste the job description here..."
          className={`min-h-[200px] resize-y transition-all duration-200 ${
            form.formState.errors.jobDescription ? 'border-destructive ring-destructive' : 'hover:border-primary/50 focus:border-primary'
          }`}
        />
        {form.formState.errors.jobDescription?.message && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.jobDescription.message.toString()}
          </div>
        )}
      </div>
      
      {/* CV Upload Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <Upload className="w-4 h-4 text-muted-foreground" />
          Upload CV (PDF)
        </label>
        <div className="relative">
          <Input 
            type="file"
            {...form.register("cv")}
            accept=".pdf"
            className={`file:border-0 file:bg-transparent file:text-sm file:font-medium file:mr-4 hover:file:bg-primary/5 file:text-primary transition-all duration-200 ${
              form.formState.errors.cv ? 'border-destructive ring-destructive' : 'hover:border-primary/50 focus:border-primary'
            }`}
            onChange={handleFileChange}
          />
        </div>
        {form.formState.errors.cv?.message && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.cv.message.toString()}
          </div>
        )}
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <FileText className="w-4 h-4" />
            {fileName}
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-medium transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing CV...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Analyze & Generate Report</span>
            <Send className="w-5 h-5" />
          </div>
        )}
      </Button>
    </form>
  )
}