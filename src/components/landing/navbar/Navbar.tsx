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
import { FileText, MessageSquare, Sparkles, Menu } from "lucide-react"
import Link from "next/link"

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
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
                  {/* Tools Section */}
                  <div className="grid gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
                    <div className="grid gap-2">
                      <Link href="/resume-analyzer" className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Resume Analyzer</div>
                          <p className="text-sm text-muted-foreground">AI-powered resume analysis</p>
                        </div>
                      </Link>
                      <Link href="/chat-converter" className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Chat Converter</div>
                          <p className="text-sm text-muted-foreground">Convert chats to PDFs</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                    {navItems.slice(1).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
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
                        <Link href="/resume-analyzer">
                          Try Resume Analyzer
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/chat-converter">
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
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] lg:w-[500px]">
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
              {navItems.slice(1).map((item) => (
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

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/resume-analyzer">Try Resume Analyzer</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/chat-converter">Convert Chat</Link>
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