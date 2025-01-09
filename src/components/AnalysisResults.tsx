"use client"

import { AlertCircle, Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { EmailDialog } from "./EmailDialog"
import { AnalysisChart } from "./AnalysisChart"
import { ExpandableSkills } from "./ExpandableSkills"
import { AnalysisResult } from "@/types/types"


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
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
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
    <div className="space-y-8 pb-8">
      {/* Header with Match Score */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">Analysis Results</h2>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{analysis.matchScore}%</div>
          <div className="text-sm text-muted-foreground">Match Score</div>
        </div>
      </div>

      {/* Analysis Chart */}
      <div className="py-4">
        <AnalysisChart analysis={analysis} />
      </div>

      {/* Skills Analysis */}
      <div className="space-y-8">
        {/* Technical Skills */}
        {analysis.technicalSkills.length > 0 && (
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              Technical Skills
              <span className="text-sm font-normal text-muted-foreground">
                ({analysis.technicalSkills.length})
              </span>
            </h3>
            <ExpandableSkills 
              skills={analysis.technicalSkills} 
              variant="technical" 
            />
          </section>
        )}

        {/* Soft Skills */}
        {analysis.softSkills.length > 0 && (
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              Soft Skills
              <span className="text-sm font-normal text-muted-foreground">
                ({analysis.softSkills.length})
              </span>
            </h3>
            <ExpandableSkills 
              skills={analysis.softSkills} 
              variant="soft" 
            />
          </section>
        )}

        {/* Missing Skills */}
        {analysis.missingSkills.length > 0 && (
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-destructive">
              Missing Skills
              <span className="text-sm font-normal text-muted-foreground">
                ({analysis.missingSkills.length})
              </span>
            </h3>
            <ExpandableSkills 
              skills={analysis.missingSkills} 
              variant="missing" 
            />
          </section>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <section>
            <h3 className="text-lg font-medium mb-4">Suggested Improvements</h3>
            <ul className="space-y-3">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex gap-3 items-start text-muted-foreground">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Generated Email */}
        {analysis.generatedEmail.subject && analysis.generatedEmail.body && (
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Generated Email</h3>
            <div className="rounded-lg bg-muted/50 p-6 space-y-4">
              <div>
                <span className="font-medium">Subject: </span>
                <span className="text-muted-foreground">{analysis.generatedEmail.subject}</span>
              </div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {analysis.generatedEmail.body}
              </div>
              <EmailDialog
                recipientEmail={recipientEmail}
                emailSubject={analysis.generatedEmail.subject}
                emailBody={analysis.generatedEmail.body}
                onSend={onSendEmail}
                trigger={
                  <Button className="w-full mt-4" >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                }
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}