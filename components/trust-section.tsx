'use client'

import { Star, Truck, ShieldCheck, CreditCard } from 'lucide-react'
import { PaymentMethodBadges } from '@/components/payment-method-badges'

export function TrustSection() {
  const trustItems = [
    {
      icon: <Star className="w-6 h-6 text-amber-500 fill-current" />,
      text: 'Quality Stationery & Craft Supplies',
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      text: 'Nationwide Delivery in South Africa',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      text: '1,000+ Products in Catalogue',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      text: 'Secure Payments in Rands (ZAR)',
    },
  ]

  return (
    <section className="py-8 bg-white border-y border-slate-200">
      <div className="container mx-auto px-4">
        {/* Trust Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-lavender/30 hover:bg-lavender/50 transition-colors"
            >
              <div className="flex items-center justify-center">{item.icon}</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">{item.text}</p>
            </div>
          ))}
        </div>

        <PaymentMethodBadges
          className="pt-4 border-t border-slate-200"
          label="Secure Payments:"
          highlightGooglePay
        />
      </div>
    </section>
  )
}

