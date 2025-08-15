import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "RealGrind - Master Competitive Programming",
  description:
    "Track your progress, compete with peers, and climb the leaderboards. The ultimate competitive programming platform.",
  keywords: ["competitive programming", "codeforces", "contests", "algorithms", "data structures"],
  authors: [{ name: "RealGrind Team" }],
  openGraph: {
    title: "RealGrind - Master Competitive Programming",
    description: "Track your progress, compete with peers, and climb the leaderboards.",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
