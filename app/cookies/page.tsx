import Link from 'next/link'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: "Cookie Policy | MOTARRO Supplies",
  description: "Learn about how MOTARRO Supplies uses cookies and similar technologies. Understand essential cookies, analytics, and how to manage your cookie preferences.",
  keywords: [
    "cookie policy",
    "cookies",
    "privacy",
    "data collection",
    "analytics",
    "browser settings"
  ],
  openGraph: {
    title: "Cookie Policy | MOTARRO Supplies",
    description: "Learn about how MOTARRO Supplies uses cookies and similar technologies to provide core functionality and improve your experience.",
    url: "https://www.motarro.co.za/cookies",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/cookies"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function CookiePolicyPage() {
  return (
    <div className="container px-4 py-12 mx-auto space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="text-muted-foreground">
        MOTARRO Supplies uses cookies and similar technologies to provide core functionality, remember your
        preferences, and understand how visitors use our store.
      </p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Essential Cookies</h2>
        <p>
          These cookies are required to keep the site running. They handle things like remembering
          items in your cart or keeping you signed in. You can disable them in your browser, but the
          site may not work correctly.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Analytics & Marketing</h2>
        <p>
          We use analytics cookies to measure traffic and understand which pages are performing
          well. Marketing cookies (including the Meta/Facebook Pixel) help us measure ad
          performance and show relevant products and promotions. You can opt out of analytics tools
          like Google Analytics, or block marketing cookies via your browser or ad preferences, if
          you prefer.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Managing Cookies</h2>
        <p>
          Most browsers allow you to manage cookies through their settings. You can clear existing
          cookies or block new ones. For detailed instructions refer to your browser&apos;s help
          documentation.
        </p>
      </section>
      <p className="text-sm text-muted-foreground">
        Need more information?{' '}
        <Link href="/contact" className="text-primary underline underline-offset-4">
          Reach out to us
        </Link>
        .
      </p>
    </div>
  )
}

