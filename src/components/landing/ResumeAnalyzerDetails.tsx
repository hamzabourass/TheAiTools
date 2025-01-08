import { Brain, FileSearch, MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const ResumeAnalyzerDetails = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Resume Analyzer Features</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <FileSearch className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-lg">Smart Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced AI algorithms analyze resumes to identify key skills, experiences, and qualifications.
              Provides detailed insights about candidate strengths and areas for improvement.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Brain className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-lg">Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically extracts and categorizes technical skills, soft skills, and industry expertise.
              Matches skills against job requirements and industry standards.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <MailCheck className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-lg">Professional Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generates comprehensive reports and professional emails with feedback and recommendations.
              Perfect for recruiters and HR professionals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
  