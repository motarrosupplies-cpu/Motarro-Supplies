import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"

export const metadata: Metadata = {
  title: "Blog | Custom Apparel & Printing Insights | MOTARRO Supplies",
  description: "Discover the latest trends in custom apparel, printing techniques, corporate branding tips, and industry insights. Expert advice for businesses and individuals looking to create unique branded merchandise in Johannesburg and South Africa.",
  keywords: [
    "custom apparel blog",
    "printing techniques",
    "corporate branding",
    "promotional merchandise",
    "fashion trends",
    "business branding",
    "custom printing tips",
    "apparel industry insights",
    "custom apparel johannesburg",
    "printing services south africa",
    "corporate uniforms blog",
    "event merchandise tips"
  ],
  openGraph: {
    title: "Blog | Custom Apparel & Printing Insights | MOTARRO Supplies",
    description: "Discover the latest trends in custom apparel, printing techniques, and corporate branding tips.",
    url: "https://www.motarro.co.za/blog",
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/blog"
  }
}

export default function BlogPage() {
  return (
    <>
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-4">
          Blog – Custom Apparel &amp; Printing Insights
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Discover the latest trends in custom apparel, printing techniques, and corporate branding from MOTARRO Supplies. We share expert advice on custom printed clothing, promotional merchandise, and branded wear for businesses and individuals across Johannesburg and South Africa.
        </p>
        <p className="text-muted-foreground mb-8">
          From sublimation and screen printing tips to event merchandise and fashion trends, our blog helps you make informed decisions about your next custom apparel project.
        </p>
      </div>
      <BlogPageClient />
    </>
  )
}
