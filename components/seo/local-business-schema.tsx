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
      "name": "Stationery & Craft Supplies",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Plastic Stationery",
            "description": "Plastic organisers, stationery, and craft components"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Paper & Stationery",
            "description": "Paper products and everyday stationery essentials"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Art Supplies",
            "description": "Crayons, clay, paint, chalk, and creative art materials"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Craft Materials",
            "description": "Wooden, metal, acrylic, foam craft, and tile supplies"
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

