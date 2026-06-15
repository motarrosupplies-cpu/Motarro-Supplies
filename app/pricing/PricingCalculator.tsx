"use client"

import { useState, useMemo } from "react"
import { Calculator, TrendingUp, Info, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const PRINTING_METHODS = {
  dtg: { name: "DTG (Direct-to-Garment)", minOrder: 1, basePrice: 195, bulkDiscount: 0.15 },
  screen: { name: "Screen Printing", minOrder: 12, basePrice: 85, bulkDiscount: 0.25 },
  sublimation: { name: "Sublimation", minOrder: 12, basePrice: 125, bulkDiscount: 0.20 },
  dtf: { name: "DTF (Direct-to-Film)", minOrder: 6, basePrice: 150, bulkDiscount: 0.18 },
  vinyl: { name: "Vinyl Heat Press", minOrder: 1, basePrice: 110, bulkDiscount: 0.15 },
  embroidery: { name: "Embroidery", minOrder: 6, basePrice: 180, bulkDiscount: 0.20 }
}

const BULK_TIERS = [
  { min: 1, max: 11, discount: 0 },
  { min: 12, max: 49, discount: 0.10 },
  { min: 50, max: 99, discount: 0.15 },
  { min: 100, max: 249, discount: 0.20 },
  { min: 250, max: 499, discount: 0.25 },
  { min: 500, max: Infinity, discount: 0.30 }
]

export default function PricingCalculator() {
  const [method, setMethod] = useState<keyof typeof PRINTING_METHODS>("dtg")
  const [quantity, setQuantity] = useState(12)
  const [garmentType, setGarmentType] = useState("t-shirt")

  const selectedMethod = PRINTING_METHODS[method]
  const minOrder = selectedMethod.minOrder
  const validQuantity = Math.max(minOrder, quantity)

  const calculatePrice = useMemo(() => {
    const basePrice = selectedMethod.basePrice
    const tier = BULK_TIERS.find(t => validQuantity >= t.min && validQuantity <= t.max) || BULK_TIERS[0]
    const tierDiscount = tier.discount
    const methodDiscount = selectedMethod.bulkDiscount
    const totalDiscount = Math.min(tierDiscount + methodDiscount, 0.40) // Cap at 40%
    
    const unitPrice = basePrice * (1 - totalDiscount)
    const subtotal = unitPrice * validQuantity
    const vat = subtotal * 0.15
    const total = subtotal + vat

    return {
      unitPrice: unitPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2),
      discount: (totalDiscount * 100).toFixed(0),
      savings: (basePrice * validQuantity - subtotal).toFixed(2)
    }
  }, [method, validQuantity, selectedMethod])

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <div className="container px-4 py-12 mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Transparent Pricing for Custom T-Shirt Printing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant pricing for custom printing in Johannesburg. No hidden fees. Free quotes in 60 seconds.
          </p>
        </div>

        {/* Pricing Calculator */}
        <Card className="mb-12 shadow-xl border-0">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="w-6 h-6" />
              Instant Pricing Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="method">Printing Method</Label>
                <Select value={method} onValueChange={(value) => setMethod(value as keyof typeof PRINTING_METHODS)}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRINTING_METHODS).map(([key, method]) => (
                      <SelectItem key={key} value={key}>
                        {method.name} (Min: {method.minOrder})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={minOrder}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(minOrder, parseInt(e.target.value) || minOrder))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: {minOrder} {minOrder === 1 ? 'piece' : 'pieces'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="garment">Garment Type</Label>
                <Select value={garmentType} onValueChange={setGarmentType}>
                  <SelectTrigger id="garment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t-shirt">T-Shirt</SelectItem>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="polo">Polo Shirt</SelectItem>
                    <SelectItem value="cap">Cap</SelectItem>
                    <SelectItem value="tote">Tote Bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Unit Price:</span>
                      <span className="font-semibold">R{calculatePrice.unitPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-semibold">{validQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">R{calculatePrice.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (15%):</span>
                      <span className="font-semibold">R{calculatePrice.vat}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-black text-primary">
                      <span>Total:</span>
                      <span>R{calculatePrice.total}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Savings</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {calculatePrice.discount}% Discount Applied
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      You're saving <span className="font-bold text-primary">R{calculatePrice.savings}</span> compared to standard pricing!
                    </p>
                    {validQuantity >= 100 && (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Bulk order discount active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/contact">Get Free Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tables */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Standard Pricing (Per Unit)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(PRINTING_METHODS).map(([key, method]) => (
                  <div key={key} className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">{method.name}</span>
                    <span className="font-bold">From R{method.basePrice}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Discount Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BULK_TIERS.slice(1).map((tier, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">{tier.min}-{tier.max === Infinity ? '∞' : tier.max} units</span>
                    <Badge variant="secondary">{(tier.discount * 100).toFixed(0)}% OFF</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Transparent Pricing */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Why We Offer Transparent Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Info className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-bold mb-2">No Hidden Fees</h3>
                <p className="text-sm text-muted-foreground">
                  What you see is what you pay. No surprise charges, setup fees (except screen printing), or hidden costs.
                </p>
              </div>
              <div>
                <Calculator className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-bold mb-2">Instant Quotes</h3>
                <p className="text-sm text-muted-foreground">
                  Get accurate pricing in seconds with our calculator. No need to wait for email quotes for standard orders.
                </p>
              </div>
              <div>
                <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-bold mb-2">Competitive Rates</h3>
                <p className="text-sm text-muted-foreground">
                  We price match competitors and offer the best value in Johannesburg. Quality printing at fair prices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-black mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Use our calculator above or contact us for a custom quote. Same-day collection in Kempton Park available.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Get Free Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

