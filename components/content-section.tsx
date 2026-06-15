import { ReactNode } from "react"

interface ContentSectionProps {
  title: string
  description: string
  features: Array<{
    title: string
    description: string
  }>
  bottomText: string
  className?: string
}

export function ContentSection({ 
  title, 
  description, 
  features, 
  bottomText, 
  className = "" 
}: ContentSectionProps) {
  return (
    <div className={`mb-8 bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-4 bg-primary/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-primary">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {bottomText}
        </p>
      </div>
    </div>
  )
}
