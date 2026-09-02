import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://smartbooking.local"),
  title: "SmartBooking - Find Local Artisans",
  description: "Connect with trusted local artisans for all your home and business needs.",
  openGraph: {
    title: "SmartBooking - Find Local Artisans",
    description: "Connect with trusted local artisans for all your home and business needs.",
    type: "website",
    // NOTE: Supply a real 1200x630 OpenGraph preview image at public/og-image.png
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartBooking - Find Local Artisans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBooking - Find Local Artisans",
    description: "Connect with trusted local artisans for all your home and business needs.",
    // NOTE: Supply a real 1200x630 Twitter preview image at public/og-image.png
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-white text-slate-900">
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
