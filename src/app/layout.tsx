import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { authOptions } from "@/lib/auth/auth";
import { NotificationProvider } from "@/components/providers/notificationProvider";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata
export const metadata: Metadata = {
  title: "The Ai Tools",
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