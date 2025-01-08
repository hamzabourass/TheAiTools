"use client"

import { SignInButton } from "@/components/auth/signin-button"
import { motion } from "framer-motion"

// Update your tailwind.config.js with these new keyframes and animations
const tailwindConfig = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 8s linear infinite',
        float: 'float 6s ease-in-out infinite'
      }
    }
  }
}

export default function Signin() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side */}
      <div className="flex-1 hidden md:flex relative bg-background overflow-hidden">
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 bg-[length:200%_auto] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(115deg, transparent 0%, transparent 40%, hsl(var(--primary)/.1) 50%, transparent 60%, transparent 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8">
          {/* Floating logo/icon */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="mb-12"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <motion.path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 max-w-md"
          >
            <h2 className="text-4xl font-bold">
              <span className="text-foreground">Welcome to </span>
              <span className="text-primary">AI Tools</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Transform your workflow with AI-powered document analysis and chat management
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-4 py-2 rounded-full border bg-card text-card-foreground shadow-sm"
              >
                Resume Analysis
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="px-4 py-2 rounded-full border bg-card text-card-foreground shadow-sm"
              >
                Chat Export
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Right side - Sign In */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background border-l">
        <motion.div 
          className="w-full max-w-sm space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Sign In</h1>
            <p className="mt-2 text-muted-foreground">
              Access your workspace
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="relative group">
              <div className="absolute -inset-1  from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative  rounded-lg p-6">
                <SignInButton />
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}