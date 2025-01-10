"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot,
  Sparkles,
  MessageSquare,
  FileText,
  Download,
  Wand2,
  Brain,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const examplePrompts = [
  {
    prompt: "Generate user data with names, ages between 25-40, and email addresses",
    result: "Name, Age, Email\nJohn Smith, 32, john.smith@email.com..."
  },
  {
    prompt: "Create product sales data with prices between $10-$100 and monthly quantities",
    result: "Product, Price, Monthly_Sales\nProduct A, $45.99, 127..."
  },
  {
    prompt: "Generate employee performance data with ratings and quarterly reviews",
    result: "Employee_ID, Rating, Review_Score\nEMP001, Outstanding, 9.2..."
  }
];

const features = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Natural Language Understanding",
    description: "Describe your data needs in plain English, and our AI understands exactly what you want"
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "Smart Data Generation",
    description: "AI generates contextually accurate and realistic data based on your requirements"
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Instant Results",
    description: "Get up to 10,000 rows of perfectly formatted data in seconds"
  }
];

export  function DataGeneratorSection() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="px-4 py-2 text-base gap-2">
            <Bot className="w-4 h-4" />
            Prompt-Based Data Generation
          </Badge>
        </div>
        
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/80 via-primary to-primary/80 text-transparent bg-clip-text pb-2">
            AI Data Generator
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            Simply describe the data you need, and our AI will generate it instantly
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Features & CTA */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg bg-secondary/20 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="w-5 h-5" />
              Try It Now
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm font-medium">Example prompt:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "Generate employee data with names, departments, and salary ranges between $50,000-$120,000"
                </p>
              </div>
              <Button asChild className="w-full gap-2">
                <Link href="/generate-data">
                  <Wand2 className="w-4 h-4" />
                  Start Generating
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Example Prompts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Example Generations</h2>
          <div className="space-y-4">
            {examplePrompts.map((example, index) => (
              <div key={index} className="rounded-lg border bg-card overflow-hidden">
                <div className="p-4 bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="font-medium">Prompt</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {example.prompt}
                  </p>
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="font-medium">Generated Data Preview</span>
                  </div>
                  <code className="text-sm text-muted-foreground block bg-muted p-2 rounded">
                    {example.result}
                  </code>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    <span>10,000 rows generated in 2.3 seconds</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example Alert */}
      <Alert className="bg-primary/5 border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-base">
            "Just described the data structure I needed in plain English, and the AI generated exactly what I was looking for. Saved me hours of manual work!"
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}