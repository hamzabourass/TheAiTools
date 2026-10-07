"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, Loader2, Paperclip, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/I18nProvider"

export type EmailData = { to: string; subject: string; message: string }

type EmailPanelProps = {
  recipientEmail: string
  subject: string
  body: string
  cvFileName?: string
  onSend: (email: EmailData) => Promise<void>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailPanel({ recipientEmail, subject, body, cvFileName, onSend }: EmailPanelProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState<EmailData>({ to: recipientEmail, subject, message: body })
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const update = (field: keyof EmailData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEmail((prev) => ({ ...prev, [field]: e.target.value }))

  const recipientValid = EMAIL_PATTERN.test(email.to.trim())
  const wordCount = email.message.trim() ? email.message.trim().split(/\s+/).length : 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${t.email.subject}: ${email.subject}\n\n${email.message}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t.email.copyFailed)
    }
  }

  const openInMailApp = () => {
    const params = new URLSearchParams({ subject: email.subject, body: email.message })
    window.location.href = `mailto:${encodeURIComponent(email.to.trim())}?${params.toString().replace(/\+/g, "%20")}`
  }

  const send = async () => {
    setIsSending(true)
    try {
      await onSend({ ...email, to: email.to.trim() })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email-to" className="text-xs">{t.email.to}</Label>
          <Input id="email-to" value={email.to} onChange={update("to")} placeholder="recruiter@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email-subject" className="text-xs">{t.email.subject}</Label>
          <Input id="email-subject" value={email.subject} onChange={update("subject")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-body" className="text-xs">{t.email.message}</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{t.email.words(wordCount)}</span>
        </div>
        <Textarea id="email-body" value={email.message} onChange={update("message")} className="min-h-[320px] leading-relaxed" />
      </div>

      {cvFileName && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5" />
          {t.email.attachNote(cvFileName)}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={send} disabled={!recipientValid || isSending}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isSending ? t.email.sending : t.email.send}
        </Button>
        <Button variant="outline" onClick={copy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? t.email.copied : t.email.copy}
        </Button>
        <Button variant="outline" onClick={openInMailApp}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {t.email.openMail}
        </Button>
      </div>
      {!recipientValid && <p className="text-xs text-muted-foreground">{t.email.needRecipient}</p>}
    </div>
  )
}
