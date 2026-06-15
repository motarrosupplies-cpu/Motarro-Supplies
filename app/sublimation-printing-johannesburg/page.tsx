/**
 * Location Landing Page: Sublimation Printing Johannesburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, Palette, Sparkles, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: "Sublimation Printing Johannesburg | MOTARRO Supplies",
  description: "Professional sublimation printing in Johannesburg. High-quality all-over prints, custom sublimation designs, and vibrant polyester apparel. Fast turnaround, competitive pricing. Serving Sandton, Rosebank, Randburg & all of Johannesburg.",
  keywords: [
    "sublimation printing johannesburg",
    "sublimation johannesburg",
    "all-over print johannesburg",
    "sublimation t-shirts johannesburg",
    "custom sublimation johannesburg",
    "sublimation printing services",
    "polyester printing johannesburg",
    "sublimation design johannesburg",
    "sublimation apparel johannesburg",
    "heat transfer sublimation johannesburg"
  ],
  openGraph: {
    title: "Sublimation Printing Johannesburg | MOTARRO Supplies",
    description: "Professional sublimation printing in Johannesburg. High-quality all-over prints, custom sublimation designs, and vibrant polyester apparel.",
    url: "https://www.motarro.co.za/sublimation-printing-johannesburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/sublimation-printing-johannesburg",
  },
};

export default function SublimationPrintingJohannesburgPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Sublimation Printing Johannesburg"
        address={{
          city: "Johannesburg",
          region: "Gauteng",
          postalCode: "2000",
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
              Sublimation Printing Johannesburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional sublimation printing services in Johannesburg. Vibrant all-over prints, custom designs, and high-quality polyester apparel with permanent, fade-resistant results.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Sublimation Products</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                <Link href="/contact">Get Sublimation Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Sublimation Printing in Johannesburg
              </h2>
              
              <p className="text-lg mb-6">
                Discover the vibrant world of sublimation printing with MOTARRO Supplies, Johannesburg's premier sublimation printing specialist. Sublimation printing is a cutting-edge process that creates stunning, full-colour designs that become permanently embedded in polyester fabrics, resulting in vibrant, fade-resistant prints that won't crack, peel, or fade over time.
              </p>

              <p className="text-lg mb-6">
                Whether you're looking for all-over print t-shirts, custom sports jerseys, vibrant activewear, or unique promotional items, our state-of-the-art sublimation printing technology delivers exceptional results for clients across Johannesburg, including Sandton, Rosebank, Randburg, Midrand, and surrounding areas. We specialize in bringing your boldest design visions to life with unmatched colour vibrancy and durability.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                What is Sublimation Printing?
              </h2>

              <p className="text-lg mb-6">
                Sublimation printing is a unique process that uses heat and pressure to transfer dye directly into polyester fabric at a molecular level. Unlike traditional printing methods that sit on top of the fabric, sublimation ink becomes part of the material itself, creating designs that are:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Palette className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Vibrant & Permanent</h3>
                  <p className="text-gray-700">
                    Sublimation produces incredibly vibrant colours that remain bright and vivid through countless washes. The dye is permanently embedded in the fabric, ensuring your designs never fade or deteriorate.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Sparkles className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">All-Over Print Capability</h3>
                  <p className="text-gray-700">
                    Unlike other printing methods, sublimation allows for seamless all-over prints that cover the entire garment, including sleeves, sides, and back. Perfect for bold, eye-catching designs.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Zap className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">No Feel, No Weight</h3>
                  <p className="text-gray-700">
                    Sublimation prints have no texture or added weight - the design feels exactly like the fabric itself. This creates a premium, seamless finish that's comfortable to wear.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Sublimation Printing Services in Johannesburg
              </h2>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">What We Can Sublimate</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span><strong>T-Shirts & Tops:</strong> Full-colour sublimation t-shirts, tank tops, and casual wear with all-over prints or custom designs.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Sports Jerseys:</strong> Custom sports jerseys, team uniforms, and athletic wear with vibrant, durable sublimation printing.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Activewear:</strong> Performance apparel, gym wear, and fitness clothing with moisture-wicking properties and vibrant designs.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Hoodies & Sweatshirts:</strong> Polyester hoodies and sweatshirts with full-colour sublimation designs for casual and athletic wear.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Accessories:</strong> Sublimated bags, caps, and accessories with custom designs and branding.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Sublimation Printing in Johannesburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">State-of-the-Art Equipment:</strong>
                    <p className="text-gray-700">We invest in the latest sublimation printing technology, ensuring consistent, high-quality results with vibrant colours and precise detail reproduction for every order.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Design Expertise:</strong>
                    <p className="text-gray-700">Our design team understands sublimation printing's unique capabilities and can help optimize your designs for maximum visual impact, including all-over prints and seamless patterns.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Premium Polyester Fabrics:</strong>
                    <p className="text-gray-700">We use only high-quality polyester fabrics specifically designed for sublimation, ensuring optimal colour absorption and long-lasting results.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">Sublimation printing is efficient, allowing us to offer competitive turnaround times. Standard orders are completed within 5-7 business days, with rush options available.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Competitive Pricing:</strong>
                    <p className="text-gray-700">We offer transparent, competitive pricing for sublimation printing, with volume discounts for bulk orders. No hidden fees, just quality results at fair prices.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Local Johannesburg Service:</strong>
                    <p className="text-gray-700">As a Johannesburg-based sublimation printing specialist, we understand local needs and provide personalized service to clients across Sandton, Rosebank, Randburg, and all surrounding areas.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Sublimation vs. Other Printing Methods
              </h2>

              <p className="text-lg mb-6">
                Understanding the differences between printing methods helps you choose the best option for your project:
              </p>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Sublimation Printing Advantages</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Permanent & Fade-Resistant:</strong> Designs become part of the fabric, never cracking, peeling, or fading.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>All-Over Print Capability:</strong> Can cover entire garments seamlessly, including sleeves and sides.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Vibrant Colours:</strong> Produces the most vibrant, photo-quality prints with unlimited colours and gradients.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>No Texture:</strong> Designs feel exactly like the fabric - no added weight or texture.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Durable:</strong> Withstands frequent washing, stretching, and wear without degradation.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-4">
                  <strong>Best For:</strong> Sports teams, activewear, promotional items, custom designs with photos or gradients, and any project requiring vibrant, permanent prints.
                </p>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving Sublimation Printing Clients Across Johannesburg
              </h2>

              <p className="text-lg mb-6">
                We provide professional sublimation printing services to clients throughout the greater Johannesburg area:
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
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> All Greater Johannesburg Areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started with Sublimation Printing in Johannesburg
              </h2>

              <p className="text-lg mb-8">
                Ready to create vibrant, permanent designs with sublimation printing? Contact MOTARRO Supplies today for a free consultation and quote. Whether you need custom sports jerseys, all-over print t-shirts, or unique promotional items, we'll help bring your vision to life with stunning sublimation printing results.
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Find Us in Johannesburg</h3>
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Sublimation Printing?</h3>
                <p className="text-lg mb-6">
                  Browse our sublimation products or contact us directly for a custom quote. We're here to help you create vibrant, permanent designs that stand out.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Sublimation Products</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
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

