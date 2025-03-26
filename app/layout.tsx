import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/sonner-toaster"

export const metadata: Metadata = {
  title: "Water Intake Tracker",
  icons: {
    icon: "/icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

