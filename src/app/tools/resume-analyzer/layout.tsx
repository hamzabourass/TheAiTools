"use client"

import ClientToaster from '@/components/ClientToaster'
export default function ResumeLayout({ children }: { children: React.ReactNode }) {


  return (
    <div>
        {children}
        <ClientToaster /> 
    
    </div>
  )
}