"use client"

import { useSession, signOut } from "next-auth/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Menu, LogOut, Settings, User, FileText, MessageSquare, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export function Header() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle></SheetTitle>
              <SheetDescription>
                
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Link 
                href="/resume-analyzer" 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <FileText className="w-4 h-4" />
                Resume Analyzer
              </Link>
              <Link 
                href="/chat-converter" 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Converter
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">The AI Tools</span>
        </Link>
      </div>
      
      <NavigationMenu className="hidden lg:flex justify-center">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/resume-analyzer" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <FileText className="w-4 h-4 mr-2" />
                Resume Analyzer
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/chat-converter" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Converter
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10 cursor-pointer ring-offset-2 transition-all hover:ring-2 hover:ring-primary">
              <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}