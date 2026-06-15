import type { Metadata } from "next"
import { FAQPageSchema } from "@/components/seo/schema-org"
import PricingCalculator from "./PricingCalculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Pricing Calculator | MOTARRO Supplies",
  description: "Get instant pricing for custom t-shirt printing in Johannesburg. Transparent pricing calculator for DTG, screen printing, sublimation, and DTF. No hidden fees. Free quotes in 60 seconds.",
  keywords: ["custom t-shirt printing prices johannesburg", "t-shirt printing cost calculator", "bulk t-shirt printing prices", "dtg printing cost", "screen printing prices johannesburg"],
  alternates: {
    canonical: "/pricing"
  }
}

const faqs = [
  {
    question: "How much does custom t-shirt printing cost in Johannesburg?",
    answer: "Pricing varies by printing method and quantity. DTG printing starts from R195 per shirt for single orders, while screen printing starts from R85 per shirt for orders of 12+. Bulk discounts apply: 10% off for 12-49 units, 15% for 50-99, 20% for 100-249, 25% for 250-499, and 30% for 500+ units. Use our pricing calculator above for instant quotes."
  },
  {
    question: "What's the minimum order for custom t-shirt printing?",
    answer: "Minimum orders vary by printing method: DTG (1 piece), DTF (6 pieces), Screen Printing (12 pieces), Sublimation (12 pieces), Vinyl (1 piece), and Embroidery (6 pieces). Smaller orders are perfect for testing designs, while bulk orders receive significant discounts."
  },
  {
    question: "Do you offer bulk pricing discounts?",
    answer: "Yes! We offer tiered bulk pricing: 10% off for 12-49 units, 15% for 50-99, 20% for 100-249, 25% for 250-499, and 30% for 500+ units. Additional method-specific discounts may apply. Contact us for custom corporate pricing on orders over 1,000 units."
  },
  {
    question: "What's included in the price?",
    answer: "Our pricing includes: high-quality garment, professional printing, design consultation (if needed), quality control, and packaging. Setup fees apply only for screen printing (one-time charge for screens). VAT (15%) is added to all prices. Delivery is extra unless specified in your quote."
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees. Our pricing is completely transparent. The only additional costs are: setup fees for screen printing (one-time, amortized across quantity), rush order fees (50-100% premium for same-day/24hr), and delivery (free for orders over R1,000 in Gauteng). All prices include VAT."
  },
  {
    question: "How do I get a custom quote?",
    answer: "Use our pricing calculator above for instant estimates, or contact us for a detailed quote. For custom designs, corporate orders, or special requirements, email us at motarrodotcoza@gmail.com or call +27-69-622-8848. We provide free quotes within 60 seconds for standard orders."
  },
  {
    question: "What's the cheapest printing method?",
    answer: "Screen printing is the most cost-effective for bulk orders (12+ units), starting from R85 per shirt with bulk discounts. For single items or small orders (1-5 pieces), DTG printing at R195 per shirt is your best option. Vinyl heat press is also affordable for simple designs starting from R110."
  },
  {
    question: "Do prices vary by location in Johannesburg?",
    answer: "No, our pricing is the same across Johannesburg, including Sandton, Randburg, Kempton Park, Rosebank, and Midrand. Delivery fees may vary by location: free delivery for orders over R1,000 in Gauteng, or same-day collection available in Kempton Park at no extra charge."
  },
  {
    question: "Can I get a discount for repeat orders?",
    answer: "Yes! We offer loyalty discounts for repeat customers. Corporate accounts receive additional discounts, and we have special pricing for schools, sports teams, and non-profit organizations. Contact us to set up a corporate account for ongoing savings."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept EFT, credit/debit cards, PayFast, SnapScan, and cash on collection. Corporate accounts can request net 30 payment terms for orders over R5,000. A 50% deposit is required to start production, with balance due on completion."
  },
  {
    question: "How accurate is the pricing calculator?",
    answer: "Our calculator provides accurate estimates for standard orders. Final pricing may vary slightly based on design complexity, garment type, color count, and special requirements. All quotes are confirmed before production begins. For exact pricing, request a free quote."
  },
  {
    question: "Do you price match competitors?",
    answer: "Yes, we offer competitive pricing and will match legitimate quotes from competitors in Johannesburg. Contact us with the competitor's quote, and we'll review and match it while ensuring you receive the same quality and service standards."
  }
]

export default function PricingPage() {
  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <h1 className="sr-only">Pricing calculator</h1>
      <PricingCalculator />
      <div className="container px-4 py-12 mx-auto max-w-6xl">
        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions About Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
