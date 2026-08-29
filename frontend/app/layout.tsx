import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import PWARegistrar from "@/components/PWARegistrar"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Zone de Rassemblement | Maison ZDR",
    template: "%s | Zone de Rassemblement",
  },
  description: "Discover and register for events at Maison ZDR. Browse upcoming activities, subscribe to events, and join our community.",
  openGraph: {
    title: "Zone de Rassemblement | Maison ZDR",
    description: "Discover and register for events at Maison ZDR",
    siteName: "Zone de Rassemblement",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <PWARegistrar />
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
