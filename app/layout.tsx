import type React from "react"
import "./globals.css"
import "@/styles/animations.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import { PostHogProvider } from "@/components/PostHogProvider"
import ToastProvider from "@/components/toast-provider"
import { Outfit } from "next/font/google"

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: "agenda.dev",
  description: "the world's most powerful todo list",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <ToastProvider />
          </ThemeProvider>
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  )
}
