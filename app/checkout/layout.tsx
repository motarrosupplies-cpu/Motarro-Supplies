import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Checkout - Complete Your Order | MOTARRO Supplies",
  description: "Complete your order securely. Enter shipping details, choose payment method, and review your items. Secure checkout with multiple payment options.",
  keywords: [
    "checkout",
    "order",
    "payment",
    "shipping",
    "secure checkout",
    "complete order"
  ],
  openGraph: {
    title: "Checkout - Complete Your Order | MOTARRO Supplies",
    description: "Complete your order securely. Enter shipping details, choose payment method, and review your items.",
    url: "https://www.motarro.co.za/checkout",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/checkout"
  },
  robots: {
    index: false, // Checkout pages shouldn't be indexed
    follow: true
  }
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

