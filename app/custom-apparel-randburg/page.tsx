/**
 * Location Landing Page: Custom Apparel Randburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, ShoppingBag, Truck, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: "Custom Apparel Randburg | MOTARRO Supplies",
  description: "Custom apparel and custom printed clothing in Randburg. High-quality t-shirts, hoodies, corporate wear, and promotional apparel. Fast delivery, competitive pricing. Serving Randburg, Northgate, Cresta & surrounding areas.",
  keywords: [
    "custom apparel randburg",
    "custom printed clothing randburg",
    "custom t-shirts randburg",
    "printed apparel randburg",
    "custom clothing randburg",
    "t-shirt printing randburg",
    "custom printing randburg",
    "branded apparel randburg",
    "corporate clothing randburg",
    "promotional clothing randburg"
  ],
  openGraph: {
    title: "Custom Apparel Randburg | MOTARRO Supplies",
    description: "Custom apparel and custom printed clothing in Randburg. High-quality t-shirts, hoodies, corporate wear, and promotional apparel with fast delivery.",
    url: "https://www.motarro.co.za/custom-apparel-randburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/custom-apparel-randburg",
  },
};

export default function CustomApparelRandburgPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Custom Apparel Randburg"
        address={{
          city: "Randburg",
          region: "Gauteng",
          postalCode: "2194",
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
              Custom Apparel Randburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Premium custom apparel and custom printed clothing in Randburg. High-quality t-shirts, hoodies, corporate wear, and promotional apparel with fast delivery across Randburg and surrounding areas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Custom Apparel</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
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
                Custom Apparel & Printed Clothing in Randburg
              </h2>
              
              <p className="text-lg mb-6">
                Looking for high-quality custom apparel in Randburg? MOTARRO Supplies is your trusted local partner for custom printed clothing, branded apparel, and professional custom wear throughout Randburg, Northgate, Cresta, and surrounding areas. We've been serving the Randburg community with exceptional custom printing services, helping businesses, schools, sports teams, and individuals create unique, professional apparel that stands out.
              </p>

              <p className="text-lg mb-6">
                Whether you need custom t-shirts for a corporate event, branded hoodies for your team, professional workwear for your business, or personalized apparel for special occasions, we provide comprehensive custom apparel solutions tailored to your needs. Our commitment to quality, fast turnaround times, and competitive pricing has made us a preferred choice for custom apparel in Randburg.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Custom Apparel Services in Randburg
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <ShoppingBag className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Custom T-Shirts</h3>
                  <p className="text-gray-700">
                    High-quality custom t-shirts in various styles, colours, and sizes. Perfect for corporate events, team building, promotional campaigns, and personal use. Available with screen printing, DTG, or sublimation.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Truck className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Corporate Apparel</h3>
                  <p className="text-gray-700">
                    Professional corporate wear including polo shirts, branded workwear, business casual apparel, and company uniforms. Ideal for businesses in Randburg looking to strengthen their brand identity.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Star className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Promotional Apparel</h3>
                  <p className="text-gray-700">
                    Custom promotional clothing for events, marketing campaigns, and brand awareness. From branded hoodies to custom caps, we create promotional apparel that gets noticed.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Custom Apparel in Randburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Local Randburg Presence:</strong>
                    <p className="text-gray-700">We understand the Randburg market and serve clients throughout Randburg, Northgate, Cresta, and surrounding areas with personalized, local service and fast delivery options.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Premium Quality Materials:</strong>
                    <p className="text-gray-700">We use only the highest quality fabrics and materials, ensuring your custom apparel looks professional, feels comfortable, and lasts for years of wear.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Multiple Printing Methods:</strong>
                    <p className="text-gray-700">We offer screen printing, DTG printing, sublimation, and embroidery, allowing us to recommend the best method for your specific project and budget.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">Need your custom apparel quickly? We offer standard turnaround times of 5-7 business days, with express options available for urgent orders in Randburg.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Competitive Pricing:</strong>
                    <p className="text-gray-700">We offer transparent, competitive pricing with volume discounts for bulk orders. No hidden fees, just quality custom apparel at fair prices for Randburg clients.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Design Support:</strong>
                    <p className="text-gray-700">Our design team can help bring your ideas to life, from concept to final product. We work with you every step of the way to ensure your custom apparel meets your vision.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving Randburg & Surrounding Areas
              </h2>

              <p className="text-lg mb-6">
                We proudly serve clients throughout Randburg and the surrounding areas, including:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Randburg Central</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Northgate</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Cresta</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Ferndale</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Blairgowrie</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Linden</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Parkhurst</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rosebank</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Parktown North</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> All Randburg Areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Custom Apparel for Every Occasion
              </h2>

              <p className="text-lg mb-6">
                Whether you're planning a corporate event, organizing a sports team, launching a marketing campaign, or creating personalized gifts, we have the custom apparel solutions you need:
              </p>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Popular Custom Apparel Options</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Corporate Events:</strong> Custom t-shirts, polo shirts, and branded apparel for conferences, team building, and corporate functions in Randburg.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Sports Teams:</strong> Custom jerseys, team uniforms, and athletic wear for sports clubs, schools, and recreational teams throughout Randburg.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Promotional Campaigns:</strong> Branded promotional apparel for marketing campaigns, product launches, and brand awareness initiatives.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>School & Education:</strong> Custom school uniforms, event t-shirts, and educational apparel for schools and educational institutions in Randburg.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Personal Use:</strong> Custom apparel for birthdays, anniversaries, family reunions, and special occasions with personalized designs and messages.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started with Custom Apparel in Randburg
              </h2>

              <p className="text-lg mb-8">
                Ready to create custom apparel in Randburg? Contact MOTARRO Supplies today for a free consultation and quote. Our team is ready to help you bring your custom printing project to life, whether you need 10 pieces or 1000. We're committed to delivering exceptional quality and service to all our Randburg clients.
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Find Us Near Randburg</h3>
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Custom Apparel?</h3>
                <p className="text-lg mb-6">
                  Browse our product catalog or contact us directly for a custom quote. We're here to help you create the perfect custom apparel for your needs in Randburg.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Products</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold">
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

