/**
 * LocalBusiness Schema Component
 * JSON-LD structured data for local SEO (Johannesburg focus)
 */

interface LocalBusinessSchemaProps {
  name?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  priceRange?: string;
  openingHours?: string[];
  rating?: {
    value: number;
    count: number;
  };
}

export function LocalBusinessSchema({
  name = "MOTARRO Supplies",
  address = {
    city: "Johannesburg",
    region: "Gauteng",
    postalCode: "2000",
    country: "ZA"
  },
  phone = "+27-69-622-8848",
  priceRange = "$$",
  openingHours = [
    "Mo-Fr 08:00-17:00",
    "Sa 09:00-13:00"
  ],
  rating
}: LocalBusinessSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "image": "https://www.motarro.co.za/logo.png",
    "url": "https://www.motarro.co.za",
    "telephone": phone,
    "priceRange": priceRange,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": address.city,
      "addressRegion": address.region,
      "postalCode": address.postalCode,
      "addressCountry": address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -26.2041,
      "longitude": 28.0473
    },
    "openingHoursSpecification": openingHours.map(hours => {
      const [days, time] = hours.split(' ');
      const [open, close] = time.split('-');
      const [dayStart, dayEnd] = days.includes('-') 
        ? days.split('-') 
        : [days, days];
      
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": dayEnd ? [
          `https://schema.org/${dayStart}`,
          `https://schema.org/${dayEnd}`
        ] : `https://schema.org/${dayStart}`,
        "opens": open,
        "closes": close
      };
    }),
    "areaServed": [
      {
        "@type": "City",
        "name": "Johannesburg"
      },
      {
        "@type": "City",
        "name": "Kempton Park"
      },
      {
        "@type": "City",
        "name": "Randburg"
      },
      {
        "@type": "Country",
        "name": "South Africa"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Custom Apparel & Printing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom T-Shirt Printing",
            "description": "Professional custom t-shirt printing services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Hoodie Printing",
            "description": "Professional custom hoodie printing services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sublimation Printing",
            "description": "High-quality sublimation printing for vibrant, durable designs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Screen Printing",
            "description": "Cost-effective screen printing for bulk orders"
          }
        }
      ]
    }
  };

  if (rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.value,
      "reviewCount": rating.count
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

