import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://CraftConnect.local"),
  title: "CraftConnect - Find Local Artisans",
  description: "Connect with trusted local artisans for all your home and business needs.",
  openGraph: {
    title: "CraftConnect - Find Local Artisans",
    description: "Connect with trusted local artisans for all your home and business needs.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CraftConnect - Find Local Artisans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftConnect - Find Local Artisans",
    description: "Connect with trusted local artisans for all your home and business needs.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/auth/redirect"
      signUpFallbackRedirectUrl="/auth/redirect"
    >
      <html lang="en" className={`h-full antialiased ${inter.variable}`}>
        <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
