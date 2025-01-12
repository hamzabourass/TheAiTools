"use client" // Add this directive to make RootLayout a Client Component

import { useEffect } from 'react'
import ClientToaster from '@/components/ClientToaster' // Adjust the import path as needed

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('RootLayout mounted on the client')
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <ClientToaster /> {/* Include the ClientToaster component */}
      </body>
    </html>
  )
}