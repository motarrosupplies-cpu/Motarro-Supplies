import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin, Clock, Phone, Mail, Globe, Star, CheckCircle, Truck, CreditCard, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Business Information | MOTARRO Supplies — Custom Apparel & Printing Services',
  description: 'Complete business information for MOTARRO Supplies. Contact details, business hours, services, and location information for our custom apparel and printing business in Kempton Park, Johannesburg.',
  keywords: [
    'MOTARRO Supplies business information',
    'custom apparel Johannesburg',
    'printing services Kempton Park',
    'business hours MOTARRO Supplies',
    'contact MOTARRO Supplies',
    'location MOTARRO Supplies'
  ],
  openGraph: {
    title: 'Business Information | MOTARRO Supplies',
    description: 'Complete business information for MOTARRO Supplies custom apparel and printing services in Johannesburg.',
    url: 'https://www.motarro.co.za/business-info',
    type: 'website'
  },
  alternates: {
    canonical: '/business-info'
  }
};

export default function BusinessInfoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "MOTARRO Supplies",
            "alternateName": "MOTARRO Supplies Custom Apparel",
            "url": "https://www.motarro.co.za",
            "logo": "https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/LOGO.PNG",
            "description": "Custom printed apparel and promotional goods in South Africa. Specializing in corporate uniforms, event merchandise, and personalized clothing.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kempton Park, Johannesburg",
              "addressLocality": "Kempton Park",
              "addressRegion": "Gauteng",
              "postalCode": "1619",
              "addressCountry": "ZA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -26.1087,
              "longitude": 28.2333
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+27-69-622-8848",
              "contactType": "customer service",
              "availableLanguage": ["English", "Afrikaans"]
            },
            "openingHours": "Mo-Su 00:00-23:59",
            "priceRange": "$$",
            "currenciesAccepted": "ZAR",
            "paymentAccepted": ["Cash", "Credit Card", "EFT", "PayFast", "Google Pay"]
          })
        }}
      />
      
      <div className="container px-4 py-12 mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Business Information</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            Business Information
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete business details for MOTARRO Supplies custom apparel and printing services in Johannesburg, South Africa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Business Name</h4>
                    <p className="font-medium">MOTARRO Supplies</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Alternate Name</h4>
                    <p className="font-medium">MOTARRO Supplies Custom Apparel</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Year Established</h4>
                    <p className="font-medium">2020</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Business Type</h4>
                    <p className="font-medium">Private Company</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Industry</h4>
                    <p className="font-medium">Apparel & Fashion</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Employees</h4>
                    <p className="font-medium">5-10</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                  <p className="text-sm">
                    Custom printed apparel and promotional goods in South Africa. Specializing in corporate uniforms, 
                    event merchandise, and personalized clothing. We provide high-quality printing services for businesses, 
                    events, and individuals across Gauteng and South Africa.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>Comprehensive range of custom apparel and printing services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom T-Shirt Printing</h4>
                      <p className="text-sm text-muted-foreground">High-quality custom t-shirt printing services</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Corporate Uniforms</h4>
                      <p className="text-sm text-muted-foreground">Professional corporate uniform design and printing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Event Merchandise</h4>
                      <p className="text-sm text-muted-foreground">Custom merchandise for events and promotions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Bulk Orders</h4>
                      <p className="text-sm text-muted-foreground">Large quantity orders for businesses and events</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Design Services</h4>
                      <p className="text-sm text-muted-foreground">Professional design assistance for custom apparel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Promotional Goods</h4>
                      <p className="text-sm text-muted-foreground">Branded promotional items and merchandise</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications & Awards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Certifications & Awards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">BBB Accredited Business</h4>
                      <p className="text-sm text-muted-foreground">Better Business Bureau accreditation for trust and reliability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">South African Business Registration</h4>
                      <p className="text-sm text-muted-foreground">Officially registered business in South Africa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Google My Business Verified</h4>
                      <p className="text-sm text-muted-foreground">Verified business profile on Google</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+27-69-622-8848</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">info@www.motarro.co.za</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground">www.motarro.co.za</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Monday - Sunday</span>
                    <span className="text-sm font-medium">24 Hours</span>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    We operate 24/7 to serve our customers with online ordering and support
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Kempton Park, Johannesburg<br />
                      Gauteng, 1619<br />
                      South Africa
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Coordinates</h4>
                    <p className="text-sm text-muted-foreground">
                      -26.1087° S, 28.2333° E
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Service Area</h4>
                    <p className="text-sm text-muted-foreground">
                      Johannesburg, Kempton Park, and surrounding areas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Cash</Badge>
                  <Badge variant="outline">Credit Card</Badge>
                  <Badge variant="outline">EFT</Badge>
                  <Badge variant="outline">PayFast</Badge>
                  <Badge variant="outline">Google Pay</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  We accept multiple payment methods for your convenience
                </p>
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Customer Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">4.8</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on 127 reviews</p>
                  <div className="flex items-center gap-2 justify-center">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Google: 4.8
                    </Badge>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Facebook: 4.7
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
