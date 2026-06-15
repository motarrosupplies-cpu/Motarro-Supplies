"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { ChevronRight, Mail, Phone, MessageCircle, Clock, MapPin, Send } from "lucide-react";
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";
import { trackGa4GenerateLead } from "@/lib/ga4";

// Declare grecaptcha type for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [status, setStatus] = useState<null | "success" | "error" | "loading">(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Get reCAPTCHA site key from environment variable
  // Note: This is a public key intentionally exposed to the browser - safe for client-side use
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE || "REPLACE_WITH_YOUR_SITE_KEY";

  // Handle reCAPTCHA script load
  useEffect(() => {
    if (typeof window !== "undefined" && window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setRecaptchaLoaded(true);
        console.log("✅ reCAPTCHA loaded and ready");
      });
    }
  }, []);

  // Debug: Log if site key is missing
  useEffect(() => {
    if (recaptchaSiteKey === "REPLACE_WITH_YOUR_SITE_KEY") {
      console.warn("⚠️ reCAPTCHA Site Key not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE environment variable.");
    }
  }, [recaptchaSiteKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Honeypot check (client-side validation - bots might fill this)
    if (form.honeypot) {
      // Silent fail for bots
      return;
    }

    setStatus("loading");

    try {
      let recaptchaToken = "";

      // Execute reCAPTCHA v3 (invisible) if loaded
      if (recaptchaLoaded && window.grecaptcha && recaptchaSiteKey !== "REPLACE_WITH_YOUR_SITE_KEY") {
        try {
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
            action: "contact_form_submit",
          });
          console.log("✅ reCAPTCHA token generated");
        } catch (recaptchaError) {
          console.error("❌ reCAPTCHA execution error:", recaptchaError);
          // Continue with submission even if reCAPTCHA fails (backend will handle)
        }
      } else if (recaptchaSiteKey !== "REPLACE_WITH_YOUR_SITE_KEY") {
        console.warn("⚠️ reCAPTCHA not loaded yet");
        setStatus("error");
        return;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          "g-recaptcha-response": recaptchaToken,
          "website-url": form.honeypot, // Honeypot field
        }),
      });

      setStatus(res.ok ? "success" : "error");

      if (res.ok) {
        trackGa4GenerateLead({ method: "contact_form" });
        setForm({ name: "", email: "", message: "", honeypot: "" });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  }

  return (
    <>
      <LocalBusinessSchema />
      {/* Google reCAPTCHA v3 Script - Load once per page */}
      {recaptchaSiteKey !== "REPLACE_WITH_YOUR_SITE_KEY" && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== "undefined" && window.grecaptcha) {
              window.grecaptcha.ready(() => {
                setRecaptchaLoaded(true);
                console.log("✅ reCAPTCHA script loaded successfully");
              });
            }
          }}
          onError={(e) => {
            console.error("❌ Failed to load reCAPTCHA script:", e);
          }}
        />
      )}
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Contact Us</span>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Contact MOTARRO Supplies — Custom Printing Services in Kempton Park & Johannesburg</h1>
          <p className="text-muted-foreground max-w-[700px] text-lg">
            Have a question about our custom printing services? Need a quote for your project? Our friendly team is here to help. Reach out through any of the channels below, and we'll get back to you promptly.
          </p>
        </div>

        {/* Contact Information Section */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Get in Touch with MOTARRO Supplies</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              We're here to help with all your custom printing needs. Whether you have questions about our products, 
              need assistance with an order, want to discuss a custom project, or need guidance on choosing the right printing 
              technique for your needs, our experienced team is ready to assist you. Based in Kempton Park and serving customers 
              throughout Johannesburg and South Africa, we're committed to providing exceptional service and support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Email Support</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For general inquiries, order questions, detailed project discussions, or custom printing quotes. We typically respond within 24 hours.
              </p>
              <a href="mailto:motarrodotcoza@gmail.com" className="text-primary hover:underline font-medium">
                motarrodotcoza@gmail.com
              </a>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Phone Support</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Speak directly with our team for immediate assistance, urgent orders, or complex custom printing projects that require detailed discussion.
              </p>
              <a href="tel:0696228848" className="text-primary hover:underline font-medium text-lg">
                069 622 8848
              </a>
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Mon-Fri, 9am-5pm</span>
              </div>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">WhatsApp</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Quick questions, instant support, or send us images of your design for a fast quote. Perfect for on-the-go inquiries.
              </p>
              <a href="https://wa.me/27696228848" className="text-primary hover:underline font-medium text-lg">
                +27 69 622 8848
              </a>
            </div>
          </div>

          {/* Business Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Service Areas</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Based in Kempton Park, we proudly serve customers throughout the greater Johannesburg area, including:
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Kempton Park & Boksburg</li>
                <li>• Johannesburg CBD & Sandton</li>
                <li>• Randburg & Midrand</li>
                <li>• Rosebank & Parktown</li>
                <li>• Nationwide delivery across South Africa</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-primary">Response Times</h3>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Email:</strong> Within 24 hours (usually same day)</li>
                <li><strong>Phone:</strong> Immediate during business hours</li>
                <li><strong>WhatsApp:</strong> Usually within 1-2 hours</li>
                <li><strong>Custom Quotes:</strong> 24-48 hours for complex projects</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border-2 border-primary/20 rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold mb-3 text-primary">Why Contact Us?</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our team of custom printing experts is here to help you bring your vision to life. From choosing the right 
              materials and printing techniques to ensuring your order meets your exact specifications, we provide personalized 
              guidance every step of the way. Whether you're ordering custom t-shirts for a small event or corporate uniforms 
              for hundreds of employees, we're here to help. Don't hesitate to reach out - we're passionate about delivering 
              exceptional results and ensuring your complete satisfaction with every project.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - Hidden from users, bots might fill it */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
              <label htmlFor="website-url">Website URL (leave blank)</label>
              <input
                id="website-url"
                type="text"
                name="website-url"
                tabIndex={-1}
                autoComplete="off"
                value={form.honeypot}
                onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="name">Your Name *</label>
              <input 
                id="name" 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="email">Your Email *</label>
              <input 
                id="email" 
                type="email" 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="message">Your Message *</label>
              <textarea 
                id="message" 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={form.message} 
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))} 
                placeholder="Tell us about your custom printing project, questions, or how we can help..."
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
            {status === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                Message sent successfully! We'll be in touch soon.
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                Something went wrong. Please try again or contact us directly via phone or WhatsApp.
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
