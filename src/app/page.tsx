"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FileUp,
  Globe,
  ClipboardList,
  KeyRound,
  Lightbulb,
  ListChecks,
  Mail,
  MessagesSquare,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Navbar from "@/components/landing/navbar/Navbar"
import { Logo } from "@/components/brand/Logo"
import { ScoreBar, ScoreRing } from "@/components/cv-analyzer/score"

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const steps = [
  { icon: FileUp, title: "Upload your CV", text: "Drop in your CV as a PDF or Word document." },
  { icon: ClipboardList, title: "Paste the job", text: "Add the job description you are applying for." },
  { icon: Sparkles, title: "Get your report", text: "See your match score, gaps and exactly what to fix — in about 30 seconds." },
]

const features = [
  { icon: Target, title: "Explainable match score", text: "A 0-100 score built from requirement coverage, experience, ATS keywords, education and soft skills — not a black box." },
  { icon: ListChecks, title: "Requirement checklist", text: "Every must-have and nice-to-have from the job, marked met, partial or missing, with the evidence from your CV." },
  { icon: KeyRound, title: "ATS keyword check", text: "Exact terms from the posting checked against your CV text, so you know what applicant tracking systems will miss." },
  { icon: Lightbulb, title: "Prioritized improvements", text: "Specific edits ranked by impact, pointing to the section of your CV they apply to." },
  { icon: MessagesSquare, title: "Interview preparation", text: "Likely questions for this role and your profile, with tips on how to answer them." },
  { icon: Mail, title: "Tailored application email", text: "An email in the tone you choose — edit it, copy it, or send it from Gmail with your CV attached." },
]

const faqs = [
  {
    q: "How is the match score calculated?",
    a: "First the job description is broken down into must-have and nice-to-have requirements and keywords. Your CV is then checked against each one. The score combines requirement coverage (35%), experience (30%), ATS keywords (15%), education (10%) and soft skills (10%). Missing must-haves cap the score, so it reflects what a recruiter would actually see.",
  },
  {
    q: "Which file formats are supported?",
    a: "PDF and DOCX files up to 5MB. Scanned image-only PDFs can't be read — export a text-based PDF from your editor instead.",
  },
  {
    q: "Can I get the report in another language?",
    a: "Yes. Choose English, French, Spanish, German or Arabic in the analysis options.",
  },
  {
    q: "Is my CV stored?",
    a: "No. Your CV is used to run the analysis and, if you choose, attached to the email you send. It isn't saved by HireLens.",
  },
  {
    q: "Why do I need to sign in with Google?",
    a: "Signing in keeps the tool protected from abuse and lets you send your application email directly from your own Gmail account.",
  },
]

function ResultPreview() {
  const rows = [
    { icon: CheckCircle2, color: "text-emerald-500", label: "React & TypeScript", note: "Must-have" },
    { icon: CheckCircle2, color: "text-emerald-500", label: "REST API design", note: "Must-have" },
    { icon: CircleDashed, color: "text-amber-500", label: "AWS", note: "Nice-to-have" },
    { icon: XCircle, color: "text-rose-500", label: "GraphQL", note: "Must-have" },
  ]
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent blur-2xl" />
      <div className="relative rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-5">
          <ScoreRing score={72} size={112} />
          <div className="space-y-1">
            <span className="inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600">Good match</span>
            <p className="font-semibold">Frontend Engineer · Mid-level</p>
            <p className="text-xs text-muted-foreground">Strong React background; add GraphQL to close the main gap.</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <ScoreBar label="Requirements coverage" value={78} />
          <ScoreBar label="ATS keywords" value={64} />
        </div>
        <ul className="mt-6 divide-y rounded-xl border">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <row.icon className={`h-4 w-4 ${row.color}`} />
              <span className="flex-1 font-medium">{row.label}</span>
              <span className="text-xs text-muted-foreground">{row.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 text-center lg:text-left">
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered CV analysis
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Know exactly how your CV{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">matches the job</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Upload your CV, paste a job description and get an explainable match score, a requirement-by-requirement
              checklist and a prioritized plan to improve your application.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/tools/resume-analyzer">
                  Analyze my CV
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">How it works</a>
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-1.5"><FileUp className="h-4 w-4" /> PDF & DOCX</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> 5 languages</span>
              <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Results in ~30s</span>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <ResultPreview />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30 py-20">
        <motion.div
          className="mx-auto max-w-6xl px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps, no setup.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div key={step.title} variants={fadeInUp} className="relative rounded-2xl border bg-background p-6">
                <span className="absolute right-5 top-5 text-5xl font-bold text-muted/80">{index + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-20">
        <motion.div
          className="mx-auto max-w-6xl px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to tailor your application</h2>
            <p className="mt-3 text-muted-foreground">One analysis, everything a recruiter would notice.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group rounded-2xl border p-6 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10 rounded-2xl border bg-background px-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="last:border-b-0">
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-600 px-6 py-16 text-center text-primary-foreground">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Ready to see how you match?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Get your match score and a clear improvement plan for your next application.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/tools/resume-analyzer">
                Analyze my CV
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
          <p>© {new Date().getFullYear()} HireLens</p>
        </div>
      </footer>
    </div>
  )
}
