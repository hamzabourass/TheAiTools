"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/brand/Logo"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useI18n } from "@/lib/i18n/I18nProvider"

const navItems = [
  { key: "howItWorks", id: "how-it-works" },
  { key: "features", id: "features" },
  { key: "faq", id: "faq" },
] as const

const Navbar = () => {
  const { t } = useI18n()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const sectionHref = (id: string) => (isHomePage ? `#${id}` : `/#${id}`)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={sectionHref(item.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/tools/resume-analyzer">
              {t.common.analyzeMyCv}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label={t.nav.openMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t.nav.menu}</SheetTitle>
                <SheetDescription>{t.nav.menuDescription}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 grid gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={sectionHref(item.id)}
                    className="rounded-lg p-3 text-sm font-medium hover:bg-muted"
                  >
                    {t.nav[item.key]}
                  </a>
                ))}
                <Button className="mt-4" asChild>
                  <Link href="/tools/resume-analyzer">{t.common.analyzeMyCv}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar
