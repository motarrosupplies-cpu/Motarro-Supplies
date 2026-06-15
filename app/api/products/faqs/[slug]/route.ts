/**
 * API Route: Get FAQs for a product by slug
 * Returns FAQs from product-faqs.json
 */

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FAQ {
  question: string;
  answer: string;
}

interface ProductFAQ {
  slug: string;
  title: string;
  faqs: FAQ[];
}

let faqsCache: ProductFAQ[] | null = null;

function loadProductFAQs(): ProductFAQ[] {
  if (faqsCache) {
    return faqsCache;
  }

  try {
    const faqsPath = path.join(process.cwd(), 'product-faqs.json');
    
    if (!fs.existsSync(faqsPath)) {
      console.warn('product-faqs.json not found');
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

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    const allFAQs = loadProductFAQs();
    const productFAQ = allFAQs.find(faq => faq.slug === slug);

    if (!productFAQ || !productFAQ.faqs || productFAQ.faqs.length === 0) {
      return NextResponse.json({ faqs: [] });
    }

    return NextResponse.json({ faqs: productFAQ.faqs });
  } catch (error) {
    console.error('Error fetching product FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

