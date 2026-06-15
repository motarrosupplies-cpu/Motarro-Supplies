"use client"

import { CollapsibleContent } from "./collapsible-content"

interface SEOContentProps {
  category: string
  features: Array<{
    title: string
    description: string
  }>
  bottomText: string
  className?: string
}

export function SEOContent({ 
  category, 
  features, 
  bottomText, 
  className = "" 
}: SEOContentProps) {
  return (
    <div className={`mt-8 w-full ${className}`}>
      <CollapsibleContent title={`About ${category} - Custom Printed Apparel in South Africa`}>
        <div className="space-y-4 w-full">
          <p className="text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
            Discover our premium collection of {category.toLowerCase()} featuring high-quality custom printed apparel 
            and accessories. Our {category.toLowerCase()} are designed for comfort, style, and durability, perfect for 
            everyday wear and special occasions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg break-words overflow-wrap-anywhere">
                <h4 className="text-sm font-semibold mb-2 text-primary break-words">{feature.title}</h4>
                <p className="text-xs text-muted-foreground break-words overflow-wrap-anywhere">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 break-words overflow-wrap-anywhere">
            <p className="text-sm text-muted-foreground break-words overflow-wrap-anywhere">{bottomText}</p>
          </div>
        </div>
      </CollapsibleContent>
    </div>
  )
}
