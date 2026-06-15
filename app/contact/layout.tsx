import { Metadata } from "next";

import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: `Contact Us | ${MOTARRO_BRAND_NAME}`,
  description: `Contact ${MOTARRO_BRAND_NAME} for stationery and craft supply enquiries. Reach us via email, phone, or WhatsApp for orders, support, and product questions across South Africa.`,
  keywords: [
    "contact motarro",
    "stationery enquiries",
    "craft supplies contact",
    "school supplies south africa",
    "motarro supplies support",
  ],
  openGraph: {
    title: `Contact Us | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    url: `${MOTARRO_SITE_URL}/contact`,
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Us | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
  },
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
