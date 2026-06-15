import Link from "next/link"
import { ChevronRight, HelpCircle, Mail, Phone, MessageCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Metadata } from "next"

import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: `FAQ | ${MOTARRO_BRAND_NAME}`,
  description: `Find answers about ordering stationery and craft supplies, shipping, returns, and payments at ${MOTARRO_BRAND_NAME}. Help for customers across South Africa.`,
  keywords: [
    "FAQ",
    "help",
    "stationery FAQ",
    "craft supplies help",
    "shipping south africa",
    "returns policy",
    "motarro supplies support",
  ],
  openGraph: {
    title: `FAQ | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    url: `${MOTARRO_SITE_URL}/faq`,
  },
  alternates: {
    canonical: "/faq"
  }
}

const faqCategories = {
  ordering: [
    {
      question: "How do I place an order?",
      answer: "Placing an order with MOTARRO Supplies is simple. Browse our stationery and craft catalogue, add items to your cart, and proceed to checkout. You can create an account for easier future orders or check out as a guest. We accept major credit and debit cards, PayFast, and Instant EFT. Once confirmed, you'll receive an email with your order details and tracking information.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and secure online payment methods including PayFast and Instant EFT. All transactions are processed securely in South African Rand (ZAR). We use industry-standard encryption to protect your payment information, ensuring a safe and secure shopping experience. For large corporate orders, we also offer invoice payment options - please contact us to discuss payment terms for bulk orders.",
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placing them, as long as production hasn't begun. After this window, please contact our customer service team immediately at motarrodotcoza@gmail.com or call 069 622 8848. We'll do our best to accommodate your request, though modifications may incur additional charges depending on the changes required. For custom printing orders, once production has started, modifications may not be possible, but we'll work with you to find the best solution.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer professional gift wrapping services for R50 per item. You can select this option during checkout, and we'll beautifully wrap your items in premium gift packaging. This is perfect for special occasions, corporate gifts, or when you want to add an extra touch to your order. Gift wrapping includes a personalized gift message if you'd like to include one.",
    },
    {
      question: "What is your minimum order quantity?",
      answer: "For standard products, there's no minimum order quantity - you can order as little as one item. However, for custom printing services, minimum quantities vary by printing method: Screen printing typically requires a minimum of 12-24 pieces for cost-effectiveness, while sublimation printing can accommodate smaller orders starting from 1 piece. Direct-to-garment (DTG) printing is ideal for small orders of 1-10 pieces. Contact us for specific minimums based on your custom printing needs.",
    },
  ],
  shipping: [
    {
      question: "What are your shipping costs?",
      answer: "We offer competitive shipping rates across South Africa. Standard delivery is free for orders over R1000, otherwise R99.99. Express delivery (1-2 business days) is R199.99, and same-day delivery (available in major cities for orders placed before 11am) is R299.99. For bulk orders and corporate clients, we offer discounted shipping rates - contact us for a custom shipping quote. All prices include VAT and are calculated at checkout based on your delivery address.",
    },
    {
      question: "How long will my delivery take?",
      answer: "Delivery times depend on your chosen shipping method and whether your order includes custom printing. Standard delivery takes 3-5 business days, express delivery takes 1-2 business days, and same-day delivery is available for orders placed before 11am in major cities like Johannesburg, Cape Town, and Durban. For custom printing orders, please add 5-10 business days for production time before shipping. You'll receive tracking information once your order ships, allowing you to monitor its progress in real-time.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within South Africa. For international enquiries, please contact us at motarrodotcoza@gmail.com. We're focused on delivering quality stationery and craft supplies nationwide in ZAR.",
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email and SMS (if you provided a phone number). You can use this tracking number on our website's order tracking page or directly on the courier's platform. Our tracking system provides real-time updates on your package's location and estimated delivery time. If you have any questions about your shipment or need assistance with tracking, our customer service team is here to help.",
    },
    {
      question: "What happens if my order is lost or damaged?",
      answer: "We take great care in packaging your orders to prevent damage during transit. However, if your order arrives damaged or is lost in transit, please contact us immediately at motarrodotcoza@gmail.com or call 069 622 8848. We'll investigate the issue and work with the courier to resolve it. In most cases, we'll send a replacement order at no additional cost to you. We recommend inspecting your package upon delivery and reporting any issues within 48 hours of receipt.",
    },
  ],
  returns: [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return window for unused items with original tags attached and in their original packaging. Standard-sized items can be returned for free, while oversized items incur a R50 return fee. Custom printed items are generally not returnable unless there's a manufacturing defect or error on our part. To initiate a return, log into your account, select the items you wish to return, and follow our simple return process. We want you to be completely satisfied with your purchase.",
    },
    {
      question: "How do I return an item?",
      answer: "Returning an item is easy. Log into your account on our website, navigate to your order history, and select the items you wish to return. Choose your preferred return method - you can either drop off the package at one of our partner locations or schedule a pickup from your address. We'll provide you with a prepaid return label and detailed instructions. Once we receive and inspect your return, we'll process your refund within 5-7 business days. For assistance with returns, contact our customer service team.",
    },
    {
      question: "When will I receive my refund?",
      answer: "Refunds are processed within 5-7 business days after we receive and inspect your return. The refund amount will be credited back to your original payment method. For credit card payments, it may take an additional 3-5 business days for the refund to appear in your account, depending on your bank's processing time. You'll receive an email confirmation once your refund has been processed. If you don't see your refund after this timeframe, please contact us and we'll investigate immediately.",
    },
    {
      question: "Can I exchange an item?",
      answer: "Yes, you can exchange items within the 30-day return window. Simply initiate a return for the item you wish to exchange and place a new order for the desired item. If the new item costs more, you'll pay the difference. If it costs less, we'll refund the difference once we receive your return. For size exchanges, we recommend placing your new order first to ensure availability, then returning the original item. This helps prevent the size you need from selling out while you wait for the return to process.",
    },
  ],
  sizing: [
    {
      question: "How do I find my size?",
      answer: "We provide comprehensive size guides for all our products to help you find the perfect fit. You can find detailed size charts under the Customer Service section of our website or on individual product pages. Our size guides include measurements in centimeters and inches, covering chest, waist, length, and sleeve measurements. We recommend measuring yourself or a similar garment you own and comparing it to our size chart. If you're between sizes, we typically recommend sizing up for a more comfortable fit.",
    },
    {
      question: "Are your sizes true to fit?",
      answer: "Our sizes generally run true to standard South African sizing. However, fit can vary slightly between different product styles and materials. We recommend checking the size guide and product reviews for specific fit information. Many of our customers share their fit experiences in product reviews, which can be helpful when deciding between sizes. If you're unsure, our customer service team is happy to provide sizing recommendations based on your measurements and preferences.",
    },
    {
      question: "What if an item doesn't fit?",
      answer: "If an item doesn't fit, you can return or exchange it within our 30-day return window, as long as it's unworn with tags attached and in its original packaging. We offer free returns for standard-sized items, making it easy to exchange for a different size. Simply initiate a return through your account, and we'll guide you through the process. We want you to be completely satisfied with your purchase, so don't hesitate to exchange items that don't fit properly.",
    },
    {
      question: "Do you offer custom sizing?",
      answer: "For certain products and custom printing orders, we can accommodate custom sizing requests. This is particularly useful for corporate uniform orders or special events where precise sizing is important. Custom sizing may incur additional charges and extended production time. Please contact us at motarrodotcoza@gmail.com to discuss your custom sizing needs, and we'll provide a quote and timeline for your specific requirements.",
    },
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Creating an account is quick and easy. Click the 'Account' icon in the top navigation bar and select 'Create Account'. Fill in your details including your name, email address, and create a secure password. You'll receive a verification email - click the link in the email to verify your account and complete registration. Having an account makes it easier to track orders, manage returns, save your favorite products, and enjoy faster checkout on future orders.",
    },
    {
      question: "Can I order without an account?",
      answer: "Yes, you can absolutely check out as a guest without creating an account. However, creating an account offers several benefits: easier order tracking, faster checkout on future orders, access to your order history, simplified returns process, and the ability to save your favorite products and shipping addresses. Guest checkout is perfect for one-time purchases, while an account is ideal if you plan to shop with us regularly or need to manage multiple orders.",
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click 'Forgot Password' on the login page. Enter the email address associated with your account, and we'll send you instructions to reset your password. The email will contain a secure link that allows you to create a new password. If you don't receive the email within a few minutes, check your spam folder. For additional assistance with password resets, contact our customer service team at motarrodotcoza@gmail.com.",
    },
    {
      question: "How do I update my account information?",
      answer: "You can update your account information at any time by logging into your account and navigating to the 'Account Settings' section. Here you can update your personal information, shipping addresses, payment methods, and communication preferences. Keeping your account information up to date ensures smooth order processing and delivery. If you need help updating your information, our customer service team is available to assist you.",
    },
  ],
  printing: [
    {
      question: "What printing methods do you offer?",
      answer: "We offer a comprehensive range of printing methods to suit different needs and budgets. Our services include screen printing (ideal for bulk orders with simple designs), sublimation printing (perfect for full-color designs and polyester garments), direct-to-garment (DTG) printing (excellent for small orders and photographic-quality prints), and embroidery (premium option for corporate uniforms and high-end items). Each method has its advantages, and our team can help you choose the best option for your project.",
    },
    {
      question: "How long does custom printing take?",
      answer: "Custom printing production times vary based on the printing method, order quantity, and design complexity. Screen printing typically takes 5-7 business days for production, sublimation printing takes 3-5 business days, DTG printing takes 2-4 business days, and embroidery takes 7-10 business days. These times are in addition to shipping time. Rush orders may be available for an additional fee - contact us to discuss expedited production options for urgent projects.",
    },
    {
      question: "What file formats do you accept for custom printing?",
      answer: "For best results, we recommend high-resolution vector files (AI, EPS, PDF) or high-resolution raster files (PNG, JPG) at 300 DPI minimum. Vector files are preferred as they can be scaled without losing quality. For complex designs, we can work with various formats, but vector files ensure the crispest printing results. Our design team can also help optimize your artwork for the best printing outcome. Contact us if you have questions about file formats or need design assistance.",
    },
    {
      question: "Do you offer design services?",
      answer: "Yes, we offer professional design services to help bring your custom printing vision to life. Our experienced design team can create logos, graphics, and complete designs based on your ideas and brand guidelines. Design services are available for an additional fee, and we'll work closely with you to ensure the final design meets your expectations. Whether you need a simple logo placement or a complex, multi-color design, we're here to help. Contact us to discuss your design needs and receive a quote.",
    },
    {
      question: "What is the minimum order for custom printing?",
      answer: "Minimum order quantities vary by printing method. Screen printing typically requires a minimum of 12-24 pieces to be cost-effective, while sublimation and DTG printing can accommodate smaller orders starting from just 1 piece. Embroidery usually has a minimum of 6-12 pieces. However, we're flexible and can work with you on smaller orders - contact us to discuss your specific needs and we'll find a solution that works for your project and budget.",
    },
  ],
}

export default function FAQPage() {
  // Create FAQ schema for all questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Object.values(faqCategories).flat().map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">FAQ</span>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-[700px] text-lg leading-relaxed">
            Find comprehensive answers to common questions about our products, custom printing services, shipping, returns, and more. 
            Can't find what you're looking for? Our customer service team is here to help.
          </p>
        </div>

        {/* Introduction Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-primary">Welcome to Our Help Center</h2>
          </div>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              At MOTARRO Supplies, we're committed to providing exceptional customer service and making your shopping experience as smooth as possible. 
              Whether you're ordering custom printed t-shirts for your team, corporate uniforms for your business, or personalized apparel for a special event, 
              we want to ensure you have all the information you need to make informed decisions.
            </p>
            <p>
              Our FAQ section covers everything from placing orders and understanding our shipping options to custom printing services and return policies. 
              We've compiled answers to the most common questions we receive from customers across Johannesburg, Kempton Park, and throughout South Africa. 
              If you don't find the answer you're looking for, don't hesitate to reach out to our friendly customer service team.
            </p>
            <p>
              We understand that custom printing can be complex, especially if you're new to the process. That's why we've included detailed information 
              about our printing methods, file requirements, and production timelines. Our goal is to help you create exactly what you envision, 
              whether it's a simple logo on a t-shirt or a complex, multi-color design on premium apparel.
            </p>
          </div>
        </div>

        <Tabs defaultValue="ordering" className="space-y-8">
          <TabsList className="flex w-full overflow-x-auto gap-2 bg-transparent md:grid md:grid-cols-6">
            <TabsTrigger value="ordering" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ordering
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Shipping
            </TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Returns
            </TabsTrigger>
            <TabsTrigger value="sizing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sizing
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Account
            </TabsTrigger>
            <TabsTrigger value="printing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Printing
            </TabsTrigger>
          </TabsList>

          {Object.entries(faqCategories).map(([category, questions]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {questions.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg mb-2 border border-gray-200">
                    <AccordionTrigger className="text-left px-6 py-4 hover:no-underline">
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground px-6 pb-4 leading-relaxed">
                      {typeof faq.answer === 'string' ? faq.answer : String(faq.answer)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Can't find what you're looking for? Our customer service team is here to help. 
              Reach out through any of the channels below, and we'll get back to you promptly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <a href="mailto:motarrodotcoza@gmail.com" className="text-primary hover:underline text-sm">
                motarrodotcoza@gmail.com
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <a href="tel:0696228848" className="text-primary hover:underline text-sm">
                069 622 8848
              </a>
              <p className="text-xs text-muted-foreground mt-2">Mon-Fri, 9am-5pm</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <a href="https://wa.me/27696228848" className="text-primary hover:underline text-sm">
                +27 69 622 8848
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
