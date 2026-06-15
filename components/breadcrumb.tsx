import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://www.motarro.co.za${item.href}`
    }))
  }

  // Enhanced breadcrumb labels with SEO keywords
  const enhancedItems = items.map((item, index) => {
    let enhancedLabel = item.label
    
    // Add SEO-friendly descriptions to breadcrumbs
    if (item.href === '/products') enhancedLabel = 'All Stationery & Craft Products'
    if (item.href === '/sale') enhancedLabel = 'Sale — Stationery & Craft Supplies'
    if (item.href.startsWith('/shop/')) {
      const slug = item.href.replace('/shop/', '').split('?')[0]
      if (slug === 'plastic') enhancedLabel = 'Plastic Stationery'
      if (slug === 'paper') enhancedLabel = 'Paper & Stationery'
      if (slug === 'art-supplies') enhancedLabel = 'Art Supplies'
    }
    
    return { ...item, label: enhancedLabel }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          {enhancedItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {index === enhancedItems.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-gray-500 hover:text-gray-700">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
} 