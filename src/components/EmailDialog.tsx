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

type EmailData = {
  to: string;
  subject: string;
  message: string;
}

type EmailDialogProps = {
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
  trigger: React.ReactNode;
  onSend: (emailData: EmailData) => void;
}

export function EmailDialog({ 
  recipientEmail, 
  emailSubject, 
  emailBody,
  trigger,
  onSend 
}: EmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    if (open) {
      setEmailData({
        to: recipientEmail,
        subject: emailSubject,
        message: emailBody
      })
    }
  }, [open, recipientEmail, emailSubject, emailBody])

  const handleSend = () => {
    onSend(emailData)
    setOpen(false)
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
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}