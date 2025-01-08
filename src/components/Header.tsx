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
import { LogOut, Settings, User, FileText, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">The AI Tools</span>
        </Link>
      </div>
      
      <NavigationMenu className="flex-1 flex justify-center">
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

      <div className="flex-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-10 w-10 cursor-pointer ring-offset-2 transition-all hover:ring-2 hover:ring-primary">
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