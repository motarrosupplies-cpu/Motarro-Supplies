/**
 * Location Landing Page: Event Merchandise Johannesburg
 * SEO-optimized with 800-1500 words of unique content
 */

import { Metadata } from 'next';
import { LocalBusinessSchema } from '@/components/seo/local-business-schema';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, CheckCircle, Calendar, Gift, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "Event Merchandise Johannesburg | MOTARRO Supplies",
  description: "Custom event merchandise in Johannesburg. Professional event t-shirts, branded apparel, promotional items, and custom event products. Fast turnaround for conferences, festivals, sports events & more across Johannesburg.",
  keywords: [
    "event merchandise johannesburg",
    "event t-shirts johannesburg",
    "custom event apparel johannesburg",
    "event promotional items johannesburg",
    "conference merchandise johannesburg",
    "festival merchandise johannesburg",
    "sports event merchandise johannesburg",
    "custom event products johannesburg",
    "event branding johannesburg",
    "promotional event items johannesburg"
  ],
  openGraph: {
    title: "Event Merchandise Johannesburg | MOTARRO Supplies",
    description: "Custom event merchandise in Johannesburg. Professional event t-shirts, branded apparel, promotional items, and custom event products.",
    url: "https://www.motarro.co.za/event-merchandise-johannesburg",
    type: "website",
    locale: "en_ZA",
  },
  alternates: {
    canonical: "/event-merchandise-johannesburg",
  },
};

export default function EventMerchandiseJohannesburgPage() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema
        name="MOTARRO Supplies — Event Merchandise Johannesburg"
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
              Event Merchandise Johannesburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Custom event merchandise and promotional items in Johannesburg. Professional event t-shirts, branded apparel, and custom event products for conferences, festivals, sports events & more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Browse Event Products</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                <Link href="/contact">Get Event Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-primary">
                Professional Event Merchandise in Johannesburg
              </h2>
              
              <p className="text-lg mb-6">
                Make your event unforgettable with custom event merchandise from MOTARRO Supplies, Johannesburg's premier event merchandise supplier. Whether you're organizing a corporate conference in Sandton, a music festival in Rosebank, a sports tournament in Randburg, or any event throughout Johannesburg, we create custom event merchandise that enhances your event experience and leaves lasting impressions.
              </p>

              <p className="text-lg mb-6">
                From custom event t-shirts and branded apparel to promotional items and souvenir products, we provide comprehensive event merchandise solutions tailored to your event type, budget, and timeline. Our expertise in event branding and fast turnaround times makes us the preferred choice for event organizers across Johannesburg who need reliable, high-quality event merchandise that represents their event with excellence.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Event Merchandise for Every Occasion
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Calendar className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Corporate Events</h3>
                  <p className="text-gray-700">
                    Custom event merchandise for conferences, seminars, workshops, and corporate gatherings. Professional branded apparel and promotional items that reinforce your corporate message and create memorable event experiences.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Sparkles className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Festivals & Concerts</h3>
                  <p className="text-gray-700">
                    Vibrant event merchandise for music festivals, concerts, and entertainment events. Custom t-shirts, hoodies, and accessories that capture the energy and spirit of your event.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Gift className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4 text-primary">Sports Events</h3>
                  <p className="text-gray-700">
                    Custom merchandise for sports tournaments, marathons, team events, and athletic competitions. Performance apparel and commemorative items that celebrate athletic achievement.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Why Choose MOTARRO Supplies for Event Merchandise in Johannesburg?
              </h2>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Fast Turnaround:</strong>
                    <p className="text-gray-700">We understand event deadlines and offer expedited production for urgent event merchandise orders. Standard orders are completed within 5-7 business days, with rush options available for last-minute event needs.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Event Expertise:</strong>
                    <p className="text-gray-700">Our team has extensive experience creating event merchandise for various event types across Johannesburg, from intimate corporate gatherings to large-scale festivals and sports events.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Design Support:</strong>
                    <p className="text-gray-700">Our design team can help create event-specific designs, logos, and branding that capture your event's theme and message, ensuring your merchandise perfectly represents your event.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Flexible Ordering:</strong>
                    <p className="text-gray-700">We accommodate various order sizes, from small boutique events to large-scale festivals, with flexible pricing and ordering options to fit your event budget and requirements.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Quality Materials:</strong>
                    <p className="text-gray-700">We use only high-quality materials and printing methods, ensuring your event merchandise looks professional, feels comfortable, and serves as a lasting reminder of your event.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-lg">Local Johannesburg Service:</strong>
                    <p className="text-gray-700">As a Johannesburg-based event merchandise specialist, we provide personalized service and convenient delivery options for events throughout Sandton, Rosebank, Randburg, and all surrounding areas.</p>
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Popular Event Merchandise Options
              </h2>

              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Event Apparel & Products</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Event T-Shirts:</strong> Custom event t-shirts with event branding, dates, and designs. Available in various styles, colours, and sizes to suit your event theme and audience.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Event Hoodies:</strong> Premium event hoodies perfect for cooler weather events or as premium merchandise options. Great for festivals, outdoor events, and winter gatherings.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Event Caps & Accessories:</strong> Branded caps, beanies, and accessories that complement your event merchandise and provide additional revenue opportunities.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Promotional Items:</strong> Custom promotional products including bags, water bottles, and branded items that enhance your event experience and serve as marketing tools.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Commemorative Items:</strong> Special event merchandise designed to commemorate milestone events, anniversaries, or significant occasions with lasting value.</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Event Merchandise Planning & Timeline
              </h2>

              <p className="text-lg mb-6">
                Planning event merchandise requires careful coordination to ensure your products are ready when you need them. Here's our recommended timeline:
              </p>

              <div className="space-y-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">4-6 Weeks Before Event</h3>
                  <p className="text-gray-700">Initial consultation, design development, and sample approval. This allows time for design revisions and ensures your event merchandise perfectly matches your vision.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">2-3 Weeks Before Event</h3>
                  <p className="text-gray-700">Final order confirmation, production begins, and quality control. We keep you updated throughout the production process.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">1 Week Before Event</h3>
                  <p className="text-gray-700">Final quality checks, packaging, and delivery coordination. We ensure your event merchandise arrives on time and ready for your event.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-3 text-primary">Rush Orders Available</h3>
                  <p className="text-gray-700">Need event merchandise quickly? We offer rush production options for urgent orders, though we recommend planning ahead for best results and pricing.</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Serving Event Organizers Across Johannesburg
              </h2>

              <p className="text-lg mb-6">
                We provide professional event merchandise services to event organizers throughout the greater Johannesburg area:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Sandton (Corporate Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Rosebank (Business Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Randburg (Community Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Midrand (Corporate Parks)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Fourways (Sports Events)</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Kempton Park (Community Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Boksburg (Festivals)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Edenvale (Corporate Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> Bedfordview (Business Events)</li>
                  <li className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-2" /> All Greater Johannesburg Areas</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-primary mt-12">
                Get Started with Event Merchandise in Johannesburg
              </h2>

              <p className="text-lg mb-8">
                Ready to create memorable event merchandise for your Johannesburg event? Contact MOTARRO Supplies today for a free consultation and quote. Whether you're planning a corporate conference, music festival, sports tournament, or any other event, we'll help you create custom event merchandise that enhances your event experience and leaves lasting impressions.
              </p>

              <div className="bg-primary/10 p-8 rounded-lg mb-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">Event Merchandise Contact</h3>
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
                <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Order Event Merchandise?</h3>
                <p className="text-lg mb-6">
                  Browse our event products or contact us directly for a custom event quote. We're here to help you create memorable event merchandise that enhances your event and leaves lasting impressions.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/products">View Event Products</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                    <Link href="/contact">Get Event Quote</Link>
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

