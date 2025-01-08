"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { FileText, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const Navbar = () => {
  return (
    <div className="fixed w-full top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center px-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">The AI Tools</span>
        </Link>

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
            <NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('tools')}
    className={navigationMenuTriggerStyle()}
  >
    Tools
  </button>
</NavigationMenuItem>
<NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('features')}
    className={navigationMenuTriggerStyle()}
  >
    Features
  </button>
</NavigationMenuItem>
<NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('why-us')}
    className={navigationMenuTriggerStyle()}
  >
    Why Choose Us
  </button>
</NavigationMenuItem>
<NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('testimonials')}
    className={navigationMenuTriggerStyle()}
  >
    Testimonials
  </button>
</NavigationMenuItem>
<NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('faq')}
    className={navigationMenuTriggerStyle()}
  >
    FAQ
  </button>
</NavigationMenuItem>
<NavigationMenuItem>
  <button 
    onClick={() => scrollToSection('contact')}
    className={navigationMenuTriggerStyle()}
  >
    Contact
  </button>
</NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        <div className="hidden md:flex gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/resume-analyzer">Try Resume Analyzer</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/chat-converter">Convert Chat</Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

export default Navbar