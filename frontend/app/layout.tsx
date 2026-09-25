import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { LanguageProvider } from "@/context/LanguageContext"
import PWARegistrar from "@/components/common/PWARegistrar"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_APP_URL || "https://www.maison-zdr.online").replace(/\/+$/, "")
  ),
  title: {
    default: "Zone de Rassemblement | Maison ZDR",
    template: "%s | Zone de Rassemblement",
  },
  description: "Discover and register for events at Maison ZDR. Browse upcoming activities, subscribe to events, and join our community.",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "S4uX1xFnr89z8ikskNobxhUtMCm529r7tcFHdqNjMQg",
  },
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
      className={cn("antialiased", "light", fontMono.variable, "font-sans", geist.variable)}
      style={{ colorScheme: "light" }}
    >
      <body>
        <PWARegistrar />
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
