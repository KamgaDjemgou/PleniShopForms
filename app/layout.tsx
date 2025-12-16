import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Inscription Chadah Academy",
  description: "Formulaire d'inscription à Chadah Academy - Formation en ligne de musique et production musicale",
  generator: "Chadah Academy Forms",
  icons: {
    icon: "/images/chadah-logo.jpg",
    shortcut: "/images/chadah-logo.jpg",
    apple: "/images/chadah-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground min-h-screen">{children}</body>
    </html>
  )
}
