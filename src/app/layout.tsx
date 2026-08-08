import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { SiteShell } from "@/components/SiteShell"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"

const montserratDisplay = Montserrat({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-display" })

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.png",
  },
  verification: {
    google: "tXxWuZ6oM4Q4qDpy3d_ezqhSnXt_TU6KX1Qj_jDXGA4",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`h-full antialiased ${montserratDisplay.variable}`}>
      <body className="min-h-full bg-background text-foreground">
        <meta name="msvalidate.01" content="0B6E2A80B541BDEDB7DB9A4ADBBB0F19" />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
