/**
 * Location Landing Page: Custom T-Shirt Printing Johannesburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { LocalBusinessSchema, WebPageSchema, BreadcrumbSchema } from '@/components/seo/schema-org';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { ChannelVideoSection } from '@/components/channel-video-section';

export const metadata: Metadata = {
  title: "Custom T-Shirt Printing Johannesburg | MOTARRO Supplies",
  description: "Professional custom t-shirt printing in Johannesburg. High-quality DTG, sublimation, and screen printing services. Fast turnaround, competitive pricing. Serving Sandton, Rosebank, Randburg & all of Johannesburg.",
  keywords: [
    "custom t-shirt printing johannesburg",
    "t-shirt printing johannesburg",
    "custom printing johannesburg",
    "printed t-shirts johannesburg",
    "sublimation printing johannesburg",
    "DTG printing johannesburg",
    "screen printing johannesburg",
    "bulk t-shirt printing johannesburg",
    "corporate t-shirt printing johannesburg",
    "event t-shirt printing johannesburg"
  ],
  openGraph: {
    title: "Custom T-Shirt Printing Johannesburg | MOTARRO Supplies",
    description: "Professional custom t-shirt printing in Johannesburg. High-quality DTG, sublimation, and screen printing services. Fast turnaround, competitive pricing.",
    url: "https://www.motarro.co.za/custom-t-shirt-printing-johannesburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/custom-t-shirt-printing-johannesburg",
  },
};

export default function CustomTShirtPrintingJohannesburgPage() {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Custom T-Shirt Printing Johannesburg', url: '/custom-t-shirt-printing-johannesburg' },
  ];

  return (
    <>
      <LocalBusinessSchema
        name="MOTARRO Supplies — Custom T-Shirt Printing Johannesburg"
        address={{
          addressLocality: "Johannesburg",
          addressRegion: "Gauteng",
          postalCode: "2000",
          addressCountry: "ZA"
        }}
        phone="+27-69-622-8848"
        openingHours={[
          "Mo-Fr 08:00-17:00",
          "Sa 09:00-13:00"
        ]}
        geo={{
          latitude: -26.2041,
          longitude: 28.0473
        }}
        rating={{
          value: 4.8,
          count: 127
        }}
      />
      <WebPageSchema
        name="Custom T-Shirt Printing Johannesburg"
        description="Professional custom t-shirt printing in Johannesburg. High-quality DTG, sublimation, and screen printing services. Fast turnaround, competitive pricing."
        url="/custom-t-shirt-printing-johannesburg"
        breadcrumb={breadcrumbItems}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-lavender/20">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Custom T-Shirt Printing Johannesburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional custom t-shirt printing services in Johannesburg. High-quality printing, fast turnaround, competitive pricing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Get Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Custom T-Shirt Printing in Johannesburg
              </h2>
              
              <p className="text-lg mb-6">
                Looking for high-quality custom t-shirt printing in Johannesburg? MOTARRO Supplies is your trusted partner for professional custom printing services across the greater Johannesburg area, including Sandton, Rosebank, Randburg, Midrand, and surrounding suburbs.
              </p>

              <p className="text-lg mb-6">
                With years of experience serving businesses, sports teams, schools, and individuals in Johannesburg, we've built a reputation for delivering exceptional quality, fast turnaround times, and competitive pricing. Whether you need custom t-shirts for a corporate event, team uniforms, promotional merchandise, or personal use, we have the expertise and equipment to bring your vision to life.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Printing Methods
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">Direct-to-Garment (DTG)</h3>
                  <p className="text-gray-700">
                    Perfect for small to medium orders with complex, full-colour designs. DTG printing delivers vibrant, detailed prints directly onto the fabric, ideal for photographs, gradients, and intricate artwork.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">Sublimation Printing</h3>
                  <p className="text-gray-700">
                    Best for polyester fabrics and all-over prints. Sublimation creates permanent, fade-resistant designs that become part of the fabric, ensuring long-lasting quality and vibrant colours.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">Screen Printing</h3>
                  <p className="text-gray-700">
                    Ideal for bulk orders and simple designs. Screen printing offers cost-effective solutions for large quantities, with excellent colour opacity and durability for team uniforms and corporate apparel.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Custom T-Shirt Printing in Johannesburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Local Johannesburg Presence:</strong>
                    <p className="text-gray-700">We understand the Johannesburg market and serve clients across Sandton, Rosebank, Randburg, Midrand, and all surrounding areas with fast, reliable service.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Premium Quality Materials:</strong>
                    <p className="text-gray-700">We use only the highest quality t-shirts and printing materials, ensuring your custom apparel looks professional and lasts for years.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround Times:</strong>
                    <p className="text-gray-700">Need your custom t-shirts quickly? We offer express printing services for urgent orders, with standard turnaround times of 3-5 business days.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Competitive Pricing:</strong>
                    <p className="text-gray-700">We offer transparent, competitive pricing with volume discounts for bulk orders. No hidden fees, no surprises.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Expert Design Support:</strong>
                    <p className="text-gray-700">Our design team can help bring your ideas to life, from concept to final print. We work with you every step of the way.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving All of Johannesburg
              </h2>

              <p className="text-lg mb-6">
                While we're based in Johannesburg, we serve clients throughout the greater Johannesburg metropolitan area, including:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rosebank</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Randburg</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Midrand</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Fourways</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Kempton Park</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Boksburg</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Edenvale</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Bedfordview</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> And surrounding areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started Today
              </h2>

              <p className="text-lg mb-8">
                Ready to create custom t-shirts in Johannesburg? Contact us today for a free quote. Our team is ready to help you bring your custom printing project to life, whether you need 10 t-shirts or 1000.
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
                    <a href="mailto:info@www.motarro.co.za" className="text-lg hover:underline">info@www.motarro.co.za</a>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-primary mr-3" />
                    <span className="text-lg">Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 1:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Video Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-primary">See Our Printing Process</h3>
                <Suspense
                  fallback={
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="h-[300px] rounded-xl bg-muted/80 animate-pulse" />
                      <div className="h-[300px] rounded-xl bg-muted/80 animate-pulse" />
                    </div>
                  }
                >
                  <ChannelVideoSection limit={2} className="mb-6" />
                </Suspense>
                <div className="text-center">
                  <Button asChild variant="outline">
                    <Link href="/videos">View All Videos</Link>
                  </Button>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">Find Us in Johannesburg</h3>
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.1234567890!2d28.0473!3d-26.2041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDEyJzE0LjgiUyAyOMKwMDInNTAuMyJF!5e0!3m2!1sen!2sza!4v1234567890123!5m2!1sen!2sza"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="MOTARRO Supplies Location in Johannesburg"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order?</h3>
                <p className="text-lg mb-6">
                  Browse our product catalog or contact us directly for a custom quote. We're here to help you create the perfect custom t-shirts for your needs.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Products</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/contact">Contact Us</Link>
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

