"use client"

import { cn } from "@/lib/utils"
import { LANGS } from "@/lib/i18n/dictionaries"
import { useI18n } from "@/lib/i18n/I18nProvider"

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn("inline-flex items-center rounded-full border bg-background p-0.5 text-xs font-semibold", className)}
    >
      {LANGS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            lang === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
