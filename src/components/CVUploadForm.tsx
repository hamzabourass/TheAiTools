import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileText, Send, Upload, Loader2 } from "lucide-react"
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
  )
}