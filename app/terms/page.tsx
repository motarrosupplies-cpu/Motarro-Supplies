import Link from 'next/link'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: "Terms of Service | MOTARRO Supplies",
  description: "Read MOTARRO Supplies's terms of service covering ordering, payment, shipping, returns, and liability. Understand your rights and responsibilities when shopping with us.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "legal",
    "policies",
    "shipping policy",
    "return policy",
    "payment terms",
    "customer rights"
  ],
  openGraph: {
    title: "Terms of Service | MOTARRO Supplies",
    description: "Read MOTARRO Supplies's terms of service covering ordering, payment, shipping, returns, and liability.",
    url: "https://www.motarro.co.za/terms",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/terms"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="container px-4 py-12 mx-auto space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground">
        These terms outline the agreement between MOTARRO Supplies and customers who visit or shop on our
        website. By placing an order you agree to the conditions below.
      </p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ordering & Payment</h2>
        <p>
          All prices are listed in South African Rand (ZAR) and include VAT. <strong>Payment
          confirms your order.</strong> Once payment is received, your order is confirmed and we
          reserve the right to refuse or cancel an order for reasons including, but not limited to,
          fraudulent activity or stock unavailability.
        </p>
        <p>
          <strong>Personalised and custom items:</strong> Due to the nature of our products, many
          items are personalised or manufactured as custom one-off designs and may never be sold to
          any other individual. By paying for such an order, you acknowledge that these items are
          made specifically for you and that standard return or refund rights may not apply as set
          out in our Returns section below.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Shipping & Returns</h2>
        <p>
          We aim to dispatch orders quickly and will provide tracking information where possible.
          Returns are accepted within 30 days for eligible unworn items with original packaging.
          Customised or made-to-order items may have limited or no return options; please contact
          support before returning.
        </p>
        <p>
          <strong>Return costs and courier costs are non-refundable.</strong> Any costs you incur
          for return shipping, courier fees, or similar are your responsibility and will not be
          refunded by MOTARRO Supplies, even when a refund is issued for the product itself.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">General Disclaimers</h2>
        <p>
          Product images and descriptions are for illustration purposes; actual colours and finishes
          may vary slightly. We are not responsible for delays or failures caused by events outside
          our reasonable control (including but not limited to courier delays, customs, weather, or
          force majeure). Use of our website and services is at your own risk.
        </p>
        <p>
          We do not guarantee that our site will be uninterrupted or error-free. MOTARRO Supplies reserves
          the right to modify product offerings, prices, and these terms; continued use of the
          site after changes constitutes acceptance of the updated terms.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Liability</h2>
        <p>
          MOTARRO Supplies is not liable for indirect losses, delays outside our reasonable control, or any
          issues arising from incorrect information provided during checkout. Our maximum liability
          is limited to the value of the order in question.
        </p>
      </section>
      <p className="text-sm text-muted-foreground">
        Questions about these terms?{' '}
        <Link href="/contact" className="text-primary underline underline-offset-4">
          Contact our team
        </Link>
        .
      </p>
    </div>
  )
}

