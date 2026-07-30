import type { Metadata } from "next"
import { headers } from "next/headers"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserratDisplay = Montserrat({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-display" })
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { PostHogProvider } from "@/components/PostHogProvider"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const adminSecret = process.env.ADMIN_SECRET_PATH || "manage-rodatrip"
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith(`/${adminSecret}`)

  if (isAdmin) {
    return (
      <html lang="id" className={`h-full antialiased ${montserratDisplay.variable}`}>
        <body className="min-h-full bg-background text-foreground">
          <meta name="msvalidate.01" content="0B6E2A80B541BDEDB7DB9A4ADBBB0F19" />
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="id" className={`h-full antialiased ${montserratDisplay.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <meta name="msvalidate.01" content="0B6E2A80B541BDEDB7DB9A4ADBBB0F19" />
        <PostHogProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  )
}
