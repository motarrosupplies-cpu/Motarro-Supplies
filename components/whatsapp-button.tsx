'use client'

import { MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'

const WHATSAPP_NUMBER = '27628533076'
const WHATSAPP_MESSAGE = "Hi! I'd like help with stationery and craft supplies from MOTARRO Supplies"

export function WhatsAppButton() {
  const pathname = usePathname()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [isAdminPage, setIsAdminPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin')
    }
    return false
  })
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  // Check if we're on admin pages - check both pathname and window.location for reliability
  useEffect(() => {
    const checkAdminPage = () => {
      const pathnameCheck = pathname?.startsWith('/admin')
      const windowCheck = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      const shouldHide = pathnameCheck || windowCheck || false
      setIsAdminPage(shouldHide)
    }
    
    // Check immediately
    checkAdminPage()
    
    // Also listen for route changes (for client-side navigation)
    const handleRouteChange = () => checkAdminPage()
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange)
      // Listen for Next.js route changes
      const originalPushState = history.pushState
      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        setTimeout(checkAdminPage, 0)
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChange)
      }
    }
  }, [pathname])

  // Hide on admin pages - return null
  if (isAdminPage) {
    return null
  }

  // Detect iPhone specifically (including Chrome on iPhone)
  const isIPhone = typeof window !== 'undefined' && 
    /iPhone|iPod/i.test(navigator.userAgent) &&
    !(window as any).MSStream // Exclude IE Mobile
  
  // Detect if mobile device (for desktop fallback)
  const isMobile = typeof window !== 'undefined' && (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )

  // CRITICAL FIX FOR iPhone (including Chrome on iPhone):
  // Use <a> tag with target="_self" for iPhone - this is more reliable than button onClick
  // iPhone browsers (Safari, Chrome) work better with direct link navigation
  const linkTarget = isIPhone ? '_self' : (isMobile ? '_self' : '_blank')

  return (
    <a
      ref={linkRef}
      href={whatsappUrl}
      target={linkTarget}
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[99999] flex items-center justify-center w-16 h-16 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 no-underline"
      style={{ 
        touchAction: 'manipulation', // Enables fast tap response on iOS
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto',
        position: 'fixed',
        zIndex: 99999,
        willChange: 'transform',
        isolation: 'isolate',
        textDecoration: 'none', // Remove underline
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label="Chat with us on WhatsApp"
      tabIndex={0}
    >
      <MessageCircle className="w-8 h-8 pointer-events-none" />
    </a>
  )
}

