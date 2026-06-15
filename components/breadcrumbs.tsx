/**
 * Breadcrumb Navigation Component with Schema
 * Provides both visual breadcrumbs and JSON-LD structured data
 */

'use client'

import { BreadcrumbSchema } from '@/components/seo/schema-org'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-1 text-sm text-muted-foreground mb-6 ${className}`}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            )}
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.name}</span>
            ) : (
              <Link 
                href={item.url} 
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}

