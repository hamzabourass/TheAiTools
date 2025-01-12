'use client';

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function TestEmailButton() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<string>('')
  const [result, setResult] = useState<any>(null)

  const testGmailAccess = async () => {
    try {
      setStatus('Testing Gmail access...')
      const response = await fetch('/api/test/email')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
      setStatus('Success!')
      
    } catch (error: any) {
      console.error('Test failed:', error)
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={testGmailAccess}>
        Test Gmail Access
      </Button>
      {status && (
        <p className={status.includes('Error') ? 'text-red-500' : 'text-green-500'}>
          {status}
        </p>
      )}
      {result && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}