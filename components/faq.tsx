interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
}

export function FAQ({ items }: FAQProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {item.question}
            </h3>
            <p className="text-gray-600">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </>
  )
} 