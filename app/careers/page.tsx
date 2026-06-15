import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Briefcase, Users, Heart, Mail, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Careers - Join the MOTARRO Supplies Team",
  description: "Join MOTARRO Supplies's growing team! Explore career opportunities in custom printing, design, customer service, and e-commerce in Johannesburg and Kempton Park, South Africa.",
  keywords: [
    "careers",
    "jobs",
    "MOTARRO Supplies careers",
    "custom printing jobs",
    "fashion jobs Johannesburg",
    "e-commerce jobs South Africa",
    "design jobs Kempton Park",
    "retail jobs",
    "customer service jobs"
  ],
  openGraph: {
    title: "Careers - Join the MOTARRO Supplies Team",
    description: "Join MOTARRO Supplies's growing team! Explore career opportunities in custom printing, design, customer service, and e-commerce.",
    url: "https://www.motarro.co.za/careers",
    type: "website"
  },
  alternates: {
    canonical: "/careers"
  }
}

export default function CareersPage() {
  return (
    <div className="container px-4 py-12 mx-auto bg-lavender min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Careers</span>
      </div>

      {/* Coming Soon Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto py-20">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50"></div>
          <div className="relative bg-white rounded-full p-6 shadow-xl">
            <Briefcase className="h-16 w-16 text-primary mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Join Our Team
          </h1>
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            Coming Soon
          </div>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          We're building something special at MOTARRO Supplies, and we'd love to have passionate, creative individuals join us on this journey. Our careers page is coming soon, but we're always looking for talented people!
        </p>

        {/* What We're Looking For */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <Users className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">Great Team</h3>
            <p className="text-sm text-muted-foreground">
              Join a supportive, creative team that values collaboration, innovation, and fun. We believe in work-life balance.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <Heart className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">Growth Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Build your career with a growing company. We invest in training and development for all team members.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <Briefcase className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-lg">Diverse Roles</h3>
            <p className="text-sm text-muted-foreground">
              From design and printing to customer service and e-commerce, we have opportunities across many areas.
            </p>
          </div>
        </div>

        {/* Potential Roles */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-12 w-full max-w-2xl text-left">
          <h2 className="text-2xl font-bold mb-6 text-center">We're Always Looking For</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-1">Graphic Designers</h3>
              <p className="text-muted-foreground text-sm">
                Creative minds to design custom apparel, promotional materials, and marketing content.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-1">Print Specialists</h3>
              <p className="text-muted-foreground text-sm">
                Skilled professionals in screen printing, sublimation, and embroidery techniques.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-1">Customer Service</h3>
              <p className="text-muted-foreground text-sm">
                Friendly, helpful team members to assist customers and create great shopping experiences.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-1">E-commerce & Marketing</h3>
              <p className="text-muted-foreground text-sm">
                Digital marketing experts, SEO specialists, and e-commerce professionals to grow our online presence.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-12 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Interested in Joining Us?</h2>
          <p className="text-muted-foreground mb-6">
            Even though our careers page is coming soon, we'd love to hear from you! Send us your resume and tell us why you'd be a great fit.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Send Your Resume</h3>
                <a href="mailto:careers@www.motarro.co.za" className="text-primary hover:underline">
                  careers@www.motarro.co.za
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Include your portfolio if applicable
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Linkedin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Connect on LinkedIn</h3>
                <a 
                  href="/go/linkedin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Follow Our Company
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll post job openings here soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild size="lg" className="rounded-full">
            <a href="mailto:careers@www.motarro.co.za">
              Send Resume
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/about">
              Learn About Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

