/**
 * Location Landing Page: Branded Corporate Clothing Johannesburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, Briefcase, Users, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: "Branded Corporate Clothing Johannesburg | MOTARRO Supplies",
  description: "Premium branded corporate clothing in Johannesburg. Custom business uniforms, branded workwear, and professional apparel for companies. Fast delivery across Sandton, Rosebank, Randburg & all of Johannesburg.",
  keywords: [
    "branded corporate clothing johannesburg",
    "corporate clothing johannesburg",
    "business uniforms johannesburg",
    "corporate workwear johannesburg",
    "branded apparel johannesburg",
    "company uniforms johannesburg",
    "professional clothing johannesburg",
    "corporate branded apparel",
    "business apparel johannesburg",
    "corporate wear suppliers johannesburg"
  ],
  openGraph: {
    title: "Branded Corporate Clothing Johannesburg | MOTARRO Supplies",
    description: "Premium branded corporate clothing in Johannesburg. Custom business uniforms, branded workwear, and professional apparel for companies.",
    url: "https://www.motarro.co.za/branded-corporate-clothing-johannesburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/branded-corporate-clothing-johannesburg",
  },
};

export default function BrandedCorporateClothingJohannesburgPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Branded Corporate Clothing Johannesburg"
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
              Branded Corporate Clothing Johannesburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Premium branded corporate clothing and business uniforms in Johannesburg. Professional workwear, custom business apparel, and branded corporate wear for companies across Gauteng.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Corporate Apparel</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                <Link href="/contact">Request Corporate Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Branded Corporate Clothing in Johannesburg
              </h2>
              
              <p className="text-lg mb-6">
                Elevate your company's professional image with premium branded corporate clothing from MOTARRO Supplies. We specialize in creating custom business uniforms, branded workwear, and professional apparel that reflects your company's values and strengthens your brand identity across Johannesburg and the greater Gauteng region.
              </p>

              <p className="text-lg mb-6">
                Whether you're a corporate office in Sandton, a retail chain in Rosebank, a manufacturing facility in Randburg, or a service company anywhere in Johannesburg, we provide comprehensive corporate clothing solutions tailored to your industry, brand guidelines, and budget. Our expertise in corporate branding ensures that every piece of apparel reinforces your company's professional image while providing comfort and durability for your team.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Corporate Clothing Solutions for Every Industry
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Briefcase className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Office & Corporate</h3>
                  <p className="text-gray-700">
                    Professional polo shirts, branded blazers, corporate t-shirts, and business casual wear perfect for corporate offices, financial institutions, and professional services firms in Sandton, Rosebank, and throughout Johannesburg.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Users className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Retail & Hospitality</h3>
                  <p className="text-gray-700">
                    Uniform solutions for retail stores, restaurants, hotels, and hospitality venues. From branded aprons to professional service uniforms, we create cohesive team looks that enhance customer experience.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Award className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Industrial & Safety</h3>
                  <p className="text-gray-700">
                    High-visibility workwear, branded safety vests, industrial uniforms, and protective clothing with custom branding. Perfect for manufacturing, construction, and logistics companies.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Corporate Clothing in Johannesburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Brand Consistency:</strong>
                    <p className="text-gray-700">We ensure your corporate clothing perfectly matches your brand guidelines, including exact colour matching, logo placement, and design specifications. Every piece reinforces your brand identity.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Bulk Order Expertise:</strong>
                    <p className="text-gray-700">We specialize in large-scale corporate orders, offering competitive pricing, volume discounts, and streamlined ordering processes for companies ordering hundreds or thousands of pieces.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Quality Materials:</strong>
                    <p className="text-gray-700">We source only premium fabrics and materials that withstand daily wear, frequent washing, and professional use. Your corporate clothing will maintain its appearance and durability for years.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Flexible Sizing:</strong>
                    <p className="text-gray-700">We accommodate all team members with comprehensive sizing options, including extended sizes, ensuring every employee looks professional and feels comfortable in their corporate uniform.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">We understand corporate deadlines and offer expedited production for urgent orders. Standard corporate orders are completed within 5-7 business days, with rush options available.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Dedicated Account Management:</strong>
                    <p className="text-gray-700">Corporate clients receive dedicated support from our team, including design consultation, sample approvals, and ongoing account management to ensure seamless reordering and updates.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Corporate Clothing Services
              </h2>

              <p className="text-lg mb-6">
                At MOTARRO Supplies, we offer comprehensive corporate clothing solutions designed to meet the unique needs of businesses across Johannesburg:
              </p>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Custom Branding Options</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Embroidery:</strong> Professional embroidered logos for polo shirts, jackets, and corporate wear. Perfect for executive apparel and premium corporate clothing.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Screen Printing:</strong> Cost-effective branding for large orders. Ideal for t-shirts, workwear, and promotional corporate apparel.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>DTG Printing:</strong> High-quality full-colour printing for complex designs, photographs, and detailed artwork on corporate t-shirts and casual wear.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Sublimation:</strong> Permanent, fade-resistant branding perfect for polyester corporate wear, sports uniforms, and performance apparel.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving Corporate Clients Across Johannesburg
              </h2>

              <p className="text-lg mb-6">
                We proudly serve corporate clients throughout the greater Johannesburg metropolitan area, including major business districts and industrial zones:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton (Corporate Offices)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rosebank (Business District)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Randburg (Industrial & Retail)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Midrand (Corporate Parks)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Fourways (Business Centres)</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Kempton Park (Manufacturing)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Boksburg (Industrial)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Edenvale (Corporate)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Bedfordview (Business District)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> All Greater Johannesburg Areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Corporate Clothing Ordering Process
              </h2>

              <div className="space-y-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 1: Consultation & Design</h3>
                  <p className="text-gray-700">We begin with a consultation to understand your brand guidelines, sizing requirements, and corporate clothing needs. Our design team creates mockups and samples for approval.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 2: Sample Approval</h3>
                  <p className="text-gray-700">We provide physical samples of your corporate clothing with your branding applied, ensuring colours, sizing, and quality meet your expectations before full production.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 3: Production & Quality Control</h3>
                  <p className="text-gray-700">Once approved, we proceed with full production, maintaining strict quality control throughout. Every piece is inspected to ensure it meets our high standards.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 4: Delivery & Distribution</h3>
                  <p className="text-gray-700">We coordinate delivery to your Johannesburg location or multiple sites, with options for individual packaging, bulk delivery, or staged rollouts for large teams.</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started with Corporate Clothing in Johannesburg
              </h2>

              <p className="text-lg mb-8">
                Ready to outfit your team with professional branded corporate clothing? Contact MOTARRO Supplies today for a free consultation and quote. We'll work with you to create custom corporate apparel that strengthens your brand and unifies your team, whether you need uniforms for 10 employees or 1000.
              </p>

              <div className="bg-primary/10 p-8 rounded-lg mb-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">Corporate Sales Contact</h3>
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Our Location in Johannesburg</h3>
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Corporate Clothing?</h3>
                <p className="text-lg mb-6">
                  Browse our corporate apparel catalog or contact us directly for a custom corporate quote. We're here to help you create professional branded clothing that represents your company with excellence.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Corporate Apparel</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                    <Link href="/contact">Request Corporate Quote</Link>
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

