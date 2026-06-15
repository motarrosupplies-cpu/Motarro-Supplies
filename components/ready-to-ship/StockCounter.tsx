"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface StockCounterProps {
  productId: string
  initialStock?: number
  lowStockThreshold?: number
  className?: string
}

export function StockCounter({ 
  productId, 
  initialStock = 0,
  lowStockThreshold = 10,
  className 
}: StockCounterProps) {
  const [stock, setStock] = useState(initialStock)
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchStock() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/ready-to-ship/stock/${productId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setStock(data.stockQuantity || 0)
          setStockStatus(data.stockStatus || 'in_stock')
        }
      } catch (error) {
        console.error('Error fetching stock:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStock()
    
    // Poll for stock updates every 30 seconds
    const interval = setInterval(fetchStock, 30000)

    return () => clearInterval(interval)
  }, [productId])

  const getStockDisplay = () => {
    if (stockStatus === 'out_of_stock') {
      return {
        text: 'Out of Stock',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    }
    
    if (stockStatus === 'low_stock') {
      return {
        text: `Only ${stock} left!`,
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    }

    return {
      text: `${stock} in stock`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  }

  const display = getStockDisplay()
  const Icon = display.icon

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
      display.bgColor,
      display.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{display.text}</span>
      {isLoading && (
        <span className="ml-1 animate-pulse">...</span>
      )}
    </div>
  )
}

