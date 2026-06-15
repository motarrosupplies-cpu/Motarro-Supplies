import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sign In",
  description:
    "Sign in to your MOTARRO Supplies account to access your orders, wishlist, and personalized shopping experience.",
  keywords: ["login", "sign in", "account", "user", "customer"],
  openGraph: {
    title: "Login - Sign In",
    description: "Sign in to your MOTARRO Supplies account to access your orders and wishlist.",
    url: "https://www.motarro.co.za/login",
  },
  alternates: {
    canonical: "https://www.motarro.co.za/login",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
