/**
 * Organization Schema Component
 * JSON-LD structured data for MOTARRO Supplies business
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MOTARRO Supplies",
    "url": "https://www.motarro.co.za",
    "logo": "https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/LOGO.PNG",
    "description": "Custom printed apparel, t-shirts, hoodies, and accessories in South Africa. Serving Johannesburg, Kempton Park, and nationwide with high-quality custom printing services.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA",
      "addressLocality": "Johannesburg",
      "addressRegion": "Gauteng"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+27-69-622-8848",
      "email": "info@www.motarro.co.za",
      "availableLanguage": ["en", "af"]
    },
    "sameAs": [
      "https://www.motarro.co.za/go/facebook",
      "https://www.motarro.co.za/go/instagram",
      "https://www.motarro.co.za/go/linkedin",
      "https://www.motarro.co.za/go/x",
      "https://www.motarro.co.za/go/etsy"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

