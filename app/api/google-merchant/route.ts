import { buildMerchantFeedProducts } from '@/lib/google-merchant/build-feed';
import {
  getAdditionalMerchantImageUrls,
  getPrimaryMerchantImageUrl,
  normalizeMerchantImageUrl,
} from '@/lib/google-merchant/images';
import type { MerchantFeedProduct } from '@/lib/google-merchant/kevro';
import { buildGmcShippingXml } from '@/lib/google-merchant/shipping';
import { availabilityToGmcText, resolveAvailability } from '@/lib/utils';

const FEED_VERSION = '5';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// XML escaping for text content
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'\"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// URL encode for image URLs (different from XML escaping)
function encodeImageUrl(url: string): string {
  if (!url) return '';
  try {
    // Use URL constructor to properly encode the URL
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    // If URL is invalid, return empty string
    return '';
  }
}

// Validate and format shipping weight
function formatShippingWeight(weight?: number | string | null): { value: string; unit: string } {
  let numWeight = 0.5; // Default
  
  if (weight !== null && weight !== undefined) {
    const parsed = typeof weight === 'string' ? parseFloat(weight) : Number(weight);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 9999.9) {
      numWeight = parsed;
    }
  }
  
  // Format to 1 decimal place
  return {
    value: numWeight.toFixed(1),
    unit: 'kg'
  };
}

// Get availability status (required field, must always be present)
// Uses the availability field from database if available, otherwise falls back to stock-based logic
function getAvailability(
  availability: string | null | undefined,
  stock: number | null | undefined
): string {
  // First, try to use the availability field from database
  if (availability) {
    try {
      // Use the utility function to convert database availability to GMC format
      const resolved = resolveAvailability(availability, Number(stock || 0));
      return availabilityToGmcText(resolved);
    } catch {
      // If conversion fails, fall through to stock-based logic
    }
  }
  
  // Fallback to stock-based logic if availability field is missing
  const stockNum = Number(stock);
  if (isNaN(stockNum) || stockNum <= 0) {
    return 'out of stock';
  }
  return 'in stock';
}

function productToXml(product: MerchantFeedProduct): string {
  const primaryImage = getPrimaryMerchantImageUrl(product);
  
  // Skip products without valid images (they'll cause errors)
  if (!primaryImage) {
    console.warn(`[GMC Feed] Skipping product ${product.id}: No valid image`);
    return ''; // Will be filtered out
  }
  
  const price = Number(product.price);
  if (!product.name?.trim() || !product.description?.trim() || Number.isNaN(price) || price <= 0) {
    console.warn(`[GMC Feed] Skipping product ${product.id}: Missing required fields (name, description, or price)`);
    return '';
  }

  const encodedImageUrl = encodeImageUrl(normalizeMerchantImageUrl(primaryImage));
  const additionalImages = getAdditionalMerchantImageUrls(product);
  const shippingWeight = formatShippingWeight();
  
  // Use availability field from database, with stock as fallback
  // CRITICAL: Always ensure availability is present
  const availability = getAvailability(
    product.availability,
    product.total_stock || product.stock
  );
  
  // Validate availability is not empty (should never happen, but safety check)
  if (!availability || availability.trim() === '') {
    console.error(`[GMC Feed] ERROR: Product ${product.id} has empty availability. Using fallback.`);
    // Force a fallback value
    const stockNum = Number(product.total_stock || product.stock || 0);
    const fallbackAvailability = stockNum > 0 ? 'in stock' : 'out of stock';
    console.warn(`[GMC Feed] Using fallback availability for product ${product.id}: ${fallbackAvailability}`);
  }
  
  const link = product.link;
  const title = (product.name || '').slice(0, 150);
  const googleCategory = product.google_product_category || '1604';

  let xml = `  <item>
    <g:id>${escapeXml(product.id)}</g:id>
    <g:title>${escapeXml(title)}</g:title>
    <g:description>${escapeXml(product.description || '')}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${encodedImageUrl}</g:image_link>`;
  
  // Add additional images if available
  if (additionalImages.length > 0) {
    additionalImages.forEach(img => {
      const encoded = encodeImageUrl(img);
      if (encoded) {
        xml += `\n    <g:additional_image_link>${encoded}</g:additional_image_link>`;
      }
    });
  }
  
  const formattedPrice = price.toFixed(2);
  
  // Format availability_date if present (required for preorder/backorder)
  let availabilityDateXml = '';
  if (product.availability_date) {
    try {
      const date = new Date(product.availability_date);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD for Google Merchant Center
        const formattedDate = date.toISOString().split('T')[0];
        availabilityDateXml = `\n    <g:availability_date>${formattedDate}</g:availability_date>`;
      }
    } catch {
      // Invalid date, skip it
    }
  }
  
  // Parse and add color attribute (if available) - improves visibility
  let colorXml = '';
  if (product.colors) {
    try {
      let colors = product.colors;
      if (typeof colors === 'string') {
        colors = JSON.parse(colors);
      }
      if (Array.isArray(colors) && colors.length > 0) {
        // Get first color name (Google accepts one primary color)
        const firstColor = colors[0];
        if (firstColor && typeof firstColor === 'object' && firstColor.name) {
          colorXml = `\n    <g:color>${escapeXml(firstColor.name)}</g:color>`;
        } else if (typeof firstColor === 'string') {
          colorXml = `\n    <g:color>${escapeXml(firstColor)}</g:color>`;
        }
      }
    } catch {
      // Invalid color data, skip it
    }
  }
  
  // Parse and add size attribute (if available) - improves visibility
  let sizeXml = '';
  if (product.sizes) {
    try {
      let sizes = product.sizes;
      if (typeof sizes === 'string') {
        sizes = JSON.parse(sizes);
      }
      if (Array.isArray(sizes) && sizes.length > 0) {
        // Get first size (Google accepts one primary size, or comma-separated list)
        const sizeList = sizes.slice(0, 3).map(s => typeof s === 'string' ? s : String(s)).join(', ');
        if (sizeList) {
          sizeXml = `\n    <g:size>${escapeXml(sizeList)}</g:size>`;
        }
      }
    } catch {
      // Invalid size data, skip it
    }
  }
  
  // Add SKU if available (improves product identification)
  let skuXml = '';
  if (product.sku && product.sku.trim() !== '') {
    skuXml = `\n    <g:mpn>${escapeXml(product.sku)}</g:mpn>`;
  } else {
    // Use product ID as fallback identifier
    skuXml = `\n    <g:mpn>${escapeXml(product.id.toString())}</g:mpn>`;
  }
  
  xml += `
    <g:price>${formattedPrice} ZAR</g:price>
    <g:availability>${availability}</g:availability>${availabilityDateXml}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(product.brand || 'MOTARRO Supplies')}</g:brand>${skuXml}${colorXml}${sizeXml}
    <g:product_type>${escapeXml(product.category || '')}</g:product_type>
    <g:google_product_category>${googleCategory}</g:google_product_category>
    <g:identifier_exists>${product.identifier_exists === false ? 'no' : 'yes'}</g:identifier_exists>
    <g:shipping_weight>
      <g:value>${shippingWeight.value}</g:value>
      <g:unit>${shippingWeight.unit}</g:unit>
    </g:shipping_weight>
    ${buildGmcShippingXml()}
  </item>`;
  
  return xml;
}

export async function GET() {
  try {
    const feed = await buildMerchantFeedProducts();

    const itemsXml = feed.publishable
      .map(productToXml)
      .filter(xml => xml !== '')
      .join('\n');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>MOTARRO Supplies Product Feed</title>
  <link>https://www.motarro.co.za/</link>
  <description>Product feed for Google Merchant Center</description>
${itemsXml}
</channel>
</rss>`;
    
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'X-Feed-Version': FEED_VERSION,
        'X-Feed-Native-Rows': String(feed.counts.native),
        'X-Feed-Kevro-Rows': String(feed.counts.kevro),
        'X-Feed-Titan-Jet-Rows': String(feed.counts.titanJet),
        'X-Feed-Publishable-Rows': String(feed.counts.publishable),
        'X-Feed-Skipped-Rows': String(feed.counts.skipped),
      },
    });
  } catch (error) {
    console.error('Google Merchant Feed Generation Error:', error);
    return new Response('Error generating product feed', { status: 500 });
  }
} 