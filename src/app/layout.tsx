import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { authOptions } from "@/lib/auth/auth";
import { NotificationProvider } from "@/components/providers/notificationProvider";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata
export const metadata: Metadata = {
  title: "The AI Tools · CV Analyzer",
  description: "Upload your CV and a job description to get an explainable match score, a requirement checklist and a prioritized plan to improve your application.",
  icons: {
    icon: "/favicon.svg", // Use the resized image
  },
};



// RootLayout component
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider session={session}>
          <NotificationProvider>
            {children}
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}