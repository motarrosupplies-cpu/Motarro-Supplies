/**
 * Location Landing Page: Custom Printing Sandton
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, Building2, Briefcase, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: "Custom Printing Sandton | Professional Printing Services | MOTARRO Supplies",
  description: "Professional custom printing services in Sandton. High-quality t-shirt printing, corporate apparel, branded clothing, and promotional merchandise. Fast delivery, competitive pricing. Serving Sandton, Rosebank, Melrose & surrounding areas.",
  keywords: [
    "custom printing sandton",
    "t-shirt printing sandton",
    "custom printing services sandton",
    "printed apparel sandton",
    "corporate printing sandton",
    "branded clothing sandton",
    "promotional printing sandton",
    "custom apparel sandton",
    "printing services sandton",
    "business printing sandton"
  ],
  openGraph: {
    title: "Custom Printing Sandton | Professional Printing Services | MOTARRO Supplies",
    description: "Professional custom printing services in Sandton. High-quality t-shirt printing, corporate apparel, branded clothing, and promotional merchandise.",
    url: "https://www.motarro.co.za/custom-printing-sandton",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/custom-printing-sandton",
  },
};

export default function CustomPrintingSandtonPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Custom Printing Sandton"
        address={{
          city: "Sandton",
          region: "Gauteng",
          postalCode: "2196",
          country: "ZA"
        }}
        phone="+27-69-622-8848"
        openingHours={[
          "Mo-Fr 08:00-17:00",
          "Sa 09:00-13:00"
        ]}
        rating={{
          value: 4.8,
          count: 127
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-lavender/20">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Custom Printing Sandton
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional custom printing services in Sandton. High-quality t-shirt printing, corporate apparel, branded clothing, and promotional merchandise with fast delivery across Sandton and surrounding business districts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Printing Services</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                <Link href="/contact">Get Printing Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Custom Printing Services in Sandton
              </h2>
              
              <p className="text-lg mb-6">
                As Sandton's premier custom printing specialist, MOTARRO Supplies delivers exceptional printing services to businesses, corporate offices, retail stores, and individuals throughout Sandton, Rosebank, Melrose, and surrounding business districts. Sandton, known as Africa's richest square mile and home to major corporate headquarters, demands the highest standards in custom printing - and that's exactly what we deliver.
              </p>

              <p className="text-lg mb-6">
                Whether you're a corporate office in Sandton City, a retail business in Sandton Square, a hotel in Sandton Central, or a business anywhere in the Sandton area, we provide comprehensive custom printing solutions that meet the professional standards expected in this prestigious business district. Our expertise in corporate branding, promotional printing, and custom apparel ensures your printing projects reflect the quality and professionalism that Sandton businesses are known for.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Custom Printing Services for Sandton Businesses
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Building2 className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Corporate Printing</h3>
                  <p className="text-gray-700">
                    Professional corporate printing for Sandton businesses including branded workwear, corporate uniforms, business casual apparel, and executive wear. Perfect for maintaining professional brand image.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Briefcase className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Promotional Printing</h3>
                  <p className="text-gray-700">
                    Custom promotional printing for marketing campaigns, product launches, and brand awareness. From branded t-shirts to promotional merchandise, we create items that get noticed.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Award className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Event Printing</h3>
                  <p className="text-gray-700">
                    Custom printing for corporate events, conferences, team building, and special occasions. We handle everything from small executive events to large corporate gatherings in Sandton.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Custom Printing in Sandton?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Sandton Business Standards:</strong>
                    <p className="text-gray-700">We understand the high standards expected in Sandton's business community and deliver printing services that meet and exceed corporate expectations for quality and professionalism.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Premium Quality:</strong>
                    <p className="text-gray-700">We use only premium materials, professional-grade printing equipment, and meticulous quality control to ensure every print meets the highest standards for Sandton businesses.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">We understand Sandton's fast-paced business environment and offer efficient turnaround times, with standard orders completed within 5-7 business days and express options available.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Corporate Account Management:</strong>
                    <p className="text-gray-700">Sandton businesses receive dedicated account management, ensuring seamless ordering, consistent branding, and ongoing support for all your custom printing needs.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Competitive Pricing:</strong>
                    <p className="text-gray-700">We offer transparent, competitive pricing with volume discounts for bulk orders. No hidden fees, just professional printing services at fair prices for Sandton clients.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Convenient Service:</strong>
                    <p className="text-gray-700">We provide convenient service to Sandton businesses with flexible delivery options, including same-day collection, courier delivery, and scheduled pickups to fit your business schedule.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Printing Methods We Offer in Sandton
              </h2>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Professional Printing Techniques</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Screen Printing:</strong> Cost-effective solution for bulk orders. Ideal for corporate uniforms, team apparel, and promotional items requiring durable, high-quality prints.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Direct-to-Garment (DTG):</strong> High-quality full-colour printing perfect for complex designs, photographs, and detailed artwork. Ideal for corporate events and promotional campaigns.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Sublimation Printing:</strong> Permanent, vibrant prints perfect for polyester apparel, sports uniforms, and all-over designs. Excellent for activewear and performance apparel.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Embroidery:</strong> Premium embroidered logos and designs for executive apparel, corporate wear, and high-end promotional items. Perfect for maintaining professional brand image.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving Sandton & Surrounding Business Districts
              </h2>

              <p className="text-lg mb-6">
                We proudly serve businesses and individuals throughout Sandton and surrounding areas:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton Central</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton City</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton Square</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rosebank</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Melrose</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rivonia</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Morningside</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Illovo</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Hyde Park</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> All Sandton Areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Custom Printing for Sandton Businesses
              </h2>

              <p className="text-lg mb-6">
                Sandton businesses trust MOTARRO Supplies for their custom printing needs because we understand the unique requirements of corporate environments, professional standards, and brand consistency. Our services include:
              </p>

              <div className="space-y-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Corporate Branding</h3>
                  <p className="text-gray-700">Consistent brand application across all printed materials, ensuring your corporate identity is maintained in every piece of custom printed apparel and promotional merchandise.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Bulk Order Management</h3>
                  <p className="text-gray-700">Efficient handling of large corporate orders with streamlined processes, quality control, and organized delivery to multiple Sandton locations or corporate offices.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Design Consultation</h3>
                  <p className="text-gray-700">Professional design consultation to ensure your custom printing projects align with your brand guidelines, corporate standards, and marketing objectives.</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started with Custom Printing in Sandton
              </h2>

              <p className="text-lg mb-8">
                Ready to elevate your brand with professional custom printing in Sandton? Contact MOTARRO Supplies today for a free consultation and quote. Whether you need corporate uniforms, promotional merchandise, or custom apparel for events, we're here to deliver printing services that meet Sandton's high standards.
              </p>

              <div className="bg-primary/10 p-8 rounded-lg mb-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-primary mr-3" />
                    <a href="tel:+27696228848" className="text-lg hover:underline">+27 69 622 8848</a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-primary mr-3" />
                    <a href="mailto:motarrodotcoza@gmail.com" className="text-lg hover:underline">motarrodotcoza@gmail.com</a>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-primary mr-3" />
                    <span className="text-lg">Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 1:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Google Maps Link */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">Our Location Near Sandton</h3>
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-lg text-gray-700 mb-4">View our location on Google Maps</p>
                    <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
                      <a 
                        href="https://maps.google.com/?q=Kempton+Park,+Gauteng" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Custom Printing?</h3>
                <p className="text-lg mb-6">
                  Browse our printing services or contact us directly for a custom quote. We're here to help Sandton businesses create professional custom printing solutions that strengthen their brand.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Printing Services</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                    <Link href="/contact">Get Quote</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

