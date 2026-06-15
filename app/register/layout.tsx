import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register - Create Account",
  description:
    "Create your MOTARRO Supplies account to start shopping, track orders, and enjoy personalized shopping experience.",
  keywords: ["register", "create account", "sign up", "new user", "customer"],
  openGraph: {
    title: "Register - Create Account",
    description: "Create your MOTARRO Supplies account to start shopping and track orders.",
    url: "https://www.motarro.co.za/register",
  },
  alternates: {
    canonical: "https://www.motarro.co.za/register",
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
