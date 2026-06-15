/**
 * Comprehensive Schema.org JSON-LD Component
 * Reusable component for all schema types
 */

import Script from 'next/script';
import { MOTARRO_LOGO_URL } from '@/lib/brand';

const BASE_URL = 'https://www.motarro.co.za';

// ============================================================================
// ORGANIZATION SCHEMA
// ============================================================================
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MOTARRO Supplies",
    "alternateName": "MOTARRO Supplies Stationery",
    "url": BASE_URL,
    "logo": MOTARRO_LOGO_URL,
    "description": "Premium stationery, craft supplies, and educational materials for South Africa. Plastic, paper, wooden, metal, acrylic, art supplies, foam craft, and tiles — delivered nationwide in ZAR.",
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kempton Park",
      "addressLocality": "Kempton Park",
      "addressRegion": "Gauteng",
      "postalCode": "1619",
      "addressCountry": "ZA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+27-69-622-8848",
      "contactType": "Customer Service",
      "email": "motarrodotcoza@gmail.com",
      "availableLanguage": ["English", "Afrikaans"],
      "areaServed": "ZA"
    },
    "sameAs": [
      `${BASE_URL}/go/facebook`,
      `${BASE_URL}/go/instagram`,
      `${BASE_URL}/go/linkedin`,
      `${BASE_URL}/go/x`,
      `${BASE_URL}/go/etsy`
    ],
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    }
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// LOCAL BUSINESS SCHEMA
// ============================================================================
interface LocalBusinessSchemaProps {
  name?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  phone?: string;
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  rating?: {
    value: number;
    count: number;
  };
}

export function LocalBusinessSchema({
  name = "MOTARRO Supplies",
  address = {
    streetAddress: "Kempton Park",
    addressLocality: "Kempton Park",
    addressRegion: "Gauteng",
    postalCode: "1619",
    addressCountry: "ZA"
  },
  phone = "+27-69-622-8848",
  priceRange = "$$",
  openingHours = [
    "Mo-Su 00:00-23:59"
  ],
  geo = {
    latitude: -26.1087,
    longitude: 28.2333
  },
  rating
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "image": MOTARRO_LOGO_URL,
    "url": BASE_URL,
    "telephone": phone,
    "priceRange": priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress || "Kempton Park",
      "addressLocality": address.addressLocality || "Kempton Park",
      "addressRegion": address.addressRegion || "Gauteng",
      "postalCode": address.postalCode || "1619",
      "addressCountry": address.addressCountry || "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": geo.latitude,
      "longitude": geo.longitude
    },
    "openingHoursSpecification": openingHours.map(hours => {
      // Parse "Mo-Su 00:00-23:59" format
      const [days, time] = hours.split(' ');
      const [open, close] = time.split('-');
      
      let dayOfWeek: string[] = [];
      if (days.includes('-')) {
        const [start, end] = days.split('-');
        const dayMap: Record<string, string> = {
          'Mo': 'Monday',
          'Tu': 'Tuesday',
          'We': 'Wednesday',
          'Th': 'Thursday',
          'Fr': 'Friday',
          'Sa': 'Saturday',
          'Su': 'Sunday'
        };
        const startDay = dayMap[start] || start;
        const endDay = dayMap[end] || end;
        dayOfWeek = [startDay, endDay];
      } else {
        dayOfWeek = [days];
      }
      
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": dayOfWeek,
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
        "@type": "City",
        "name": "Sandton"
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
    },
    ...(rating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating.value.toString(),
        "reviewCount": rating.count.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Sarah M."
          },
          "reviewBody": "Excellent quality custom t-shirts, fast delivery in Johannesburg!"
        }
      ]
    } : {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Sarah M."
          },
          "reviewBody": "Excellent quality custom t-shirts, fast delivery in Johannesburg!"
        }
      ]
    })
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbSchema({
  items,
  baseUrl = BASE_URL
}: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// PRODUCT SCHEMA
// ============================================================================
interface ProductSchemaProps {
  product: {
    name: string;
    description?: string;
    image?: string | string[];
    sku?: string;
    id: string;
    price: number;
    category?: string;
    availability?: string;
    condition?: string;
    brand?: string;
    aggregateRating?: {
      ratingValue: string;
      reviewCount: string;
    };
    review?: Array<{
      author: string;
      ratingValue: string;
      reviewBody: string;
    }>;
    offers?: {
      price: number;
      priceCurrency: string;
      availability: string;
      url: string;
    };
  };
  baseUrl?: string;
}

interface ProductSchemaComponentProps extends ProductSchemaProps {
  productUrl?: string;
}

export function ProductSchema({
  product,
  baseUrl = BASE_URL,
  productUrl: productUrlOverride,
}: ProductSchemaComponentProps) {
  // Normalize images
  let images: string[] = [];
  if (Array.isArray(product.image)) {
    images = product.image.filter(Boolean);
  } else if (product.image) {
    images = [product.image];
  }

  const productSlug = (product as any).slug || (product as any).seoSlug || product.id;
  const productUrl = productUrlOverride
    ? productUrlOverride.startsWith("http")
      ? productUrlOverride
      : `${baseUrl}${productUrlOverride}`
    : `${baseUrl}/products/${productSlug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} — stationery and craft supplies from MOTARRO Supplies`,
    "image": images.length > 0 ? images : undefined,
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "MOTARRO Supplies"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": product.offers?.priceCurrency || "ZAR",
      "price": product.offers?.price || product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.offers?.availability || product.availability || "https://schema.org/InStock",
      "itemCondition": product.condition || "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "MOTARRO Supplies"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "ZA"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
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

  // Add aggregate rating if provided
  if (product.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.aggregateRating.ratingValue,
      "reviewCount": product.aggregateRating.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add reviews if provided
  if (product.review && product.review.length > 0) {
    schema.review = product.review.map((r: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.ratingValue,
        "bestRating": "5"
      },
      "reviewBody": r.reviewBody
    }));
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// WEBSITE SCHEMA
// ============================================================================
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MOTARRO Supplies",
    "url": BASE_URL,
    "description": "Premium stationery, craft supplies, and educational materials for South Africa. Delivered nationwide in ZAR.",
    "publisher": {
      "@type": "Organization",
      "name": "MOTARRO Supplies",
      "logo": {
        "@type": "ImageObject",
        "url": MOTARRO_LOGO_URL
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// COLLECTION PAGE SCHEMA
// ============================================================================
interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  items?: Array<{
    name: string;
    url: string;
    image?: string;
    description?: string;
    price?: number;
    priceCurrency?: string;
    availability?: string;
  }>;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  items = []
}: CollectionPageSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`
  };

  if (items.length > 0) {
    schema.mainEntity = {
      "@type": "ItemList",
      "itemListElement": items.map((item, index) => {
        const itemUrl = item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`;
        const productItem: any = {
          "@type": "Product",
          "name": item.name,
          "description": item.description || item.name,
          "url": itemUrl,
          "image": item.image,
          "brand": {
            "@type": "Brand",
            "name": "MOTARRO Supplies"
          },
          // Required: Product schema must have offers, review, or aggregateRating
          "offers": {
            "@type": "Offer",
            "url": itemUrl,
            "priceCurrency": item.priceCurrency || "ZAR",
            "price": item.price ? Number(item.price).toFixed(2) : "0.00",
            "availability": item.availability || "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "name": "MOTARRO Supplies"
            },
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          }
        };
        
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": productItem
        };
      })
    };
  }

  return (
    <Script
      id="collection-page-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// ARTICLE SCHEMA (for blog posts)
// ============================================================================
interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher = {
    name: "MOTARRO Supplies",
    logo: MOTARRO_LOGO_URL
  },
  url
}: ArticleSchemaProps) {
  const images = Array.isArray(image) ? image : (image ? [image] : []);

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "image": images.length > 0 ? images : undefined,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author.name,
      ...(author.url && { "url": author.url })
    },
    "publisher": {
      "@type": "Organization",
      "name": publisher.name,
      "logo": {
        "@type": "ImageObject",
        "url": publisher.logo
      }
    },
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url.startsWith('http') ? url : `${BASE_URL}${url}`
    }
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// WEBPAGE SCHEMA
// ============================================================================
interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
  breadcrumb?: BreadcrumbItem[];
}

export function WebPageSchema({
  name,
  description,
  url,
  breadcrumb
}: WebPageSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`,
    "inLanguage": "en-ZA",
    "isPartOf": {
      "@type": "WebSite",
      "name": "MOTARRO Supplies",
      "url": BASE_URL
    }
  };

  if (breadcrumb && breadcrumb.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
      }))
    };
  }

  return (
    <Script
      id="webpage-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// FAQ PAGE SCHEMA
// ============================================================================
interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQPageSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Script
      id="faq-page-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// COMPARISON TABLE SCHEMA
// ============================================================================
interface ComparisonTableSchemaProps {
  name: string;
  items: Array<{
    name: string;
    properties: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export function ComparisonTableSchema({ name, items }: ComparisonTableSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Table",
    "about": name,
    "table": {
      "@type": "Table",
      "name": name,
      "tableRow": items.map(item => ({
        "@type": "TableRow",
        "name": item.name,
        "properties": item.properties.map(prop => ({
          "@type": "PropertyValue",
          "name": prop.name,
          "value": prop.value
        }))
      }))
    }
  };

  return (
    <Script
      id="comparison-table-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// HOWTO SCHEMA
// ============================================================================
interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  tool?: string[];
  supply?: string[];
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  tool,
  supply
}: HowToSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
      ...(step.url && { "url": step.url })
    }))
  };

  if (totalTime) {
    schema.totalTime = totalTime;
  }

  if (tool && tool.length > 0) {
    schema.tool = tool.map(t => ({
      "@type": "HowToTool",
      "name": t
    }));
  }

  if (supply && supply.length > 0) {
    schema.supply = supply.map(s => ({
      "@type": "HowToSupply",
      "name": s
    }));
  }

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// SERVICE SCHEMA
// ============================================================================
interface ServiceSchemaProps {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: Array<{
    name: string;
    type: string;
  }>;
  serviceType?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

export function ServiceSchema({
  name,
  description,
  provider,
  areaServed,
  serviceType,
  offers
}: ServiceSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider.name,
      "url": provider.url
    }
  };

  if (serviceType) {
    schema.serviceType = serviceType;
  }

  if (areaServed && areaServed.length > 0) {
    schema.areaServed = areaServed.map(area => ({
      "@type": area.type === "City" ? "City" : "State",
      "name": area.name
    }));
  }

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      ...(offers.price && { "price": offers.price }),
      ...(offers.priceCurrency && { "priceCurrency": offers.priceCurrency }),
      ...(offers.availability && { "availability": offers.availability })
    };
  }

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// REVIEW SCHEMA
// ============================================================================
interface ReviewSchemaProps {
  reviews: Array<{
    "@type": "Review";
    author: {
      "@type": "Person";
      name: string;
    };
    reviewRating: {
      "@type": "Rating";
      ratingValue: string;
      bestRating: string;
    };
    reviewBody: string;
    itemReviewed?: {
      "@type": "Service" | "Product";
      name: string;
    };
  }>;
  /** When set (e.g. from Google Places), use Google’s aggregate rating and total count instead of averaging the sample */
  aggregateRating?: {
    ratingValue: string;
    reviewCount: string;
  };
}

export function ReviewSchema({ reviews, aggregateRating }: ReviewSchemaProps) {
  if (!reviews || reviews.length === 0) return null;

  const ratings = reviews.map((r) => parseFloat(r.reviewRating.ratingValue));
  const averageFromSample = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  const averageRating = aggregateRating?.ratingValue ?? averageFromSample;
  const reviewCount = aggregateRating?.reviewCount ?? reviews.length.toString();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MOTARRO Supplies",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews
  };

  return (
    <Script
      id="review-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// VIDEO OBJECT SCHEMA
// ============================================================================
interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl?: string;
}

export function VideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  uploadDate,
  duration,
  embedUrl
}: VideoObjectSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "duration": duration,
    "contentUrl": contentUrl,
    "embedUrl": embedUrl || contentUrl,
    "publisher": {
      "@type": "Organization",
      "name": "MOTARRO Supplies",
      "logo": {
        "@type": "ImageObject",
        "url": MOTARRO_LOGO_URL
      }
    }
  };

  return (
    <Script
      id={`video-schema-${name.replace(/\s+/g, '-').toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

