import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help Center - Support & Assistance",
  description: "Get help with your orders, custom printing questions, and account issues. Find answers to common questions and contact our support team.",
  keywords: ["help", "support", "assistance", "customer service", "orders", "custom printing", "FAQ"],
  openGraph: {
    title: "Help Center - Support & Assistance",
    description: "Get help with your orders, custom printing questions, and account issues.",
    url: "https://www.motarro.co.za/help"
  },
  alternates: {
    canonical: "/help"
  }
}

export default function HelpPage() {
  return (
    <div className="container px-4 py-12 mx-auto bg-lavender">
      <h1 className="text-3xl font-bold mb-4 text-center">Help Center</h1>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        If you need assistance, please contact us at support@www.motarro.co.za or use the contact form on the Contact page.
      </p>

      {/* Help Content Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-primary">How do I place an order?</h3>
              <p className="text-muted-foreground">
                Browse our products, select your desired items, add them to your cart, and proceed to checkout. You can create an account for easier future orders or check out as a guest.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-primary">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and secure online payment methods including PayFast and Instant EFT. All transactions are processed securely in South African Rand (ZAR).
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-primary">How long does shipping take?</h3>
              <p className="text-muted-foreground">
                Standard delivery takes 3-5 business days, express delivery takes 1-2 business days, and same-day delivery is available for orders placed before 11am in major cities. Free shipping is available on orders over R1000.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-primary">Can I track my order?</h3>
              <p className="text-muted-foreground">
                Yes! Once your order ships, you'll receive a tracking number via email. You can use this to track your package on our website or the courier's platform.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-primary">What is your return policy?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day return window for unused items with original tags attached. Standard-sized items can be returned for free, while oversized items incur a R50 return fee. Refunds are processed within 5-7 business days.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">How do I contact customer support?</h3>
              <p className="text-muted-foreground">
                You can reach our customer support team via email at support@www.motarro.co.za, phone at 069 622 8848 (Mon-Fri, 9am-5pm), or WhatsApp at +27 69 622 8848. We're here to help with any questions or concerns you may have.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Still Need Help?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Our customer support team is dedicated to providing excellent service and resolving any issues you may encounter. 
            Don't hesitate to reach out - we're here to ensure you have the best possible experience with MOTARRO Supplies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@www.motarro.co.za" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Email Support
            </a>
            <a href="tel:0696228848" className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 