import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { authOptions } from "@/lib/auth/auth";
import { NotificationProvider } from "@/components/providers/notificationProvider";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getRequestLang } from "@/lib/i18n/server";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata
export const metadata: Metadata = {
  title: "HireLens · AI CV Analyzer",
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
  const lang = await getRequestLang();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider initialLang={lang}>
          <AuthProvider session={session}>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}