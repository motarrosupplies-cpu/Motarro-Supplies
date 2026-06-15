"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Truck, ShieldCheck, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { buildCartItemKey } from "@/lib/cart/keys"
import { getKevroLineBreakdown } from "@/lib/cart/kevro-breakdown"
import { CartTotalsSummary } from "@/components/cart/CartTotalsSummary"
import { formatCurrency } from "@/lib/utils"
import { PRICE_ITEM_LABEL } from "@/components/pricing/PriceBreakdown"
import { Product } from "@/types/product"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [remainingForFreeDelivery, setRemainingForFreeDelivery] = useState(0)
  const FREE_DELIVERY_THRESHOLD = 1000

  useEffect(() => {
    const total = getCartTotal()
    const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total)
    setRemainingForFreeDelivery(remaining)
  }, [items, getCartTotal])

  if (items.length === 0) {
    return (
      <>
        <div className="container px-4 py-12 mx-auto text-center bg-lavender">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-4">Add some products to your cart to see them here.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container px-4 py-12 mx-auto bg-lavender">
      {/* Free Delivery Banner */}
      {remainingForFreeDelivery > 0 && remainingForFreeDelivery < FREE_DELIVERY_THRESHOLD && (
        <div className="sticky top-20 z-10 mb-6 bg-primary text-white p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span className="font-semibold">
                You&apos;re R{remainingForFreeDelivery.toFixed(2)} away from FREE delivery! 🚚
              </span>
            </div>
            <Link href="/products">
              <Button variant="secondary" size="sm" className="rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-white rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="font-medium">Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Lock className="w-5 h-5 text-blue-600" />
          <span className="font-medium">100% Safe</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="font-medium">Quality Guaranteed</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            // Build the correct key for cart operations
            const itemKey = buildCartItemKey(item);
            const breakdown = getKevroLineBreakdown(item);
            const lineTotal = breakdown
              ? breakdown.totalInclVat
              : (item.price || 0) * (item.quantity || 1);

            return (
              <div key={itemKey} className="flex gap-4 bg-white p-4 rounded-2xl">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name || 'Product'}
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name || 'Product'}</h3>
                  {item.category && (
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  )}
                  {breakdown && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                      {breakdown.brandingLabel && (
                        <p className="font-medium text-slate-700">{breakdown.brandingLabel}</p>
                      )}
                      <p>{PRICE_ITEM_LABEL}: {formatCurrency(breakdown.garmentTotal)}</p>
                      {breakdown.brandingTotal > 0 && (
                        <p>Branding: {formatCurrency(breakdown.brandingTotal)}</p>
                      )}
                      {breakdown.setupFee > 0 && (
                        <p>Setup fee: {formatCurrency(breakdown.setupFee)}</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <p className="font-medium">{formatCurrency(lineTotal)}</p>
                    {breakdown && (
                      <span className="text-xs text-muted-foreground">incl. VAT</span>
                    )}
                    {item.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        R{item.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  {item.customPrinting && item.customPrinting.designs && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Uploaded Designs:</p>
                      <div className="flex gap-2 mt-1">
                        {item.customPrinting.designs.map((design, index) => (
                          <div key={index} className="relative w-8 h-8">
                            <Image
                              src={design.url || '/placeholder.svg'}
                              alt={design.filename || 'Design'}
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      {item.customPrinting.instructions && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Special Instructions:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.customPrinting.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => updateQuantity(itemKey, Math.max(1, (item.quantity || 1) - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity || 1}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeFromCart(itemKey)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <CartTotalsSummary showShippingNote freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD} />
          <div className="flex justify-between text-sm mt-4">
            <span>Shipping</span>
            <span className={getCartTotal() >= FREE_DELIVERY_THRESHOLD ? "font-bold text-green-600" : ""}>
              {getCartTotal() >= FREE_DELIVERY_THRESHOLD ? "FREE" : "Calculated at checkout"}
            </span>
          </div>
          <Button asChild className="w-full mt-6 rounded-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
      </div>
    </>
  )
}

