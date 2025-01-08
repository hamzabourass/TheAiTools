"use client"

import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { FileText, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          AI-Powered Document Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Transform your resume analysis and chat conversations into actionable insights with our advanced AI tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/resume-analyzer">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/chat-converter">Try Chat Converter</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">Our Tools</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Resume Analyzer</CardTitle>
              </div>
              <CardDescription>
                Advanced resume analysis and report generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Detailed skill assessment and analysis
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Automated report generation
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Professional email formatting
                </li>
              </ul>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/resume-analyzer">
                  Analyze Resume
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <CardTitle>Chat Converter</CardTitle>
              </div>
              <CardDescription>
                Convert chat conversations into structured PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Extract key points from conversations
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Professional PDF formatting
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Easy sharing and storage
                </li>
              </ul>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/chat-converter">
                  Convert Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground">
        <p>Built with Next.js and Shadcn UI • Powered by AI</p>
      </footer>
    </div>
  )
}