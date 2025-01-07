import { AlertCircle, Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SkillTag } from "./SkillTag"
import { EmailDialog } from "./EmailDialog"
import { AnalysisResult } from "../types/types"

type AnalysisResultsProps = {
  analysis: AnalysisResult;
  recipientEmail: string;
  onSendEmail: (emailData: { to: string; subject: string; message: string }) => void;
}

export function AnalysisResults({ 
  analysis, 
  recipientEmail,
  onSendEmail 
}: AnalysisResultsProps) {
  if (analysis.status === 'idle') {
    return (
      <div className="h-full flex items-center justify-center text-center p-8 text-muted-foreground">
        Fill out the form and upload your CV to get started
      </div>
    )
  }

  if (analysis.status === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Analyzing your application...</p>
      </div>
    )
  }

  if (analysis.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          An error occurred while analyzing your application. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
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
                  <SkillTag key={index} skill={skill} variant="technical" />
                ))}
              </div>
            </div>
          )}

          {analysis.softSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.softSkills.map((skill, index) => (
                  <SkillTag key={index} skill={skill} variant="soft" />
                ))}
              </div>
            </div>
          )}

          {analysis.missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill, index) => (
                  <SkillTag key={index} skill={skill} variant="missing" />
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
        {analysis.generatedEmail.subject && analysis.generatedEmail.body && (
          <div>
            <p className="text-sm font-medium mb-2">Generated Email</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-sm font-medium">Subject: </span>
                <span className="text-sm">{analysis.generatedEmail.subject}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {analysis.generatedEmail.body}
              </div>
              <EmailDialog
                recipientEmail={recipientEmail}
                emailSubject={analysis.generatedEmail.subject}
                emailBody={analysis.generatedEmail.body}
                onSend={onSendEmail}
                trigger={
                  <Button className="w-full mt-4">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}