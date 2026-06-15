'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const POPUP_DELAY = 30000
const STORAGE_KEY = 'email_capture_dismissed'
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE || 'REPLACE_WITH_YOUR_SITE_KEY'

export function EmailCapturePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const hasShownRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.grecaptcha) {
      window.grecaptcha.ready(() => setRecaptchaLoaded(true))
    }
  }, [isOpen])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10)
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) {
          return
        }
      }
    }

    timerRef.current = setTimeout(() => {
      if (!hasShownRef.current) {
        setIsOpen(true)
        hasShownRef.current = true
      }
    }, POPUP_DELAY)

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownRef.current) {
        setIsOpen(true)
        hasShownRef.current = true
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || honeypot) return

    setIsSubmitting(true)
    try {
      let recaptchaToken = ''
      if (
        recaptchaLoaded &&
        window.grecaptcha &&
        recaptchaSiteKey !== 'REPLACE_WITH_YOUR_SITE_KEY'
      ) {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
          action: 'newsletter_subscribe',
        })
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'popup',
          'g-recaptcha-response': recaptchaToken,
          'website-url': honeypot,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSubmitted(true)

      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (error: unknown) {
      console.error('Error submitting email:', error)
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {recaptchaSiteKey !== 'REPLACE_WITH_YOUR_SITE_KEY' && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
          onLoad={() => {
            window.grecaptcha?.ready(() => setRecaptchaLoaded(true))
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-primary/5 to-purple-50 border-2 border-primary/20">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <DialogTitle className="text-2xl font-black text-primary">
                Get 10% Off
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-700 pt-2">
              Join our newsletter to get exclusive discounts and early access to new products.
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-700">Thank you! Check your email for your discount code.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <input
                type="text"
                name="website-url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? 'Submitting...' : 'Get My Discount'}
              </Button>
              <p className="text-xs text-center text-slate-500">
                By subscribing, you agree to our privacy policy. Unsubscribe anytime.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
