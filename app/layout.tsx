// Trigger Vercel redeploy - minor noop update
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/components/cart-provider"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { EmailCapturePopup } from "@/components/email-capture-popup"
import { OrganizationSchema, LocalBusinessSchema } from "@/components/seo/schema-org"
import { FlashSaleBanner } from "@/components/ready-to-ship/FlashSaleBanner"
import { Suspense } from "react"
import Script from "next/script"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import { ImagePolyfillLoader } from "@/components/ImagePolyfillLoader"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { getSupabaseUrl, MOTARRO_SUPABASE_PROJECT_REF } from "@/lib/supabase-env"

const supabaseOrigin =
  getSupabaseUrl() ?? `https://${MOTARRO_SUPABASE_PROJECT_REF}.supabase.co`

// Allow static generation for better performance
// Only force-dynamic where truly needed (admin pages, etc.)
export const revalidate = 3600 // Revalidate every hour for ISR

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL, MOTARRO_TAGLINE } from "@/lib/brand"

export const metadata: Metadata = {
  metadataBase: new URL(MOTARRO_SITE_URL),
  title: {
    default: `Stationery & Craft Supplies South Africa | ${MOTARRO_BRAND_NAME}`,
    template: `%s | ${MOTARRO_BRAND_NAME}`,
  },
  description: MOTARRO_DESCRIPTION,
  keywords: [
    "stationery south africa",
    "craft supplies south africa",
    "school supplies johannesburg",
    "art supplies south africa",
    "plastic stationery",
    "paper stationery",
    "wooden craft supplies",
    "metal stationery",
    "acrylic craft supplies",
    "eva foam south africa",
    "motarro supplies",
    "motarro stationery",
    "educational materials",
    "classroom supplies",
    "office stationery",
    "craft materials",
    "taxitiles",
    "crayons south africa",
    "washable paint",
  ],
  openGraph: {
    title: `${MOTARRO_TAGLINE} | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    url: MOTARRO_SITE_URL,
    siteName: MOTARRO_BRAND_NAME,
    images: [
      {
        url: "/brand/Trading_Mark.png",
        width: 1200,
        height: 630,
        alt: `${MOTARRO_BRAND_NAME} — Stationery & Craft Supplies`,
      },
    ],
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${MOTARRO_TAGLINE} | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    images: ["/brand/Trading_Mark.png"],
    creator: "@motarrosupplies",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'oOypDfSvdA7fI1EV30uI7a6SebrV3MTZqGxwk5gG_Gc'
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <LocalBusinessSchema />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={supabaseOrigin} />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes" />
        {/* Analytics and scripts in external files to improve text-HTML ratio (Semrush) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XRLHFTYG11" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XRLHFTYG11',{page_path:window.location.pathname,send_page_view:true});`}
        </Script>
      </head>
      <body className={`${inter.className} page-background`}>
        <MetaPixel />
        <CartProvider>
          <ErrorBoundary>
            <ImagePolyfillLoader />
            <div className="flex flex-col min-h-screen page-background">
              <FlashSaleBanner />
              <Header />
              <main className="flex-1 page-background">
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </div>
            <WhatsAppButton />
            <EmailCapturePopup />
            <Toaster />
            <SonnerToaster position="top-center" closeButton richColors />
          </ErrorBoundary>
        </CartProvider>
      </body>
    </html>
  )
}