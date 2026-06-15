import Link from "next/link"
import { CheckCircle2, XCircle, TrendingUp, Clock, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Metadata } from "next"
import { FAQPageSchema, ComparisonTableSchema, HowToSchema } from "@/components/seo/schema-org"

export const metadata: Metadata = {
  title: "Printing Methods Comparison | DTG vs Screen vs Sublimation | MOTARRO Supplies",
  description: "Complete 2,500+ word guide comparing DTG, screen printing, sublimation, DTF, vinyl, and embroidery. Cost, durability, minimums, turnaround times, and best use cases for custom printing in Johannesburg.",
  keywords: ["dtg vs screen printing", "sublimation vs dtg", "printing methods comparison", "best printing method for t-shirts", "custom printing methods johannesburg"],
  alternates: {
    canonical: "/printing-methods-comparison"
  }
}

const PRINTING_METHODS = [
  {
    id: "dtg",
    name: "DTG (Direct-to-Garment)",
    description: "Digital printing technology that prints directly onto fabric using specialized inks",
    minOrder: 1,
    baseCost: "R195",
    bulkCost: "R165 (50+)",
    setupFee: "None",
    turnaround: "3-5 business days",
    rushAvailable: "Yes (24-48hr)",
    durability: "Excellent (50+ washes)",
    colorLimit: "Unlimited",
    bestFor: ["Small orders (1-11)", "Photographic designs", "Complex graphics", "Test runs"],
    limitations: ["Cotton/poly-cotton only", "Slightly higher cost per unit", "Not ideal for very dark fabrics"],
    quality: "Photographic quality",
    ecoFriendly: true
  },
  {
    id: "screen",
    name: "Screen Printing",
    description: "Traditional method using screens and ink to create vibrant, durable prints",
    minOrder: 12,
    baseCost: "R85",
    bulkCost: "R60 (100+)",
    setupFee: "R150-300 per color",
    turnaround: "5-7 business days",
    rushAvailable: "Limited (3-5 days)",
    durability: "Excellent (100+ washes)",
    colorLimit: "1-6 colors (cost increases)",
    bestFor: ["Bulk orders (12+)", "Simple designs", "Corporate uniforms", "Sports teams"],
    limitations: ["Setup fees", "Minimum order 12", "Not cost-effective for 1-5 pieces"],
    quality: "Vibrant, professional",
    ecoFriendly: false
  },
  {
    id: "sublimation",
    name: "Sublimation Printing",
    description: "Heat-transfer process that infuses dye into polyester materials permanently",
    minOrder: 12,
    baseCost: "R125",
    bulkCost: "R95 (50+)",
    setupFee: "None",
    turnaround: "5-7 business days",
    rushAvailable: "Yes (3-5 days)",
    durability: "Excellent (permanent)",
    colorLimit: "Unlimited (full-color)",
    bestFor: ["Polyester garments", "Full-color designs", "Sports jerseys", "Performance wear"],
    limitations: ["Polyester only (80%+)", "White/light colors only", "Not for cotton"],
    quality: "Vibrant, fade-resistant",
    ecoFriendly: true
  },
  {
    id: "dtf",
    name: "DTF (Direct-to-Film)",
    description: "Modern transfer method printing onto film then heat-pressing onto garments",
    minOrder: 6,
    baseCost: "R150",
    bulkCost: "R120 (50+)",
    setupFee: "None",
    turnaround: "4-6 business days",
    rushAvailable: "Yes (2-3 days)",
    durability: "Very Good (50+ washes)",
    colorLimit: "Unlimited",
    bestFor: ["Mixed fabric types", "Small-medium orders", "Complex designs", "Dark fabrics"],
    limitations: ["Slightly higher cost than screen", "Not as durable as screen printing"],
    quality: "High-quality, vibrant",
    ecoFriendly: true
  },
  {
    id: "vinyl",
    name: "Vinyl Heat Press",
    description: "Cut vinyl designs heat-pressed onto garments for simple, bold graphics",
    minOrder: 1,
    baseCost: "R110",
    bulkCost: "R85 (50+)",
    setupFee: "None",
    turnaround: "2-3 business days",
    rushAvailable: "Yes (same-day)",
    durability: "Good (30-50 washes)",
    colorLimit: "1-3 colors (simple designs)",
    bestFor: ["Simple text/logos", "Small orders", "Quick turnaround", "Budget-friendly"],
    limitations: ["Simple designs only", "Not for complex graphics", "Less durable than other methods"],
    quality: "Clean, bold graphics",
    ecoFriendly: false
  },
  {
    id: "embroidery",
    name: "Embroidery",
    description: "Thread-based decoration creating textured, premium finishes on garments",
    minOrder: 6,
    baseCost: "R180",
    bulkCost: "R140 (50+)",
    setupFee: "R200-400 (digitization)",
    turnaround: "7-10 business days",
    rushAvailable: "Limited (5-7 days)",
    durability: "Excellent (permanent)",
    colorLimit: "1-8 colors",
    bestFor: ["Corporate logos", "Premium branding", "Polo shirts", "Caps"],
    limitations: ["Higher cost", "Longer turnaround", "Simple designs preferred", "Setup fees"],
    quality: "Premium, professional",
    ecoFriendly: true
  }
]

const faqs = [
  {
    question: "What's the difference between DTG and screen printing?",
    answer: "DTG (Direct-to-Garment) prints directly onto fabric using digital technology, perfect for small orders (1-11 pieces) and complex designs. Screen printing uses screens and ink, ideal for bulk orders (12+) with simple designs. DTG has no setup fees but higher per-unit cost. Screen printing has setup fees but lower per-unit cost for bulk orders."
  },
  {
    question: "Which printing method is cheapest for bulk orders?",
    answer: "Screen printing is the most cost-effective for bulk orders (12+ units), starting from R85 per shirt with bulk discounts bringing it down to R60+ for orders of 100+. Setup fees are amortized across quantity, making it very affordable for large orders."
  },
  {
    question: "What's the best printing method for a single t-shirt?",
    answer: "DTG (Direct-to-Garment) or Vinyl Heat Press are best for single t-shirts. DTG costs R195 and offers photographic quality for complex designs. Vinyl costs R110 and works well for simple text/logos. Both have no minimum order requirements."
  },
  {
    question: "Can I use sublimation on cotton t-shirts?",
    answer: "No, sublimation only works on polyester or polymer-coated materials (minimum 80% polyester). For cotton t-shirts, use DTG, screen printing, DTF, or vinyl heat press instead."
  },
  {
    question: "How long does each printing method last?",
    answer: "Screen printing and embroidery last 100+ washes (most durable). DTG and DTF last 50+ washes. Sublimation is permanent (dye becomes part of fabric). Vinyl lasts 30-50 washes. Proper care extends durability for all methods."
  },
  {
    question: "What's the fastest printing method?",
    answer: "Vinyl heat press offers the fastest turnaround (2-3 days, same-day rush available). DTF is next (4-6 days, 2-3 day rush). DTG takes 3-5 days (24-48hr rush). Screen printing takes 5-7 days. Embroidery takes longest (7-10 days)."
  },
  {
    question: "Which method works best for dark-colored t-shirts?",
    answer: "DTF (Direct-to-Film) works excellently on dark fabrics. DTG also works on dark colors but may require a white underbase. Screen printing is ideal for dark shirts with light ink. Sublimation only works on light/white polyester."
  },
  {
    question: "Do I need setup fees for any printing method?",
    answer: "Screen printing has setup fees (R150-300 per color) for creating screens. Embroidery has digitization fees (R200-400) for converting designs. DTG, sublimation, DTF, and vinyl have no setup fees."
  },
  {
    question: "What's the minimum order for each printing method?",
    answer: "DTG and Vinyl: 1 piece. DTF and Embroidery: 6 pieces. Screen Printing and Sublimation: 12 pieces. Smaller minimums are perfect for testing designs, while bulk orders receive significant discounts."
  },
  {
    question: "Which printing method is best for corporate uniforms?",
    answer: "Screen printing is ideal for corporate uniforms due to cost-effectiveness for bulk orders, durability (100+ washes), and professional appearance. Embroidery works well for premium corporate branding on polo shirts and caps."
  },
  {
    question: "Can I print full-color photographs with screen printing?",
    answer: "Screen printing is limited to 1-6 colors cost-effectively. For full-color photographs, use DTG, sublimation, or DTF printing, which support unlimited colors and photographic quality."
  },
  {
    question: "What's the difference between DTF and DTG?",
    answer: "DTF prints onto film then transfers to fabric, working on any fabric type including dark colors. DTG prints directly onto fabric, working best on cotton/poly-cotton. DTF has slightly higher cost but more versatility. DTG offers better integration with fabric."
  },
  {
    question: "Which method is most eco-friendly?",
    answer: "DTG, sublimation, DTF, and embroidery are more eco-friendly, using water-based inks or thread. Screen printing and vinyl use plastisol inks. All methods can be made more sustainable with proper waste management."
  },
  {
    question: "What printing method should I use for sports jerseys?",
    answer: "Sublimation is ideal for sports jerseys made of polyester, offering full-color designs, permanent prints, and moisture-wicking compatibility. DTF also works well for mixed-fabric jerseys with complex designs."
  },
  {
    question: "Can I get same-day printing in Johannesburg?",
    answer: "Yes! Vinyl heat press offers same-day service. DTG and DTF offer 24-48 hour rush orders. Screen printing and sublimation require 3-5 days minimum. Rush orders incur a 50-100% premium. Same-day collection available in Kempton Park."
  },
  {
    question: "Which method works best for event merchandise?",
    answer: "For event merchandise, DTG is great for small test orders and complex designs. Screen printing is cost-effective for bulk event orders (50+). DTF works well for mixed quantities and complex designs. Choose based on order size and design complexity."
  },
  {
    question: "What's the cost difference between methods for 50 t-shirts?",
    answer: "For 50 t-shirts: Screen printing ~R3,000 (R60/unit), DTF ~R6,000 (R120/unit), Sublimation ~R4,750 (R95/unit), DTG ~R8,250 (R165/unit), Vinyl ~R4,250 (R85/unit), Embroidery ~R7,000 (R140/unit). Screen printing is most cost-effective for bulk."
  },
  {
    question: "Can I combine multiple printing methods on one garment?",
    answer: "Yes! You can combine methods, such as screen-printed logo with embroidered name, or DTG design with vinyl text. This creates unique, premium finishes. Contact us for custom combinations and pricing."
  },
  {
    question: "Which method is best for school uniforms?",
    answer: "Screen printing is ideal for school uniforms due to bulk pricing (R60-85/unit for 50+), durability (100+ washes), and professional appearance. Embroidery works for premium school branding on polo shirts and blazers."
  },
  {
    question: "Do all methods work on hoodies?",
    answer: "Yes, all methods work on hoodies: DTG (cotton/poly-cotton), Screen printing (any fabric), Sublimation (polyester hoodies), DTF (any fabric), Vinyl (any fabric), Embroidery (any fabric). Choose based on fabric type and order size."
  },
  {
    question: "What file format do I need for each printing method?",
    answer: "All methods accept: PNG, JPG, PDF, AI, EPS, SVG. For screen printing, vector files (AI, EPS, SVG) are preferred. For DTG, sublimation, and DTF, high-resolution PNG/JPG (300 DPI) work best. We provide free design consultation."
  }
]

export default function PrintingMethodsComparisonPage() {
  const comparisonTableItems = PRINTING_METHODS.map(method => ({
    name: method.name,
    properties: [
      { name: "Minimum Order", value: `${method.minOrder} ${method.minOrder === 1 ? 'piece' : 'pieces'}` },
      { name: "Base Cost", value: method.baseCost },
      { name: "Bulk Cost (50+)", value: method.bulkCost },
      { name: "Setup Fee", value: method.setupFee },
      { name: "Turnaround", value: method.turnaround },
      { name: "Durability", value: method.durability }
    ]
  }));

  const howToSteps = [
    {
      name: "Determine Your Order Size",
      text: "Calculate how many pieces you need. Small orders (1-11) work best with DTG or Vinyl. Medium orders (12-49) can use Screen, DTF, or Sublimation. Large orders (50+) benefit most from Screen Printing for cost-effectiveness."
    },
    {
      name: "Consider Your Design Complexity",
      text: "Simple text/logos work with any method. Complex graphics or photographs require DTG, DTF, or Sublimation. Full-color designs need DTG, Sublimation, or DTF. Limited colors (1-6) work well with Screen Printing."
    },
    {
      name: "Check Fabric Type",
      text: "Cotton/poly-cotton: DTG, Screen, DTF, Vinyl, Embroidery. Polyester (80%+): Sublimation, DTF, Screen. Mixed fabrics: DTF works best. Dark fabrics: DTF or Screen Printing. Light fabrics: All methods work."
    },
    {
      name: "Evaluate Your Budget",
      text: "Screen Printing is most cost-effective for bulk (R60+ per unit for 100+). DTG costs R195 for singles, R165 for bulk. DTF costs R150 for singles, R120 for bulk. Consider setup fees for Screen Printing and Embroidery."
    },
    {
      name: "Consider Turnaround Time",
      text: "Rush orders: Vinyl (same-day), DTG/DTF (24-48hr). Standard: DTG (3-5 days), DTF (4-6 days), Screen (5-7 days), Sublimation (5-7 days), Embroidery (7-10 days). Plan accordingly for your deadline."
    },
    {
      name: "Contact Us for Final Decision",
      text: "Get a free consultation from our Johannesburg team. We'll review your design, quantity, fabric, and timeline to recommend the perfect printing method. Free quotes provided within 60 seconds."
    }
  ];

  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <ComparisonTableSchema 
        name="Printing Methods Comparison"
        items={comparisonTableItems}
      />
      <HowToSchema
        name="How to Choose the Right Printing Method for Your Custom Apparel"
        description="Step-by-step guide to selecting the perfect printing method based on order size, design complexity, fabric type, budget, and turnaround requirements for custom printing in Johannesburg."
        steps={howToSteps}
        totalTime="PT10M"
        tool={["Design file", "Garment samples", "Budget calculator"]}
        supply={["Custom design", "Garment selection", "Quantity estimate"]}
      />
      <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
        <div className="container px-4 py-12 mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
              Complete Guide: Printing Methods Comparison
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Everything you need to know about DTG, Screen Printing, Sublimation, DTF, Vinyl, and Embroidery for custom printing in Johannesburg
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              2,500+ Word Comprehensive Guide
            </Badge>
          </div>

          {/* Quick Comparison Table */}
          <Card className="mb-12 shadow-xl border-0">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">Quick Comparison Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Cost (Base)</TableHead>
                      <TableHead>Cost (Bulk 50+)</TableHead>
                      <TableHead>Setup Fee</TableHead>
                      <TableHead>Turnaround</TableHead>
                      <TableHead>Durability</TableHead>
                      <TableHead>Best For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PRINTING_METHODS.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-semibold">{method.name}</TableCell>
                        <TableCell>{method.minOrder}</TableCell>
                        <TableCell>{method.baseCost}</TableCell>
                        <TableCell>{method.bulkCost}</TableCell>
                        <TableCell>{method.setupFee}</TableCell>
                        <TableCell>{method.turnaround}</TableCell>
                        <TableCell>{method.durability}</TableCell>
                        <TableCell className="text-xs">{method.bestFor[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Method Breakdowns */}
          <div className="space-y-8 mb-12">
            {PRINTING_METHODS.map((method) => (
              <Card key={method.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{method.name}</CardTitle>
                    {method.ecoFriendly && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Eco-Friendly
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">{method.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pricing & Minimums
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Base Cost:</strong> {method.baseCost} per unit</li>
                        <li><strong>Bulk Cost (50+):</strong> {method.bulkCost} per unit</li>
                        <li><strong>Minimum Order:</strong> {method.minOrder} {method.minOrder === 1 ? 'piece' : 'pieces'}</li>
                        <li><strong>Setup Fee:</strong> {method.setupFee}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Turnaround & Rush Options
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Standard:</strong> {method.turnaround}</li>
                        <li><strong>Rush Available:</strong> {method.rushAvailable}</li>
                        <li><strong>Quality:</strong> {method.quality}</li>
                        <li><strong>Durability:</strong> {method.durability}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Best For
                      </h3>
                      <ul className="space-y-2">
                        {method.bestFor.map((use, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Limitations
                      </h3>
                      <ul className="space-y-2">
                        {method.limitations.map((limit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                            <span>{limit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Decision Guide */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                How to Choose the Right Printing Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">For Small Orders (1-11 pieces)</h3>
                  <p className="text-muted-foreground mb-2">
                    Choose <strong>DTG</strong> for complex designs or <strong>Vinyl</strong> for simple text/logos. Both have no minimum order and work well for testing designs or personal use.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">For Medium Orders (12-49 pieces)</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Screen Printing</strong> offers best value for simple designs. <strong>DTF</strong> works well for complex designs on any fabric. <strong>Sublimation</strong> is ideal for polyester garments.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">For Large Orders (50+ pieces)</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Screen Printing</strong> is most cost-effective (R60+ per unit). <strong>Sublimation</strong> offers permanent prints on polyester. <strong>DTF</strong> provides versatility for mixed fabrics.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">For Corporate Uniforms</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Screen Printing</strong> for cost-effective bulk orders. <strong>Embroidery</strong> for premium branding on polo shirts and caps. Both offer professional, durable finishes.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">For Rush Orders</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Vinyl Heat Press</strong> offers same-day service. <strong>DTG</strong> and <strong>DTF</strong> offer 24-48 hour rush. Contact us for rush order pricing and availability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Comparison by Quantity */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Cost Comparison by Order Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      <TableHead>DTG</TableHead>
                      <TableHead>Screen</TableHead>
                      <TableHead>Sublimation</TableHead>
                      <TableHead>DTF</TableHead>
                      <TableHead>Vinyl</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">1 piece</TableCell>
                      <TableCell>R195</TableCell>
                      <TableCell>N/A (min 12)</TableCell>
                      <TableCell>N/A (min 12)</TableCell>
                      <TableCell>R150</TableCell>
                      <TableCell>R110</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">12 pieces</TableCell>
                      <TableCell>R2,340</TableCell>
                      <TableCell>R1,020</TableCell>
                      <TableCell>R1,500</TableCell>
                      <TableCell>R1,800</TableCell>
                      <TableCell>R1,320</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">50 pieces</TableCell>
                      <TableCell>R8,250</TableCell>
                      <TableCell>R3,000</TableCell>
                      <TableCell>R4,750</TableCell>
                      <TableCell>R6,000</TableCell>
                      <TableCell>R4,250</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">100 pieces</TableCell>
                      <TableCell>R14,850</TableCell>
                      <TableCell>R5,400</TableCell>
                      <TableCell>R8,550</TableCell>
                      <TableCell>R10,800</TableCell>
                      <TableCell>R7,650</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                *Prices exclude VAT (15%) and setup fees where applicable. Final pricing may vary based on design complexity.
              </p>
            </CardContent>
          </Card>

          {/* Internal Links Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Related Services in Johannesburg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/custom-t-shirt-printing-johannesburg" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Custom T-Shirt Printing</h3>
                  <p className="text-sm text-muted-foreground">Professional t-shirt printing services across Johannesburg</p>
                </Link>
                <Link href="/custom-t-shirt-printing-kempton-park" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Kempton Park Printing</h3>
                  <p className="text-sm text-muted-foreground">Same-day collection available in Kempton Park</p>
                </Link>
                <Link href="/sublimation-printing-johannesburg" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Sublimation Printing</h3>
                  <p className="text-sm text-muted-foreground">Full-color sublimation services in Johannesburg</p>
                </Link>
                <Link href="/branded-corporate-clothing-johannesburg" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Corporate Clothing</h3>
                  <p className="text-sm text-muted-foreground">Bulk corporate uniform printing services</p>
                </Link>
                <Link href="/event-merchandise-johannesburg" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Event Merchandise</h3>
                  <p className="text-sm text-muted-foreground">Custom event merchandise printing</p>
                </Link>
                <Link href="/pricing" className="block p-4 border rounded-lg hover:bg-primary/5 transition">
                  <h3 className="font-bold mb-2">Pricing Calculator</h3>
                  <p className="text-sm text-muted-foreground">Get instant pricing for your order</p>
                </Link>
              </div>
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
            <h2 className="text-3xl font-black mb-4">Ready to Choose Your Printing Method?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Still unsure which method is best for your project? Our team in Johannesburg can help you choose the perfect printing method based on your design, quantity, and budget.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">Get Free Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

