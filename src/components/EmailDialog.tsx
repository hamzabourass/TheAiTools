"use client"
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

type EmailData = {
  to: string;
  subject: string;
  message: string;
}

type EmailDialogProps = {
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
  cvFile?: File; // Add cvFile prop
  trigger: React.ReactNode;
  onSend: (emailData: { to: string; subject: string; message: string }, cvFile?: File) => Promise<void>; // Update onSend type
}

export function EmailDialog({ 
  recipientEmail, 
  emailSubject, 
  emailBody,
  cvFile,
  trigger,
  onSend 
}: EmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailData, setEmailData] = useState<EmailData>({
    to: recipientEmail,
    subject: emailSubject,
    message: emailBody
  })

  // Update email data when props change or dialog opens
  useEffect(() => {
    if (open || recipientEmail || emailSubject || emailBody) {
      setEmailData({
        to: recipientEmail,
        subject: emailSubject,
        message: emailBody
      })
    }
  }, [open, recipientEmail, emailSubject, emailBody])

  const handleSend = async () => {
    setIsSending(true)
    try {
      await onSend(emailData, cvFile) // Pass cvFile to onSend
      setOpen(false)
    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error('Failed to send email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Send Application Email</DialogTitle>
          <DialogDescription>
            Review and customize your application email before sending
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 h-full overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">To:</label>
            <Input
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({...prev, to: e.target.value}))}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject:</label>
            <Input
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({...prev, subject: e.target.value}))}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2 flex-grow">
            <label className="text-sm font-medium">Message:</label>
            <Textarea
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({...prev, message: e.target.value}))}
              className="min-h-[400px] resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSending}
          >
            {isSending ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}