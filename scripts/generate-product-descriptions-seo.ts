/**
 * SEO-Optimized Product Description Generator
 * Fetches all products from the live site and generates unique, 300-600 word descriptions
 * with Johannesburg local SEO focus and FAQs
 */

// Use fetch API to get products from live site
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  colors?: Array<{ name: string; value: string }>;
  sizes?: string[];
  details?: {
    material?: string;
    fit?: string;
    care?: string;
    origin?: string;
  };
}

interface FAQ {
  question: string;
  answer: string;
}

interface ProductDescription {
  slug: string;
  title: string;
  description: string;
  faqs: FAQ[];
}

// Product type keywords mapping
const productTypeKeywords: Record<string, string> = {
  't-shirt': 'custom printed t-shirt',
  'tshirt': 'custom printed t-shirt',
  'hoodie': 'custom printed hoodie',
  'sweatshirt': 'custom printed sweatshirt',
  'polo': 'custom printed polo shirt',
  'cap': 'custom printed cap',
  'beanie': 'custom printed beanie',
  'jacket': 'custom printed jacket',
  'vest': 'custom printed vest',
  'shirt': 'custom printed shirt',
};

// Extract product type from name
function extractProductType(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(productTypeKeywords)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return 'custom printed apparel';
}

// Generate unique description based on product
function generateDescription(product: Product): string {
  const productType = extractProductType(product.name);
  const productTypeShort = productType.replace('custom printed ', '');
  const colors = product.colors?.map(c => c.name).join(', ') || 'various colours';
  const sizes = product.sizes?.join(', ') || 'all sizes';
  const material = product.details?.material || 'premium quality fabric';
  const category = product.category.toLowerCase();
  
  // Opening hook
  const openingHooks = [
    `Looking for the perfect ${productTypeShort} in Johannesburg? Our ${product.name} delivers exceptional quality and style, making it ideal for Jozi's vibrant business scene and sunny climate.`,
    `Whether you're a startup in Sandton or organizing an event in Randburg, this ${product.name} offers the perfect blend of comfort and professionalism for Johannesburg's dynamic lifestyle.`,
    `From corporate uniforms in Rosebank to team apparel across Gauteng, this ${product.name} combines premium materials with expert craftsmanship, designed specifically for South African conditions.`,
    `Perfect for Johannesburg's diverse climate and business culture, this ${product.name} is crafted to meet the highest standards for corporate wear, events, and everyday style.`,
  ];
  
  const hook = openingHooks[Math.floor(Math.random() * openingHooks.length)];
  
  // Fabric & quality details
  const fabricSection = product.details?.material 
    ? `Crafted from ${material}, this ${productTypeShort} ensures durability and comfort throughout Johannesburg's warm summers and mild winters. The premium fabric construction means your ${productTypeShort} will maintain its shape and vibrant colours wash after wash, making it perfect for daily wear in offices across Sandton, Midrand, and Kempton Park.`
    : `Made from ${material}, this ${productTypeShort} is designed to withstand the demands of active Johannesburg lifestyles. The high-quality construction ensures your custom printed ${productTypeShort} will look professional and feel comfortable, whether you're in a boardroom in Rosebank or at an outdoor event in Randburg.`;
  
  // Printing methods
  const printingMethods = [
    `We offer multiple printing methods for this ${productTypeShort}, including Direct-to-Garment (DTG) printing for intricate designs, sublimation printing for vibrant full-colour graphics, and screen printing for bulk orders. Each method is optimized for ${productTypeShort} in Johannesburg, ensuring your logo or design looks crisp and professional.`,
    `Our custom printing services for this ${productTypeShort} include DTG printing for photographic-quality results, sublimation for all-over designs, and screen printing for cost-effective bulk orders. Perfect for businesses across Gauteng looking to create branded ${productTypeShort} that stand out.`,
    `Whether you need DTG printing for small batches, sublimation for full-colour designs, or screen printing for corporate orders, we've got you covered. This ${productTypeShort} is ideal for custom printing in Johannesburg, with results that impress clients and team members alike.`,
  ];
  
  const printing = printingMethods[Math.floor(Math.random() * printingMethods.length)];
  
  // Use cases
  const useCases = [
    `Ideal for corporate uniforms in Johannesburg's business districts, team apparel for sports clubs across Gauteng, event merchandise for conferences and festivals, school uniforms, promotional giveaways, and personalized gifts. Whether you're outfitting a team in Sandton or creating branded merchandise for a Randburg event, this ${productTypeShort} delivers.`,
    `Perfect for corporate branding in Rosebank and Midrand, team uniforms for schools and sports clubs, event merchandise for festivals and conferences, promotional items for trade shows, and custom gifts. This ${productTypeShort} works beautifully for businesses and organizations throughout Johannesburg and the greater Gauteng area.`,
    `Excellent for professional workwear in Johannesburg's corporate sector, team building events, school uniforms, sports team apparel, promotional merchandise, and custom gifts. Whether you're a startup in Sandton or an established business in Kempton Park, this ${productTypeShort} meets your needs.`,
  ];
  
  const useCase = useCases[Math.floor(Math.random() * useCases.length)];
  
  // Sizing & care
  const sizingCare = product.sizes && product.sizes.length > 0
    ? `Available in sizes ${sizes}, ensuring a perfect fit for everyone. Care instructions: Machine wash cold with like colours, tumble dry low, and avoid ironing directly on printed areas. This ensures your custom printed ${productTypeShort} maintains its quality and appearance throughout Johannesburg's varied seasons.`
    : `Available in standard South African sizing with options to suit all body types. For best results, machine wash in cold water, tumble dry on low heat, and avoid bleaching. These care instructions help preserve your custom printed ${productTypeShort} for years of use across Gauteng's diverse climate.`;
  
  // CTA
  const ctas = [
    `Order your custom ${productTypeShort} today – get a free quote in 60 seconds and join hundreds of satisfied customers across Johannesburg who trust MOTARRO Supplies for their custom printing needs.`,
    `Ready to create your custom ${productTypeShort}? Get your free quote in 60 seconds and discover why businesses throughout Gauteng choose MOTARRO Supplies for premium custom printed apparel.`,
    `Start your custom ${productTypeShort} order now – receive a free quote within 60 seconds and experience the quality that makes MOTARRO Supplies Johannesburg's trusted choice for custom printing.`,
  ];
  
  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  
  // Combine all sections
  const description = `${hook}\n\n${fabricSection}\n\n${printing}\n\n${useCase}\n\n${sizingCare}\n\n${cta}`;
  
  return description;
}

// Generate FAQs based on product
function generateFAQs(product: Product): FAQ[] {
  const productType = extractProductType(product.name);
  const productTypeShort = productType.replace('custom printed ', '');
  
  const faqs: FAQ[] = [
    {
      question: `What printing methods are available for this ${productTypeShort} in Johannesburg?`,
      answer: `We offer Direct-to-Garment (DTG) printing for detailed designs and small orders, sublimation printing for vibrant full-colour graphics, and screen printing for cost-effective bulk orders. Each method is optimized for ${productTypeShort} and works perfectly for businesses across Gauteng.`
    },
    {
      question: `What is the minimum order quantity for custom printed ${productTypeShort}?`,
      answer: `Minimum order quantities vary by printing method. DTG printing can accommodate single items, while screen printing typically requires 10-20 units. For bulk corporate orders in Johannesburg, we offer competitive pricing and flexible minimums. Contact us for specific MOQ details.`
    },
    {
      question: `How long does it take to receive custom printed ${productTypeShort} in Johannesburg?`,
      answer: `Standard production time is 2-4 weeks from design approval. For urgent orders in Johannesburg, Sandton, or Randburg, we offer rush services with faster turnaround times. Shipping within Gauteng is typically 1-2 business days after production completion.`
    },
    {
      question: `Can I see a sample before placing a bulk order for ${productTypeShort}?`,
      answer: `Yes! We highly recommend ordering a sample before large production runs. We can provide digital mock-ups or physical samples so you can verify colours, sizing, and print quality before committing to a full order. This ensures your custom printed ${productTypeShort} meets your expectations.`
    },
    {
      question: `What file formats do you accept for custom printing on ${productTypeShort}?`,
      answer: `We accept vector files (AI, EPS, SVG, PDF) for best results, or high-resolution raster images (JPEG, PNG) at 300 DPI minimum. Our design team can also help optimize your artwork for the best printing results on your custom ${productTypeShort}.`
    },
    {
      question: `Do you offer design services for custom ${productTypeShort} in Johannesburg?`,
      answer: `Absolutely! Our experienced design team can help create or refine your artwork for custom printing. Whether you need logo design, text layout, or full graphic design services, we work with businesses across Gauteng to create professional, print-ready designs for your ${productTypeShort}.`
    }
  ];
  
  // Return 4-6 random FAQs
  const shuffled = faqs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 FAQs
}

// Main function to generate descriptions for all products
async function generateAllProductDescriptions(): Promise<ProductDescription[]> {
  console.log('Fetching all products from live API...');
  console.log(`API URL: ${API_BASE_URL}/api/products`);
  
  try {
    // Fetch from live API
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const products = data.products || data;
    
    console.log(`Found ${products?.length || 0} products`);
    
    if (!products || products.length === 0) {
      console.warn('No products found. Make sure products exist.');
      return [];
    }
    
    // Parse JSON fields
    const parseJson = (field: any) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return [];
    };
    
    // Transform and generate descriptions
    const descriptions: ProductDescription[] = products.map((p: any) => {
      const product: Product = {
        id: p.id,
        name: p.name,
        slug: p.slug || p.seoSlug || p.id,
        description: p.description || '',
        category: p.category || 'unisex',
        price: Number(p.price) || 0,
        colors: parseJson(p.colors),
        sizes: parseJson(p.sizes),
        details: {
          material: p.details?.material,
          fit: p.details?.fit,
          care: p.details?.care,
          origin: p.details?.origin,
        },
      };
      
      const generatedDescription = generateDescription(product);
      const faqs = generateFAQs(product);
      
      return {
        slug: product.slug,
        title: product.name,
        description: generatedDescription,
        faqs: faqs,
      };
    });
    
    return descriptions;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateAllProductDescriptions()
    .then(descriptions => {
      // Write to JSON file
      const fs = require('fs');
      const path = require('path');
      const outputPath = path.join(process.cwd(), 'product-descriptions-seo-complete.json');
      
      fs.writeFileSync(outputPath, JSON.stringify(descriptions, null, 2), 'utf-8');
      
      console.log('\n=== GENERATED PRODUCT DESCRIPTIONS ===\n');
      console.log(`Total products: ${descriptions.length}`);
      console.log(`\n✓ Saved to: ${outputPath}`);
      console.log('\nTo update the database, run:');
      console.log('  npx tsx scripts/update-product-descriptions.ts\n');
      
      // Also output JSON for easy copy-paste
      console.log(JSON.stringify(descriptions, null, 2));
    })
    .catch(error => {
      console.error('Error generating descriptions:', error);
      process.exit(1);
    });
}

export { generateAllProductDescriptions, generateDescription, generateFAQs };

