/**
 * Location Landing Page: Corporate Uniforms Johannesburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, Shirt, Users, Building } from 'lucide-react';

export const metadata: Metadata = {
  title: "Corporate Uniforms Johannesburg | MOTARRO Supplies",
  description: "Professional corporate uniforms in Johannesburg. Custom business uniforms, branded workwear, and professional apparel for companies. Fast delivery across Sandton, Rosebank, Randburg & all of Johannesburg.",
  keywords: [
    "corporate uniforms johannesburg",
    "business uniforms johannesburg",
    "corporate workwear johannesburg",
    "company uniforms johannesburg",
    "professional uniforms johannesburg",
    "corporate apparel johannesburg",
    "business wear johannesburg",
    "corporate clothing johannesburg",
    "uniform suppliers johannesburg",
    "workwear johannesburg"
  ],
  openGraph: {
    title: "Corporate Uniforms Johannesburg | MOTARRO Supplies",
    description: "Professional corporate uniforms in Johannesburg. Custom business uniforms, branded workwear, and professional apparel for companies.",
    url: "https://www.motarro.co.za/corporate-uniforms-johannesburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/corporate-uniforms-johannesburg",
  },
};

export default function CorporateUniformsJohannesburgPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Corporate Uniforms Johannesburg"
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
              Corporate Uniforms Johannesburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional corporate uniforms and business workwear in Johannesburg. Custom uniforms, branded corporate wear, and professional apparel for companies across Sandton, Rosebank, Randburg & all of Johannesburg.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Corporate Uniforms</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                <Link href="/contact">Request Uniform Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Corporate Uniforms in Johannesburg
              </h2>
              
              <p className="text-lg mb-6">
                Elevate your company's professional image with premium corporate uniforms from MOTARRO Supplies, Johannesburg's trusted corporate uniform supplier. We specialize in creating custom business uniforms, branded workwear, and professional apparel that unifies your team, strengthens your brand identity, and projects the professional image your company deserves.
              </p>

              <p className="text-lg mb-6">
                Whether you're a corporate office in Sandton, a retail chain in Rosebank, a manufacturing facility in Randburg, a hospitality business in Midrand, or any company throughout Johannesburg, we provide comprehensive corporate uniform solutions tailored to your industry, brand guidelines, and operational requirements. Our expertise in corporate branding and uniform design ensures that every piece of apparel reinforces your company's professional image while providing comfort and durability for your team.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Corporate Uniform Solutions for Every Industry
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Building className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Office & Corporate</h3>
                  <p className="text-gray-700">
                    Professional corporate uniforms including branded polo shirts, business casual wear, corporate blazers, and executive apparel. Perfect for corporate offices, financial institutions, and professional services firms throughout Johannesburg.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Users className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Retail & Hospitality</h3>
                  <p className="text-gray-700">
                    Uniform solutions for retail stores, restaurants, hotels, and hospitality venues. From branded aprons to professional service uniforms, we create cohesive team looks that enhance customer experience and brand recognition.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Shirt className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Industrial & Safety</h3>
                  <p className="text-gray-700">
                    High-visibility workwear, branded safety vests, industrial uniforms, and protective clothing with custom branding. Perfect for manufacturing, construction, logistics, and industrial companies in Johannesburg.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Corporate Uniforms in Johannesburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Brand Consistency:</strong>
                    <p className="text-gray-700">We ensure your corporate uniforms perfectly match your brand guidelines, including exact colour matching, precise logo placement, and design specifications. Every uniform reinforces your brand identity consistently across your entire team.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Bulk Order Expertise:</strong>
                    <p className="text-gray-700">We specialize in large-scale corporate uniform orders, offering competitive pricing, significant volume discounts, and streamlined ordering processes for companies ordering hundreds or thousands of uniforms.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Quality Materials:</strong>
                    <p className="text-gray-700">We source only premium fabrics and materials that withstand daily wear, frequent washing, and professional use. Your corporate uniforms will maintain their professional appearance and durability for years.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Comprehensive Sizing:</strong>
                    <p className="text-gray-700">We accommodate all team members with comprehensive sizing options, including extended sizes and custom fittings, ensuring every employee looks professional and feels comfortable in their corporate uniform.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">We understand corporate deadlines and offer efficient production timelines. Standard corporate uniform orders are completed within 5-7 business days, with expedited options available for urgent requirements.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Dedicated Account Management:</strong>
                    <p className="text-gray-700">Corporate clients receive dedicated support from our team, including design consultation, sample approvals, ongoing account management, and seamless reordering processes to ensure consistent uniform supply.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Our Corporate Uniform Services
              </h2>

              <p className="text-lg mb-6">
                At MOTARRO Supplies, we offer comprehensive corporate uniform solutions designed to meet the unique needs of businesses across Johannesburg:
              </p>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Custom Branding Options</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Embroidery:</strong> Professional embroidered logos for polo shirts, jackets, and corporate wear. Perfect for executive apparel and premium corporate uniforms that require a sophisticated, long-lasting finish.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Screen Printing:</strong> Cost-effective branding for large uniform orders. Ideal for t-shirts, workwear, and promotional corporate apparel requiring durable, high-quality prints.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>DTG Printing:</strong> High-quality full-colour printing for complex designs, detailed artwork, and corporate graphics on uniform t-shirts and casual corporate wear.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Heat Transfer:</strong> Professional heat transfer branding for corporate uniforms, offering flexibility in design and application for various uniform types and materials.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Corporate Uniform Ordering Process
              </h2>

              <div className="space-y-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 1: Consultation & Design</h3>
                  <p className="text-gray-700">We begin with a comprehensive consultation to understand your brand guidelines, uniform requirements, sizing needs, and corporate clothing specifications. Our design team creates mockups and samples for your approval.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 2: Sample Approval</h3>
                  <p className="text-gray-700">We provide physical samples of your corporate uniforms with your branding applied, ensuring colours, sizing, fabric quality, and overall appearance meet your expectations before full production begins.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 3: Production & Quality Control</h3>
                  <p className="text-gray-700">Once approved, we proceed with full production, maintaining strict quality control throughout. Every uniform is inspected to ensure it meets our high standards for branding, sizing, and quality.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Step 4: Delivery & Distribution</h3>
                  <p className="text-gray-700">We coordinate delivery to your Johannesburg location or multiple sites, with options for individual packaging, bulk delivery, or staged rollouts for large teams. We can also arrange fitting sessions if needed.</p>
                </div>
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
                Get Started with Corporate Uniforms in Johannesburg
              </h2>

              <p className="text-lg mb-8">
                Ready to outfit your team with professional corporate uniforms? Contact MOTARRO Supplies today for a free consultation and quote. We'll work with you to create custom corporate uniforms that strengthen your brand, unify your team, and project the professional image your company deserves, whether you need uniforms for 10 employees or 1000.
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Corporate Uniforms?</h3>
                <p className="text-lg mb-6">
                  Browse our corporate uniform catalog or contact us directly for a custom corporate quote. We're here to help you create professional branded uniforms that represent your company with excellence.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Corporate Uniforms</Link>
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

