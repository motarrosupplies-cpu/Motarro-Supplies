"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Product, ProductVariant } from "@/types/product"
import { trackMetaAddToCart } from "@/lib/meta-pixel"
import type { KevroCartMetadata } from "@/types/kevro"
import type { TitanJetCartMetadata } from "@/types/titan-jet"
import { buildCartItemKey } from "@/lib/cart/keys"
import { getCartTotals, type CartTotals } from "@/lib/cart/kevro-breakdown"

interface CartItem extends Product {
  variantId?: string
  selectedSize?: string
  selectedColor?: string
  quantity: number
  customPrinting?: unknown
  kevro?: KevroCartMetadata
  titanJet?: TitanJetCartMetadata
}

interface CartContextType {
  items: CartItem[]
  cartItemCount: number
  addToCart: (product: CartItem) => void
  removeFromCart: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  getCartTotal: () => number
  getCartTotals: () => CartTotals
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function clampToStock(desired: number, variant?: ProductVariant, fallbackStock?: number) {
  const stockCap = variant ? variant.stockAvailable : (fallbackStock ?? 0)
  return Math.max(0, Math.min(desired, stockCap))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const cartItemCount = items.reduce((total, item) => total + (item.quantity || 1), 0)

  const addToCart = (product: CartItem) => {
    setItems((prevItems) => {
      const key = buildCartItemKey(product)
      const existing = prevItems.find(i => buildCartItemKey(i) === key)

      // Find the matching variant for stock enforcement
      const variant = product.variants?.find(v => v.id === product.variantId)
      const baseQty = existing?.quantity ?? 0
      const desired = baseQty + (product.quantity || 1)
      const capped =
        product.kevro || product.titanJet
          ? Math.max(0, Math.min(desired, product.stock ?? 0))
          : clampToStock(desired, variant, product.stock)

      if (existing) {
        return prevItems.map(i => buildCartItemKey(i) === key ? { ...i, quantity: capped } : i)
      }

      const initialQty =
        product.kevro || product.titanJet
          ? Math.max(0, Math.min(product.quantity || 1, product.stock ?? 0))
          : clampToStock(product.quantity || 1, variant, product.stock)
      return [...prevItems, { ...product, quantity: initialQty }]
    })

    trackMetaAddToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: product.quantity || 1,
    })

    // Open the cart glance (right sheet) after adding.
    setIsCartOpen(true)
  }

  const removeFromCart = (key: string) => {
    setItems((prevItems) => prevItems.filter((item) => buildCartItemKey(item) !== key))
  }

  const updateQuantity = (key: string, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (buildCartItemKey(item) !== key) return item
        const variant = item.variants?.find(v => v.id === item.variantId)
        const capped =
          item.kevro || item.titanJet
            ? Math.max(1, Math.min(safeQuantity, item.stock ?? safeQuantity))
            : Math.max(1, clampToStock(safeQuantity, variant, item.stock))
        return { ...item, quantity: capped }
      })
    )
  }

  const getCartTotalsSummary = () => getCartTotals(items)

  const getCartTotal = () => getCartTotalsSummary().totalInclVat

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        cartItemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartTotals: getCartTotalsSummary,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

