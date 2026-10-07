import Link from "next/link"
import { ScanSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-sm">
        <ScanSearch className="h-4 w-4" />
      </span>
      <span className="text-lg">
        Hire<span className="text-primary">Lens</span>
      </span>
    </Link>
  )
}
