"use client"

import { SignInButton } from "@/components/auth/signin-button"
import { Logo } from "@/components/brand/Logo"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

const highlights = [
  "Explainable 0-100 match score",
  "Requirement-by-requirement checklist",
  "ATS keyword check & prioritized fixes",
  "Interview prep and a tailored email",
]

export default function Signin() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side */}
      <div className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-primary to-violet-700 text-primary-foreground md:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10 flex w-full flex-col justify-between p-10">
          <span className="text-lg font-semibold">HireLens</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md space-y-6"
          >
            <h2 className="text-4xl font-bold leading-tight">See how your CV matches the job — before the recruiter does.</h2>
            <ul className="space-y-3">
              {highlights.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 text-primary-foreground/90"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <p className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} HireLens</p>
        </div>
      </div>

      {/* Right side - Sign In */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <motion.div
          className="w-full max-w-sm space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center md:hidden">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to analyze your CV</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Google account. You can send application emails straight from your Gmail.
            </p>
          </div>

          <SignInButton />

          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
