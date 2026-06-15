import Link from "next/link"
import { Clock, Zap, CheckCircle2, MapPin, Truck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import { FAQPageSchema, ServiceSchema } from "@/components/seo/schema-org"

export const metadata: Metadata = {
  title: "Rush Orders & Same-Day Printing | MOTARRO Supplies",
  description: "Same-day collection in Kempton Park and 24-48hr delivery across Gauteng. Rush custom printing services with 50-100% premium. Fast turnaround for urgent orders in Johannesburg.",
  keywords: ["same-day t-shirt printing johannesburg", "rush order printing", "24 hour printing service", "urgent custom printing", "same-day collection kempton park"],
  alternates: {
    canonical: "/rush-orders"
  }
}

const faqs = [
  {
    question: "Do you offer same-day printing in Johannesburg?",
    answer: "Yes! We offer same-day collection in Kempton Park for select printing methods (Vinyl Heat Press, simple DTG orders). Same-day service requires orders placed before 10 AM and incurs a 100% rush premium. Contact us to confirm same-day availability for your order."
  },
  {
    question: "What's the fastest turnaround time for custom printing?",
    answer: "Vinyl Heat Press offers same-day service (orders before 10 AM). DTG and DTF offer 24-48 hour rush service. Screen printing and sublimation require minimum 3-5 days even for rush orders. Rush orders incur a 50-100% premium depending on method and urgency."
  },
  {
    question: "How much extra does rush order service cost?",
    answer: "Rush order premiums: Same-day (100% premium), 24-hour (75% premium), 48-hour (50% premium). For example, a R195 DTG order becomes R390 for same-day, R341 for 24-hour, or R293 for 48-hour. Contact us for exact rush pricing based on your order."
  },
  {
    question: "Can I get same-day collection in Kempton Park?",
    answer: "Yes! Same-day collection is available in Kempton Park for Vinyl Heat Press and simple DTG orders placed before 10 AM. Orders are ready for collection by 4 PM the same day. Free collection - no delivery fees when you pick up."
  },
  {
    question: "What printing methods are available for rush orders?",
    answer: "Vinyl Heat Press: Same-day available. DTG: 24-48 hour rush available. DTF: 24-48 hour rush available. Screen Printing: Minimum 3-5 days (setup time required). Sublimation: Minimum 3-5 days. Embroidery: Minimum 5-7 days (not available for rush)."
  },
  {
    question: "How far in advance do I need to order for rush service?",
    answer: "Same-day: Order before 10 AM (Kempton Park collection only). 24-hour: Order before 2 PM previous day. 48-hour: Order before 2 PM two days prior. Rush availability depends on current workload - contact us to confirm before ordering."
  },
  {
    question: "Do rush orders have minimum quantities?",
    answer: "Rush orders follow standard minimums: DTG (1 piece), DTF (6 pieces), Vinyl (1 piece). Screen printing rush requires minimum 12 pieces. Smaller rush orders are easier to accommodate. Bulk rush orders (50+) may require additional time."
  },
  {
    question: "Can I get rush delivery across Gauteng?",
    answer: "Yes! We offer 24-48 hour courier delivery across Gauteng for rush orders. Same-day delivery available to select areas (Sandton, Randburg, Rosebank) for orders placed before 10 AM. Delivery fees apply and vary by location."
  },
  {
    question: "What if I need my order even faster than same-day?",
    answer: "For orders needed within hours, Vinyl Heat Press is your only option. We can complete simple vinyl orders in 2-4 hours for emergency situations, subject to availability and with a 150% premium. Contact us immediately for emergency orders."
  },
  {
    question: "Are there any design limitations for rush orders?",
    answer: "Rush orders work best with simple designs. Complex graphics, multiple colors, or intricate details may require additional time. Screen printing rush orders are limited to 1-3 colors. Contact us with your design to confirm rush feasibility."
  }
]

export default function RushOrdersPage() {
  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <ServiceSchema
        name="Rush Custom Printing Service"
        description="Same-day collection in Kempton Park and 24-48 hour delivery across Gauteng for urgent custom printing orders"
        provider={{
          name: "MOTARRO Supplies",
          url: "https://www.motarro.co.za"
        }}
        areaServed={[
          { name: "Kempton Park", type: "City" },
          { name: "Johannesburg", type: "City" },
          { name: "Sandton", type: "City" },
          { name: "Randburg", type: "City" },
          { name: "Rosebank", type: "City" },
          { name: "Gauteng", type: "State" }
        ]}
        serviceType="RushPrintingService"
      />
      <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
        <div className="container px-4 py-12 mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                Rush Orders & Same-Day Service
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Need your custom printing done fast? Same-day collection in Kempton Park and 24-48hr delivery across Gauteng.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800">
              ⚡ Same-Day Available
            </Badge>
          </div>

          {/* Service Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-yellow-400 shadow-xl">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  Same-Day Service
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-black text-primary mb-2">100% Premium</p>
                    <p className="text-sm text-muted-foreground">Additional cost for urgency</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Order before 10 AM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Ready by 4 PM same day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Kempton Park collection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Vinyl & Simple DTG only</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-400 shadow-xl">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  24-Hour Rush
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-black text-primary mb-2">75% Premium</p>
                    <p className="text-sm text-muted-foreground">Additional cost for urgency</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Order before 2 PM previous day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Ready next business day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>DTG, DTF available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Gauteng delivery available</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-400 shadow-xl">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                  48-Hour Rush
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-black text-primary mb-2">50% Premium</p>
                    <p className="text-sm text-muted-foreground">Additional cost for urgency</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Order before 2 PM two days prior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Ready in 2 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>All methods available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Nationwide delivery</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Process */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Rush Order Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-bold mb-2">Contact Us</h3>
                  <p className="text-sm text-muted-foreground">
                    Call, email, or WhatsApp with your order details and deadline
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-bold mb-2">Confirm Availability</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll confirm if rush service is available for your order
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-bold mb-2">Pay & Approve</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay 50% deposit and approve design. Production starts immediately
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
                    4
                  </div>
                  <h3 className="font-bold mb-2">Collect/Deliver</h3>
                  <p className="text-sm text-muted-foreground">
                    Same-day collection in Kempton Park or fast delivery across Gauteng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Examples */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Rush Order Pricing Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-lg mb-2">Example 1: Same-Day DTG (10 t-shirts)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standard: R195 × 10 = R1,950 + VAT = R2,243
                  </p>
                  <p className="text-sm font-semibold">
                    Same-Day: R390 × 10 = R3,900 + VAT = <span className="text-primary">R4,485</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready for collection in Kempton Park by 4 PM same day
                  </p>
                </div>
                <div className="border-l-4 border-orange-400 pl-4">
                  <h3 className="font-bold text-lg mb-2">Example 2: 24-Hour Screen Print (50 t-shirts)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standard: R85 × 50 = R4,250 + VAT = R4,889
                  </p>
                  <p className="text-sm font-semibold">
                    24-Hour: R149 × 50 = R7,450 + VAT = <span className="text-primary">R8,568</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready next business day with delivery across Gauteng
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-bold text-lg mb-2">Example 3: 48-Hour Sublimation (25 items)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standard: R125 × 25 = R3,125 + VAT = R3,594
                  </p>
                  <p className="text-sm font-semibold">
                    48-Hour: R188 × 25 = R4,700 + VAT = <span className="text-primary">R5,405</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready in 2 business days with nationwide delivery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="mb-12 border-yellow-400 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Important Rush Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <span><strong>Availability:</strong> Rush service subject to current workload. Always confirm availability before placing rush orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <span><strong>Design Complexity:</strong> Complex designs may require additional time even for rush orders. Simple designs process faster.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <span><strong>Payment:</strong> 50% deposit required to start rush production. Balance due on completion or before delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <span><strong>Collection:</strong> Same-day collection available in Kempton Park only. Free collection - no delivery fees when you pick up.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <span><strong>Delivery:</strong> Rush delivery available across Gauteng. Same-day delivery to Sandton, Randburg, Rosebank for orders before 10 AM.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
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

          {/* CTA */}
          <div className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-3xl font-black mb-4">Need Your Order Fast?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Contact us immediately to confirm rush availability. Same-day collection in Kempton Park or fast delivery across Gauteng.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">Request Rush Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="tel:+27696228848">
                  <Clock className="w-4 h-4 mr-2" />
                  Call Now: +27-69-622-8848
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <MapPin className="w-4 h-4 inline mr-1" />
              Same-day collection available in Kempton Park
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

