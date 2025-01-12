import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth/next"
import { AuthProvider } from "@/components/providers/auth-provider"
import { authOptions } from "@/lib/auth/auth" 
import { NotificationProvider } from "@/components/providers/notificationProvider"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: 'The Ai Tools',
  icons: {
    icon: '/favicon.svg', // Use the resized image
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider session={session}>
        <NotificationProvider>

          {children}
        </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}