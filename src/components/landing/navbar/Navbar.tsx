"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { FileText, MessageSquare, Sparkles, Menu, X } from "lucide-react"
import Link from "next/link"

const scrollToSection = (sectionId: string, setMobileMenuOpen?: (open: boolean) => void) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen?.(false)
  }
}

const navItems = [
  { label: 'Tools', id: 'tools' },
  { label: 'Features', id: 'features' },
  { label: 'Why Choose Us', id: 'why-us' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <nav className="flex h-16 items-center px-4 max-w-6xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">The AI Tools</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] md:w-[500px]">
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/resume-analyzer" className="group grid gap-1 p-3 hover:bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Resume Analyzer</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI-powered resume analysis and report generation
                        </p>
                      </Link>
                      <Link href="/chat-converter" className="group grid gap-1 p-3 hover:bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Chat Converter</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Convert ChatGPT discussions into structured PDFs
                        </p>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex-1" />

          {/* Desktop CTAs */}
          <div className="hidden md:flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/resume-analyzer">Try Resume Analyzer</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/chat-converter">Convert Chat</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="relative h-[calc(100vh-4rem)] bg-white overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Tools Section */}
                <div className="grid gap-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
                  <Link 
                    href="/resume-analyzer" 
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Resume Analyzer</div>
                      <p className="text-sm text-muted-foreground">AI-powered resume analysis</p>
                    </div>
                  </Link>
                  <Link 
                    href="/chat-converter" 
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Chat Converter</div>
                      <p className="text-sm text-muted-foreground">Convert chats to PDFs</p>
                    </div>
                  </Link>
                </div>

                {/* Navigation Items */}
                <div className="border-t pt-6">
                  <div className="grid gap-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id, setMobileMenuOpen)}
                        className="w-full p-3 text-left hover:bg-muted rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile CTAs */}
                <div className="border-t pt-6">
                  <div className="grid gap-3">
                    <Button variant="outline" asChild>
                      <Link 
                        href="/resume-analyzer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Try Resume Analyzer
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link 
                        href="/chat-converter"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Convert Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  )
}

export default Navbar