import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/components/providers/auth-provider"
import { authOptions } from "@/lib/auth/auth" 
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

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
          <Header/>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}