import Link from "next/link";
import { ChevronRight, MapPin, Award, Users, Heart } from "lucide-react";
import { Metadata } from "next";
import { OrganizationSchema } from "@/components/seo/organization-schema";

import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: `About Us | ${MOTARRO_BRAND_NAME}`,
  description: `Learn about ${MOTARRO_BRAND_NAME} — South Africa's online destination for premium stationery, craft supplies, and educational materials. Nationwide delivery in ZAR.`,
  keywords: [
    "about motarro",
    "stationery south africa",
    "craft supplies south africa",
    "school supplies",
    "educational materials",
    "motarro supplies",
  ],
  openGraph: {
    title: `About Us | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    url: `${MOTARRO_SITE_URL}/about`,
    siteName: "MOTARRO Supplies",
    type: "website",
    locale: "en_ZA"
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
  },
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema />
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">About Us</span>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">About MOTARRO Supplies — Custom Apparel Printing Services in Kempton Park & Johannesburg</h1>
          <p className="text-muted-foreground max-w-[700px] text-lg">
            Premium custom printing services for t-shirts, hoodies, and promotional merchandise in South Africa. Quality printing with fast delivery across Johannesburg, Kempton Park, and nationwide.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              Founded in 2020, MOTARRO Supplies was born from a simple yet powerful idea: clothing should do more than just cover you—it should make you smile, express your identity, and tell your story. What started as a passion project in Kempton Park has grown into one of South Africa's trusted custom printing services, serving businesses, events, and individuals across Johannesburg and beyond.
            </p>
            <p>
              Our journey began when we recognized a gap in the market for high-quality, affordable custom apparel that didn't require massive minimum orders. We saw that small businesses, event organizers, and individuals needed access to professional printing services without the traditional barriers. Today, we're proud to offer everything from single custom t-shirts to large-scale corporate uniform orders, all with the same commitment to quality and customer satisfaction.
            </p>
            <p>
              Based in the heart of Kempton Park, with strong connections throughout Johannesburg, we've built our reputation on three core principles: exceptional quality, unbeatable customer service, and fair pricing. Whether you're a startup looking to create branded merchandise, a sports team needing custom uniforms, or an individual wanting to express your unique style, we're here to bring your vision to life.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To empower individuals and businesses across South Africa to express themselves through high-quality custom apparel. We believe that everyone deserves access to professional printing services, regardless of order size or budget. Our mission is to make custom apparel accessible, affordable, and exceptional.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Our Values</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Quality First:</strong> We never compromise on the quality of our prints, materials, or service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Customer Focus:</strong> Your satisfaction is our success. We go above and beyond to ensure every order exceeds expectations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Innovation:</strong> We stay at the forefront of printing technology and techniques to offer you the best results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Accessibility:</strong> Professional printing shouldn't be exclusive. We make it accessible to everyone.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Custom Printing Services in Johannesburg</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional custom printing services for all your apparel needs. From t-shirts to hoodies, we deliver high-quality prints with attention to detail. Our services include screen printing, sublimation printing, direct-to-garment (DTG) printing, and embroidery, ensuring we have the right technique for your project.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Screen Printing & Digital Printing</li>
                <li>Custom T-Shirts & Hoodies</li>
                <li>Promotional Merchandise</li>
                <li>Corporate Branding & Uniforms</li>
                <li>Event Apparel & Team Wear</li>
                <li>Embroidery Services</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Custom Apparel Solutions in South Africa</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're in Kempton Park, Johannesburg, Sandton, Randburg, or anywhere else in South Africa, we're here to serve you. Our online platform makes it easy to order custom apparel from anywhere, while our local presence ensures fast delivery and personalized service for customers in the greater Johannesburg area.
              </p>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-primary">Service Areas</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  We proudly serve Kempton Park, Johannesburg, Sandton, Randburg, Midrand, and nationwide delivery across South Africa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Why Choose MOTARRO Supplies?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-muted-foreground">
                We use only the finest materials and state-of-the-art printing equipment to ensure your custom apparel looks professional and lasts.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Team</h3>
              <p className="text-muted-foreground">
                Our experienced team understands the nuances of custom printing and is dedicated to helping you achieve the perfect result for your project.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-muted-foreground">
                Your satisfaction is our priority. From initial consultation to final delivery, we're committed to providing exceptional service every step of the way.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Ready to Create Custom Apparel?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Whether you're looking for custom t-shirts for your team, branded merchandise for your business, or unique apparel for a special event, we're here to help. Get in touch with our team today to discuss your custom printing project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products" 
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
            <Link 
              href="/contact" 
              className="bg-white border-2 border-primary text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
