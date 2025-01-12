"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { FileText, MessageSquare, Sparkles, Menu, BookOpen, Database, Home } from "lucide-react"
import Link from "next/link"
import React from "react"
import { usePathname } from 'next/navigation'

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const navItems = [
  { label: 'Tools', id: 'tools' },
  { label: 'Guide', id: 'guide' },
  { label: 'Features', id: 'features' },
  { label: 'Why Choose Us', id: 'why-us' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

const toolsList = [
  {
    href: "/tools/resume-analyzer",
    icon: <FileText className="h-5 w-5 text-primary" />,
    title: "Resume Analyzer",
    description: "AI-powered resume analysis"
  },
  {
    href: "/tools/chat-converter",
    icon: <MessageSquare className="h-5 w-5 text-primary" />,
    title: "Chat Converter",
    description: "Convert chats to PDFs"
  },
  {
    href: "/tools/generate-data",
    icon: <Database className="h-5 w-5 text-primary" />,
    title: "Data Generator",
    description: "Generate synthetic data"
  }
]

const Navbar = () => {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const handleNavigation = (sectionId: string) => {
    if (isHomePage) {
      scrollToSection(sectionId)
    } else {
      window.location.href = `/#${sectionId}`
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-background border-b">
        <div className="flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access all tools and sections
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Home Link */}
                  {!isHomePage && (
                    <Link href="/" className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg">
                      <Home className="h-5 w-5 text-primary" />
                      <div className="font-medium">Back to Home</div>
                    </Link>
                  )}

                  {/* Tools Section */}
                  <div className="grid gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
                    <div className="grid gap-2">
                      {toolsList.map((tool) => (
                        <Link key={tool.href} href={tool.href} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg">
                          {tool.icon}
                          <div>
                            <div className="font-medium">{tool.title}</div>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                        </Link>
                      ))}
                      <Link href="/tools/guide" className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Tools Guide</div>
                          <p className="text-sm text-muted-foreground">Learn how to use our tools</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                    {navItems.slice(2).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className="w-full p-3 text-left hover:bg-muted rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
                    <div className="grid gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/tools/resume-analyzer">
                          Try Resume Analyzer
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/tools/chat-converter">
                          Convert Chat
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">The AI Tools</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {!isHomePage && (
                <NavigationMenuItem>
                  <Link href="/" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] lg:w-[500px]">
                    <div className="grid grid-cols-2 gap-3">
                      {toolsList.map((tool) => (
                        <Link key={tool.href} href={tool.href} className="group grid gap-1 p-3 hover:bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {React.cloneElement(tool.icon, { className: 'h-4 w-4 text-primary' })}
                            <span className="text-sm font-medium">{tool.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </Link>
                      ))}
                    </div>
                    <Link href="/tools/guide" className="group grid gap-1 p-3 hover:bg-muted rounded-lg border-t pt-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Tools Guide</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guide to using all our tools effectively
                      </p>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navItems.slice(2).map((item) => (
                <NavigationMenuItem key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tools/guide">View Guide</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/tools/resume-analyzer">Try Tools</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  )
}

export default Navbar