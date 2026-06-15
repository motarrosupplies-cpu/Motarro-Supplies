"use client"

import { useState, useMemo } from "react"
import { ShoppingBag, X, Plus, Minus, Tag, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { StockCounter } from "./StockCounter"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  currentPrice: number
  base_price: number
  primary_image: string
  stock_quantity: number
  low_stock_threshold: number
  stockStatus: string
}

interface BundleBuilderProps {
  products: Product[]
}

const BUNDLE_DISCOUNTS = {
  3: 0.10, // 10% off for 3 items
  4: 0.15, // 15% off for 4 items
  5: 0.20, // 20% off for 5 items
}

export function BundleBuilder({ products }: BundleBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { addToCart } = useCart()

  const bundleDiscount = useMemo(() => {
    const itemCount = selectedItems.length
    if (itemCount >= 5) return BUNDLE_DISCOUNTS[5]
    if (itemCount >= 4) return BUNDLE_DISCOUNTS[4]
    if (itemCount >= 3) return BUNDLE_DISCOUNTS[3]
    return 0
  }, [selectedItems.length])

  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedItems.includes(p.id))
  }, [products, selectedItems])

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.currentPrice, 0)
  }, [selectedProducts])

  const discountAmount = useMemo(() => {
    return subtotal * bundleDiscount
  }, [subtotal, bundleDiscount])

  const total = useMemo(() => {
    return subtotal - discountAmount
  }, [subtotal, discountAmount])

  const toggleItem = (productId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      }
      if (prev.length >= 5) {
        return prev // Max 5 items
      }
      return [...prev, productId]
    })
  }

  const addBundleToCart = () => {
    selectedProducts.forEach(product => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.currentPrice,
        image: product.primary_image || '',
        quantity: 1,
        slug: product.slug
      })
    })
    
    // Show success message
    alert(`Added ${selectedProducts.length} items to cart with ${(bundleDiscount * 100).toFixed(0)}% bundle discount!`)
    setSelectedItems([])
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Build Your Bundle - Save Up to 20%
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Select 3-5 items to unlock automatic bundle discounts
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Bundle Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Items Selected: {selectedItems.length} / 5
              </span>
              {bundleDiscount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round(bundleDiscount * 100)}% OFF
                </Badge>
              )}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(selectedItems.length / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3 items = 10% off</span>
              <span>4 items = 15% off</span>
              <span>5 items = 20% off</span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {products.slice(0, 10).map((product) => {
              const isSelected = selectedItems.includes(product.id)
              const isDisabled = !isSelected && selectedItems.length >= 5

              return (
                <div
                  key={product.id}
                  className={`
                    relative border-2 rounded-lg p-3 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : isDisabled
                      ? 'border-muted bg-muted/50 opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => !isDisabled && toggleItem(product.id)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {selectedItems.indexOf(product.id) + 1}
                    </div>
                  )}
                  
                  <div className="aspect-square relative mb-2 rounded-md overflow-hidden bg-muted">
                    {product.primary_image ? (
                      <Image
                        src={product.primary_image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-xs font-medium mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <p className="text-sm font-bold text-primary mb-1">
                    {formatCurrency(product.currentPrice)}
                  </p>
                  
                  <StockCounter
                    productId={product.id}
                    initialStock={product.stock_quantity}
                    lowStockThreshold={product.low_stock_threshold}
                    className="text-xs"
                  />
                </div>
              )
            })}
          </div>

          {/* Bundle Summary */}
          {selectedItems.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({selectedItems.length} items):</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Bundle Discount ({Math.round(bundleDiscount * 100)}%):
                  </span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              
              <Button 
                onClick={addBundleToCart}
                className="w-full"
                size="lg"
                disabled={selectedItems.length < 3}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add Bundle to Cart ({selectedItems.length} items)
              </Button>
              
              {selectedItems.length < 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  Select {3 - selectedItems.length} more item{3 - selectedItems.length !== 1 ? 's' : ''} to unlock bundle discount
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

