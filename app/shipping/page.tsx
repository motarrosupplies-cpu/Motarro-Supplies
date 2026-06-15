import Link from "next/link"
import { ChevronRight, Truck, RotateCcw, Clock, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping Information & Delivery Options",
  description: "Learn about our shipping options, delivery times, and costs. Free delivery on orders over R1000. Express and same-day delivery available.",
  keywords: ["shipping", "delivery", "free shipping", "express delivery", "same day delivery", "South Africa"],
  openGraph: {
    title: "Shipping Information & Delivery Options",
    description: "Learn about our shipping options, delivery times, and costs. Free delivery on orders over R1000.",
    url: "https://www.motarro.co.za/shipping"
  },
  alternates: {
    canonical: "/shipping"
  }
}

const shippingMethods = [
  {
    method: "Standard Delivery",
    time: "3-5 business days",
    cost: "Free on orders over R1000",
    standardCost: "R99.99",
  },
  {
    method: "Express Delivery",
    time: "1-2 business days",
    cost: "R199.99",
    standardCost: "R199.99",
  },
  {
    method: "Same Day Delivery",
    time: "Same business day",
    cost: "R299.99",
    standardCost: "R299.99",
    note: "Available only in major cities for orders placed before 11am",
  },
]

const returnInfo = [
  {
    title: "Return Window",
    description: "30 days from delivery date for unused items with original tags attached",
    icon: Clock,
  },
  {
    title: "Return Cost",
    description: "Free returns for standard size items. R50 for oversized items",
    icon: Truck,
  },
  {
    title: "Return Method",
    description: "Drop off at any of our partner locations or schedule a pickup",
    icon: MapPin,
  },
  {
    title: "Refund Process",
    description: "Refunds are processed within 5-7 business days after receiving the return",
    icon: RotateCcw,
  },
]

const returnConditions = [
  "Items must be unworn and unwashed",
  "Original tags must be attached",
  "Items must be in their original packaging",
  "Sale items can only be returned for store credit",
  "Underwear and swimwear cannot be returned for hygiene reasons",
  "Accessories must be in their original condition with proof of purchase",
]

export default function ShippingPage() {
  return (
    <div className="container px-4 py-12 mx-auto bg-lavender">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Shipping & Returns</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Shipping & Returns</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Everything you need to know about our shipping options and return policy.
        </p>
        <p className="text-sm text-muted-foreground max-w-[600px]">
          We deliver across South Africa. Standard delivery is free on orders over R1000; express and same-day options are available. Returns are accepted within 30 days for unused items with original tags. See the tables below for delivery times and return conditions.
        </p>
      </div>

      <Tabs defaultValue="shipping" className="space-y-8">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 bg-transparent">
          <TabsTrigger value="shipping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Shipping Information
          </TabsTrigger>
          <TabsTrigger value="returns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Returns Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipping" className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Method</TableHead>
                    <TableHead>Estimated Time</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingMethods.map((method) => (
                    <TableRow key={method.method}>
                      <TableCell className="font-medium">{method.method}</TableCell>
                      <TableCell>{method.time}</TableCell>
                      <TableCell>{method.cost}</TableCell>
                      <TableCell className="text-muted-foreground">{method.note || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="font-bold mb-4">Important Shipping Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Orders are processed and shipped Monday through Friday, excluding public holidays</li>
              <li>Delivery times are estimates and may vary based on location</li>
              <li>A signature may be required for deliveries over R2000</li>
              <li>We currently only ship within South Africa</li>
              <li>Track your order using the tracking number provided in your shipping confirmation email</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnInfo.map((info) => (
              <Card key={info.title}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <info.icon className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="font-bold mb-2">{info.title}</h3>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Return Conditions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {returnConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="font-bold mb-4">How to Return an Item</h3>
            <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
              <li>Log into your account and go to your orders</li>
              <li>Select the item(s) you wish to return and your preferred return method</li>
              <li>Print the return label or QR code (if dropping off at a partner location)</li>
              <li>Pack the item(s) securely in their original packaging</li>
              <li>Drop off at a partner location or wait for pickup (if selected)</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 