import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, MapPin, Clock, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Store Locator - Find MOTARRO Supplies Stores Near You",
  description: "Find MOTARRO Supplies physical store locations in Johannesburg, Kempton Park, and across South Africa. Visit us for custom printing services, try-on sessions, and in-person consultations.",
  keywords: [
    "store locator",
    "MOTARRO Supplies stores",
    "custom printing stores Johannesburg",
    "custom apparel stores Kempton Park",
    "physical stores South Africa",
    "store locations"
  ],
  openGraph: {
    title: "Store Locator - Find MOTARRO Supplies Stores Near You",
    description: "Find MOTARRO Supplies physical store locations in Johannesburg, Kempton Park, and across South Africa.",
    url: "https://www.motarro.co.za/stores",
    type: "website"
  },
  alternates: {
    canonical: "/stores"
  }
}

export default function StoresPage() {
  return (
    <div className="container px-4 py-12 mx-auto bg-lavender min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Store Locator</span>
      </div>

      {/* Coming Soon Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto py-20">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50"></div>
          <div className="relative bg-white rounded-full p-6 shadow-xl">
            <MapPin className="h-16 w-16 text-primary mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Store Locator
          </h1>
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            Coming Soon
          </div>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          We're working on expanding our physical presence! Soon you'll be able to visit our stores in person to experience our custom printing services, try on products, and meet our team.
        </p>

        {/* What to Expect */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <MapPin className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">Find Our Stores</h3>
            <p className="text-sm text-muted-foreground">
              Locate MOTARRO Supplies stores near you in Johannesburg, Kempton Park, and select locations across South Africa.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">Store Hours</h3>
            <p className="text-sm text-muted-foreground">
              View opening times and contact information for each location. We'll keep you updated on launch dates.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <Phone className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">In-Person Services</h3>
            <p className="text-sm text-muted-foreground">
              Try on products, get custom fitting advice, and enjoy personalized consultations with our team.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-12 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Contact Us in the Meantime</h2>
          <p className="text-muted-foreground mb-6">
            While we prepare our store locator, feel free to reach out to us:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <a href="mailto:info@www.motarro.co.za" className="text-primary hover:underline">
                  info@www.motarro.co.za
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <a href="tel:+27696228848" className="text-primary hover:underline">
                  +27 69 622 8848
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/products">
              Shop Online
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

