import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Size Guide - Find Your Perfect Fit",
  description: "Comprehensive size guide for men's and women's clothing, shoes, and accessories. Find your perfect fit with our detailed sizing charts.",
  keywords: ["size guide", "sizing chart", "clothing sizes", "fit guide", "measurements", "men's sizes", "women's sizes"],
  openGraph: {
    title: "Size Guide - Find Your Perfect Fit",
    description: "Comprehensive size guide for men's and women's clothing, shoes, and accessories.",
    url: "https://www.motarro.co.za/size-guide"
  },
  alternates: {
    canonical: "/size-guide"
  }
}

const mensClothingSizes = [
  { size: "XS", chest: "86-91", waist: "71-76", hips: "86-91", neck: "35-36" },
  { size: "S", chest: "91-97", waist: "76-81", hips: "91-97", neck: "37-38" },
  { size: "M", chest: "97-102", waist: "81-86", hips: "97-102", neck: "39-40" },
  { size: "L", chest: "102-107", waist: "86-91", hips: "102-107", neck: "41-42" },
  { size: "XL", chest: "107-112", waist: "91-97", hips: "107-112", neck: "43-44" },
  { size: "XXL", chest: "112-117", waist: "97-102", hips: "112-117", neck: "45-46" },
]

const womensClothingSizes = [
  { size: "XS", bust: "81-86", waist: "61-66", hips: "89-94" },
  { size: "S", bust: "86-91", waist: "66-71", hips: "94-99" },
  { size: "M", bust: "91-96", waist: "71-76", hips: "99-104" },
  { size: "L", bust: "96-102", waist: "76-81", hips: "104-109" },
  { size: "XL", bust: "102-107", waist: "81-86", hips: "109-114" },
  { size: "XXL", bust: "107-112", waist: "86-91", hips: "114-119" },
]

const shoeSizes = [
  { uk: "6", eu: "39", us: "7", cm: "24.5" },
  { uk: "7", eu: "40", us: "8", cm: "25.1" },
  { uk: "8", eu: "41", us: "9", cm: "25.7" },
  { uk: "9", eu: "42", us: "10", cm: "26.4" },
  { uk: "10", eu: "43", us: "11", cm: "27.0" },
  { uk: "11", eu: "44", us: "12", cm: "27.6" },
]

const measurementTips = [
  {
    title: "Chest/Bust",
    description: "Measure around the fullest part of your chest/bust, keeping the tape horizontal.",
  },
  {
    title: "Waist",
    description: "Measure around your natural waistline, at the narrowest part of your torso.",
  },
  {
    title: "Hips",
    description: "Measure around the fullest part of your hips, typically around the buttocks.",
  },
  {
    title: "Neck",
    description: "Measure around the base of your neck, where a collar would sit.",
  },
]

export default function SizeGuidePage() {
  return (
    <div className="container px-4 py-12 mx-auto bg-lavender">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Size Guide</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Size Guide</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Find your perfect fit. All measurements are in centimeters unless otherwise specified.
        </p>
        <p className="text-sm text-muted-foreground max-w-[600px]">
          Use the men&apos;s and women&apos;s clothing tables below to choose the right size for t-shirts, hoodies, and apparel. For shoes, refer to the UK, EU, and US conversion table. If you&apos;re between sizes, we recommend sizing up for a relaxed fit.
        </p>
      </div>

      <Tabs defaultValue="mens" className="space-y-8">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 bg-transparent">
          <TabsTrigger value="mens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Men's Sizes
          </TabsTrigger>
          <TabsTrigger value="womens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Women's Sizes
          </TabsTrigger>
          <TabsTrigger value="shoes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Shoe Sizes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mens" className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Hips</TableHead>
                    <TableHead>Neck</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mensClothingSizes.map((size) => (
                    <TableRow key={size.size}>
                      <TableCell className="font-medium">{size.size}</TableCell>
                      <TableCell>{size.chest}</TableCell>
                      <TableCell>{size.waist}</TableCell>
                      <TableCell>{size.hips}</TableCell>
                      <TableCell>{size.neck}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="womens" className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Bust</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Hips</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {womensClothingSizes.map((size) => (
                    <TableRow key={size.size}>
                      <TableCell className="font-medium">{size.size}</TableCell>
                      <TableCell>{size.bust}</TableCell>
                      <TableCell>{size.waist}</TableCell>
                      <TableCell>{size.hips}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shoes" className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UK</TableHead>
                    <TableHead>EU</TableHead>
                    <TableHead>US</TableHead>
                    <TableHead>CM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shoeSizes.map((size) => (
                    <TableRow key={size.uk}>
                      <TableCell className="font-medium">{size.uk}</TableCell>
                      <TableCell>{size.eu}</TableCell>
                      <TableCell>{size.us}</TableCell>
                      <TableCell>{size.cm}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-primary mb-6 text-center">How to Measure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {measurementTips.map((tip) => (
            <Card key={tip.title}>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 