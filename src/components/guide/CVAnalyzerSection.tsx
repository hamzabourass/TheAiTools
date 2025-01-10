"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Download, 
  Star, 
  BookOpen, 
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  BarChart,
  PieChart,
  Users,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { PieChart as RechartsePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const features = [
  {
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your CV against job requirements with 98% accuracy",
    icon: <Sparkles className="w-4 h-4" />,
    stats: "98% Accuracy"
  },
  {
    title: "Comprehensive Scoring",
    description: "Multi-dimensional evaluation system covering 20+ key career aspects and competencies",
    icon: <Trophy className="w-4 h-4" />,
    stats: "20+ Metrics"
  },
  {
    title: "Industry Benchmarking",
    description: "Compare your profile against successful candidates in your target industry",
    icon: <Target className="w-4 h-4" />,
    stats: "50+ Industries"
  },
  {
    title: "Smart Recommendations",
    description: "Personalized improvement suggestions based on AI analysis and industry standards",
    icon: <TrendingUp className="w-4 h-4" />,
    stats: "Custom Insights"
  }
];

const industryStats = [
  { name: 'Tech', value: 35 },
  { name: 'Finance', value: 25 },
  { name: 'Healthcare', value: 20 },
  { name: 'Others', value: 20 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const usageSteps = [
  {
    icon: <Upload className="w-4 h-4" />,
    title: "Upload CV",
    description: "Support for PDF, DOCX formats with automatic parsing",
    detail: "Our advanced parsing technology accurately extracts information from your CV, maintaining formatting and structure."
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Add Job Description",
    description: "Paste the job posting or requirements",
    detail: "Our AI analyzes key requirements and matches them against your qualifications."
  },
  {
    icon: <BarChart className="w-4 h-4" />,
    title: "Get Analysis",
    description: "Receive detailed matching score and recommendations",
    detail: "Comprehensive report including skills match, experience alignment, and suggested improvements."
  },
  {
    icon: <Download className="w-4 h-4" />,
    title: "Export Reports",
    description: "Download detailed analysis and improvement plan",
    detail: "Generate professional PDF reports with actionable insights and recommendations."
  }
];

export const CVAnalyzerSection = () => {
  return (
    <div className="space-y-8">
      {/* Success Stories Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Trophy className="h-4 w-4" />
        <AlertTitle>Success Rate</AlertTitle>
        <AlertDescription>
          Over 100,000 professionals have improved their job applications using our CV Analyzer,
          with an average 75% increase in interview callbacks.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Content Card */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">CV Analysis Tool</CardTitle>
                <CardDescription className="text-base">
                  Our advanced AI-powered CV analyzer helps you perfect your job applications
                  with detailed insights and tailored recommendations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="features">
                  <Star className="w-4 h-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="usage">
                  <BookOpen className="w-4 h-4 mr-2" />
                  How to Use
                </TabsTrigger>
              </TabsList>
              <TabsContent value="features">
                <div className="grid gap-4 mt-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{feature.title}</h4>
                          <Badge variant="secondary">{feature.stats}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="usage">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4 mt-4">
                  <div className="space-y-6">
                    {usageSteps.map((step, index) => (
                      <div key={index}>
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 bg-primary/10 p-2 rounded-full">
                            {step.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                        {index < usageSteps.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button className="flex-1" asChild>
              <Link href="/resume-analyzer">Start Analysis</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/tools/guide">View Guide</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Statistics Cards */}
        <div className="md:col-span-3 space-y-6">
          {/* Scoring Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Score Components
              </CardTitle>
              <CardDescription>
                Our comprehensive scoring system evaluates multiple aspects of your CV
                to ensure the best possible match with job requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Technical Skills", value: 40, description: "Technical abilities & tools", icon: <Briefcase /> },
                { label: "Experience", value: 30, description: "Work history relevance", icon: <Users /> },
                { label: "Education", value: 20, description: "Qualifications & certifications", icon: <BookOpen /> },
                { label: "Industry Match", value: 10, description: "Sector alignment", icon: <Target /> }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Industry Distribution Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Industry Coverage
              </CardTitle>
              <CardDescription>
                Distribution of successful CV analyses across industries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={industryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {industryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {industryStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm">{stat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

