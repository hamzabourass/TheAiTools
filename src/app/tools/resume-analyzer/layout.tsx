"use client"

import { useEffect } from 'react'
import ClientToaster from '@/components/ClientToaster'
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('RootLayout mounted on the client')
  }, [])

  return (
    <div>
        {children}
        <ClientToaster /> 
    
    </div>
  )
}