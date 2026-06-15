"use client"

import { CollapsibleContent } from "./collapsible-content"
import { MOTARRO_BRAND_NAME } from "@/lib/brand"

interface SEOContentProps {
  category: string
  features: Array<{
    title: string
    description: string
  }>
  bottomText: string
  className?: string
  /** Override accordion title (defaults to stationery-focused MOTARRO copy). */
  title?: string
  /** Override intro paragraph. */
  intro?: string
}

export function SEOContent({
  category,
  features,
  bottomText,
  className = "",
  title,
  intro,
}: SEOContentProps) {
  const accordionTitle =
    title ?? `About ${category} — Stationery & Craft Supplies in South Africa`

  const introText =
    intro ??
    `Explore our ${category.toLowerCase()} at ${MOTARRO_BRAND_NAME} — quality stationery, craft materials, and educational supplies for schools, offices, and creative projects across South Africa. All prices in ZAR with nationwide delivery.`

  return (
    <div className={`mt-8 w-full ${className}`}>
      <CollapsibleContent title={accordionTitle}>
        <div className="space-y-4 w-full">
          <p className="text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
            {introText}
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg break-words overflow-wrap-anywhere"
              >
                <h4 className="text-sm font-semibold mb-2 text-primary break-words">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground break-words overflow-wrap-anywhere">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 break-words overflow-wrap-anywhere">
            <p className="text-sm text-muted-foreground break-words overflow-wrap-anywhere">
              {bottomText}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </div>
  )
}
