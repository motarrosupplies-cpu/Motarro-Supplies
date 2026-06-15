"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FlashSale {
  id: string
  title: string
  description: string
  banner_text: string
  banner_color: string
  starts_at: string
  ends_at: string
  discount_percent?: number
  discount_amount?: number
}

export function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    async function fetchFlashSale() {
      try {
        const response = await fetch('/api/ready-to-ship/flash-sale', {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setFlashSale(data)
          }
        }
      } catch (error) {
        console.error('Error fetching flash sale:', error)
      }
    }

    fetchFlashSale()
    const interval = setInterval(fetchFlashSale, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!flashSale) return

    function updateTimer() {
      const now = new Date().getTime()
      const end = new Date(flashSale.ends_at).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeRemaining("")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [flashSale])

  if (!flashSale || !isVisible) return null

  const bannerColor = flashSale.banner_color || '#8B5CF6'

  return (
    <div 
      className="relative w-full py-3 px-4 text-white text-center text-sm font-medium"
      style={{ backgroundColor: bannerColor }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2 relative">
        <Zap className="w-4 h-4 animate-pulse" />
        <span className="flex-1">
          {flashSale.banner_text || flashSale.title}
          {timeRemaining && (
            <span className="ml-2 font-bold">
              • Ends in {timeRemaining}
            </span>
          )}
        </span>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-auto py-1 px-2"
        >
          <Link href="/ready-to-ship?flashSale=true">
            Shop Now →
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-auto py-1 px-1 ml-2"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

