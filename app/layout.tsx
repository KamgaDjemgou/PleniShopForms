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
  title: "Reservation PleniHarmony",
  description: "Formulaire de commande pour les services de chant et d'accompagnement musical - PleniSofts",
  generator: "PleniSofts",
  icons: {
    icon: "/images/plenisofts-logo.png",
    shortcut: "/images/plenisofts-logo.png",
    apple: "/images/plenisofts-logo.png",
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
