/**
 * Product FAQs Utility
 * Loads FAQs from the generated JSON file
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProductFAQ {
  slug: string;
  title: string;
  faqs: FAQ[];
}

let faqsCache: ProductFAQ[] | null = null;

/**
 * Load FAQs from JSON file (server-side only)
 */
export function loadProductFAQs(): ProductFAQ[] {
  if (faqsCache) {
    return faqsCache;
  }

  try {
    const faqsPath = path.join(process.cwd(), 'product-faqs.json');
    
    if (!fs.existsSync(faqsPath)) {
      console.warn('product-faqs.json not found, returning empty array');
      return [];
    }

    const fileContent = fs.readFileSync(faqsPath, 'utf-8');
    const faqs = JSON.parse(fileContent) as ProductFAQ[];
    
    faqsCache = faqs;
    return faqs;
  } catch (error) {
    console.error('Error loading product FAQs:', error);
    return [];
  }
}

/**
 * Get FAQs for a specific product by slug
 */
export function getProductFAQs(slug: string): FAQ[] {
  const allFAQs = loadProductFAQs();
  const productFAQ = allFAQs.find(faq => faq.slug === slug);
  return productFAQ?.faqs || [];
}

/**
 * Generate FAQPage schema for a product
 */
export function generateFAQPageSchema(slug: string, baseUrl: string = 'https://www.motarro.co.za'): object | null {
  const faqs = getProductFAQs(slug);
  
  if (faqs.length === 0) {
    return null;
  }

  return {
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
}

