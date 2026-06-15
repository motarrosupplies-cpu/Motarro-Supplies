/**
 * Product Schema Component
 * JSON-LD structured data for product pages
 */

import { Product } from "@/types/product";

interface ProductSchemaProps {
  product: Product;
  baseUrl?: string;
  availability?: string;
  condition?: string;
  reviews?: {
    rating: number;
    count: number;
  };
}

export function ProductSchema({
  product,
  baseUrl = "https://www.motarro.co.za",
  availability = "https://schema.org/InStock",
  condition = "https://schema.org/NewCondition",
  reviews
}: ProductSchemaProps) {
  // Parse images
  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images.filter(Boolean);
  } else if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
    } catch {
      images = [product.images].filter(Boolean);
    }
  }
  if (images.length === 0 && product.image) {
    images.push(product.image);
  }

  // Build product schema
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Custom printed apparel from MOTARRO Supplies`,
    "image": images,
    "sku": (product as any).sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "MOTARRO Supplies"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${(product as any).seo_slug || product.id}`,
      "priceCurrency": "ZAR",
      "price": Number(product.price).toFixed(2),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": availability,
      "itemCondition": condition,
      "seller": {
        "@type": "Organization",
        "name": "MOTARRO Supplies"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "ZAR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "ZA"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "businessDays": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "https://schema.org/Monday",
              "https://schema.org/Tuesday",
              "https://schema.org/Wednesday",
              "https://schema.org/Thursday",
              "https://schema.org/Friday"
            ]
          },
          "cutoffTime": "14:00",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 5,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  // Add aggregate rating if reviews provided
  if (reviews && reviews.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviews.rating,
      "reviewCount": reviews.count,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Add additional properties if available
  if ((product as any).details) {
    const details = (product as any).details;
    if (details.material) {
      schema.material = details.material;
    }
    if (details.care) {
      schema.additionalProperty = [
        {
          "@type": "PropertyValue",
          "name": "Care Instructions",
          "value": details.care
        }
      ];
    }
  }

  // Add color/size options if available
  if ((product as any).hasColorOptions || (product as any).colors) {
    const colors = (product as any).colors || [];
    if (Array.isArray(colors) && colors.length > 0) {
      schema.color = colors.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
    }
  }

  if ((product as any).hasSizeOptions || (product as any).sizes) {
    const sizes = (product as any).sizes || [];
    if (Array.isArray(sizes) && sizes.length > 0) {
      schema.size = sizes.join(', ');
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

