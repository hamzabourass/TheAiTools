"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MessageSquare, 
  Terminal, 
  Upload, 
  Download, 
  FileBarChart,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

const outputFormats = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Smart Summary",
    description: "AI-powered concise overview with key insights and action items",
    features: [
      "Automatic key point extraction",
      "Smart action item detection",
      "Context preservation"
    ]
  },
  {
    icon: <Terminal className="w-5 h-5" />,
    title: "Structured Format",
    description: "Clean, organized sections with hierarchical bullet points",
    features: [
      "Hierarchical organization",
      "Custom section headers",
      "Code block formatting"
    ]
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Interactive Q&A",
    description: "Conversational format with linked questions and answers",
    features: [
      "Thread visualization",
      "Related topics linking",
      "Quick navigation"
    ]
  },
  {
    icon: <FileBarChart className="w-5 h-5" />,
    title: "Analytical View",
    description: "Deep insights with topic analysis and relationship mapping",
    features: [
      "Topic clustering",
      "Insight extraction",
      "Visual relationships"
    ]
  }
];

const processSteps = [
  {
    title: "Upload Chat",
    description: "Paste your chat or upload file",
    icon: <Upload className="w-5 h-5" />
  },
  {
    title: "Choose Format",
    description: "Select your preferred style",
    icon: <Terminal className="w-5 h-5" />
  },
  {
    title: "Download",
    description: "Get your formatted document",
    icon: <Download className="w-5 h-5" />
  }
];

export  function ChatConverterSection() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-4 h-4 mr-2" />
          Used by 50,000+ teams
        </Badge>
        <h1 className="text-4xl font-bold">Chat Conversation Converter</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your AI chat discussions into beautifully formatted documents in seconds
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        {/* Format Selection */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Output Formats</h2>
              <p className="text-muted-foreground">Choose your preferred document format</p>
            </div>
            <Button asChild>
              <Link href="/chat-converter">Start Converting</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {outputFormats.map((format, index) => (
              <div
                key={index}
                className="group flex gap-4 p-6 rounded-lg border bg-card hover:border-primary/50 transition-all"
              >
                <div className="mt-1">{format.icon}</div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{format.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format.description}
                  </p>
                  <ul className="grid gap-2 mt-4">
                    {format.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">How It Works</h2>
            <p className="text-muted-foreground">Convert your chats in three simple steps</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="flex-1 relative">
                <div className="p-6 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                      {index + 1}
                    </div>
                    {index < processSteps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <Alert className="bg-primary/5 border-none">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <AlertDescription className="text-base">
              &quot;This tool has saved our team countless hours in document formatting. We use it daily for all our AI chat documentation.&quot;
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
}