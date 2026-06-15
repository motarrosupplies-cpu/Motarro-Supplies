import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Shopping Cart - Your Items | MOTARRO Supplies",
  description: "Review your selected items in your shopping cart. Update quantities or proceed to checkout. Free delivery on orders over R1000.",
  keywords: [
    "shopping cart",
    "cart",
    "items",
    "checkout",
    "order",
    "shopping",
    "basket"
  ],
  openGraph: {
    title: "Shopping Cart - Your Items | MOTARRO Supplies",
    description: "Review your selected items in your shopping cart. Update quantities or proceed to checkout.",
    url: "https://www.motarro.co.za/cart",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/cart"
  },
  robots: {
    index: false, // Cart pages shouldn't be indexed
    follow: true
  }
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

