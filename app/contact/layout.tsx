import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Custom Printing Services | MOTARRO Supplies",
  description: "Get in touch with MOTARRO Supplies for custom printing services in Kempton Park and Johannesburg. Contact us via email, phone, or WhatsApp for quotes, support, and custom apparel inquiries.",
  keywords: [
    "contact us",
    "custom printing contact",
    "Kempton Park printing",
    "Johannesburg printing",
    "custom apparel contact",
    "printing services South Africa",
    "apparel printing support"
  ],
  openGraph: {
    title: "Contact Us - Custom Printing Services | MOTARRO Supplies",
    description: "Get in touch with MOTARRO Supplies for custom printing services in Kempton Park and Johannesburg.",
    url: "https://www.motarro.co.za/contact",
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Custom Printing Services | MOTARRO Supplies",
    description: "Get in touch with MOTARRO Supplies for custom printing services in Kempton Park and Johannesburg."
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
