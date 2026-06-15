import Link from 'next/link'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: "Privacy Policy | MOTARRO Supplies",
  description: "Learn how MOTARRO Supplies protects your personal information. Our privacy policy explains what data we collect, how we use it, and your rights regarding your personal data.",
  keywords: [
    "privacy policy",
    "data protection",
    "personal information",
    "GDPR",
    "data privacy",
    "customer data",
    "information security"
  ],
  openGraph: {
    title: "Privacy Policy | MOTARRO Supplies",
    description: "Learn how MOTARRO Supplies protects your personal information. Our privacy policy explains what data we collect and how we use it.",
    url: "https://www.motarro.co.za/privacy",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/privacy"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container px-4 py-12 mx-auto space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">
        We respect your privacy and are committed to protecting the personal information you share
        with MOTARRO Supplies. This policy explains what data we collect, how we use it, and the choices you
        have.
      </p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What We Collect</h2>
        <p>
          When you shop or create an account we collect basic contact information, order history,
          and any details needed to complete your purchase and deliver your items. We also gather
          limited analytics data to improve our store performance.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Data</h2>
        <p>
          Your information is used solely to process orders, provide customer support, and send
          relevant updates you opt into. We do not sell your information and only share it with
          trusted providers who help us run the store (for example, payment gateways or courier
          services).
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Choices</h2>
        <p>
          You can request access to, update, or delete your personal data by contacting our support
          team. Marketing emails always include an unsubscribe link and cookie preferences can be
          adjusted in your browser.
        </p>
      </section>
      <p className="text-sm text-muted-foreground">
        Need more detail? Reach out via our{' '}
        <Link href="/contact" className="text-primary underline underline-offset-4">
          contact page
        </Link>
        .
      </p>
    </div>
  )
}

