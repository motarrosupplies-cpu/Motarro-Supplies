/**
 * Product Description Templates
 * SEO-optimized, unique product descriptions (300-600 words)
 * Use these templates to generate unique content for products
 */

interface ProductDescriptionParams {
  productName: string;
  category: string;
  price: number;
  colors?: string[];
  sizes?: string[];
  material?: string;
  features?: string[];
  location?: string;
}

/**
 * Template 1: Premium T-Shirt (Men's/Women's)
 * 400-500 words, includes features, benefits, location
 */
export function generateTShirtDescription(params: ProductDescriptionParams): string {
  const { productName, category, price, colors, sizes, material, location = "Johannesburg" } = params;
  const gender = category === 'men' ? "men's" : category === 'women' ? "ladies'" : "";
  const colorText = colors && colors.length > 0 
    ? `Available in ${colors.length} stunning colour${colors.length > 1 ? 's' : ''}: ${colors.join(', ')}.`
    : "Available in multiple colour options.";
  const sizeText = sizes && sizes.length > 0
    ? `Sizes range from ${sizes[0]} to ${sizes[sizes.length - 1]}, ensuring the perfect fit for everyone.`
    : "Available in standard sizes to fit all body types.";

  return `${productName} - Premium ${gender} Custom Printed T-Shirt in ${location}

Looking for high-quality custom printed t-shirts in ${location}? Our ${productName} is the perfect choice for individuals, businesses, and events seeking premium custom apparel that combines style, comfort, and durability.

Crafted with attention to detail, this ${gender} t-shirt features ${material || "premium cotton blend"} fabric that feels soft against your skin while maintaining its shape wash after wash. Whether you're ordering for a corporate event, sports team, school function, or personal use, this versatile garment delivers exceptional quality at an affordable price point.

${colorText} Each colour option is carefully selected to ensure vibrant, long-lasting prints that won't fade or crack over time. Our advanced printing techniques, including sublimation and direct-to-garment (DTG) printing, ensure your custom designs, logos, or text appear crisp and professional.

${sizeText} Our size guide helps you find the perfect fit, and we offer custom sizing options for bulk orders. The relaxed fit design ensures comfort throughout the day, making it ideal for casual wear, team uniforms, promotional events, or branded corporate clothing.

Why Choose Our Custom T-Shirts in ${location}?

As a leading custom apparel provider in ${location} and across South Africa, we understand the importance of quality, reliability, and fast turnaround times. Our ${productName} is manufactured using industry-leading techniques and premium materials, ensuring your investment in custom apparel delivers lasting value.

For businesses in ${location}, our custom t-shirts serve as powerful marketing tools. Whether you're launching a new product, promoting your brand at events, or outfitting your team with professional uniforms, our custom printing services help you make a lasting impression.

Event organisers in ${location} trust us for their custom apparel needs. From music festivals and sports tournaments to corporate conferences and school events, our t-shirts are designed to withstand the demands of active wear while maintaining a polished, professional appearance.

Our printing process uses eco-friendly inks and sustainable practices, making this an environmentally conscious choice for businesses and individuals committed to reducing their carbon footprint. The fabric is breathable and moisture-wicking, keeping you comfortable even during extended wear.

Ordering is simple and straightforward. Choose your preferred colour and size, upload your design or logo, and our team will handle the rest. We offer competitive pricing for bulk orders, with free shipping available on orders over a certain threshold. Our production team in ${location} ensures fast turnaround times without compromising on quality.

Customer satisfaction is our top priority. We stand behind every product with a satisfaction guarantee, and our customer service team is always ready to assist with any questions or customisation requests.

Experience the difference that quality custom apparel makes. Order your ${productName} today and discover why businesses and individuals across ${location} and South Africa trust MOTARRO Supplies for their custom printing needs.`;
}

/**
 * Template 2: Hoodie (Unisex/Men's/Women's)
 * 450-550 words
 */
export function generateHoodieDescription(params: ProductDescriptionParams): string {
  const { productName, category, price, colors, sizes, material, location = "Johannesburg" } = params;
  const gender = category === 'men' ? "men's" : category === 'women' ? "ladies'" : "unisex";
  
  return `${productName} - Premium ${gender} Custom Printed Hoodie in ${location}

Elevate your custom apparel collection with our ${productName}, a premium ${gender} hoodie designed for comfort, style, and durability. Perfect for businesses, sports teams, schools, and individuals in ${location} seeking high-quality custom printed clothing.

Made from ${material || "premium cotton-polyester blend"}, this hoodie offers exceptional warmth and comfort while maintaining a professional appearance. The soft, brushed interior provides a cozy feel, making it ideal for cooler weather, casual wear, or as part of a team uniform.

Our custom printing services in ${location} utilise state-of-the-art sublimation and DTG printing techniques, ensuring your designs, logos, or text appear vibrant and long-lasting. Whether you're creating branded merchandise for your business, team jerseys for your sports club, or personalised gifts, this hoodie delivers outstanding results.

Available in ${colors?.length || "multiple"} colour options${colors ? `: ${colors.join(', ')}` : ''}, each carefully selected to complement your custom designs. The colour-fast fabric ensures your prints remain bright and clear, even after multiple washes.

Sizing options range from ${sizes?.[0] || "XS"} to ${sizes?.[sizes.length - 1] || "5XL"}, accommodating all body types. Our detailed size guide helps you select the perfect fit, and we offer custom sizing for bulk orders to ensure everyone looks and feels great.

Features include a spacious front pocket, adjustable drawstring hood, and ribbed cuffs and hem for a secure, comfortable fit. The relaxed fit design allows for easy layering, making it versatile for various occasions and weather conditions.

Why Choose Our Custom Hoodies in ${location}?

As a trusted custom apparel provider in ${location}, we understand that quality matters. Our hoodies are manufactured to the highest standards, using premium materials and advanced printing techniques that ensure your investment delivers lasting value.

For businesses in ${location}, custom hoodies serve as effective promotional tools and team uniforms. The professional appearance and durable construction make them ideal for corporate events, team building activities, or as part of your company's branded merchandise program.

Sports teams and schools in ${location} appreciate our fast turnaround times and competitive pricing. Whether you need matching team hoodies for your players or school merchandise for events, we deliver quality products on time, every time.

Our commitment to sustainability means we use eco-friendly printing processes and source materials responsibly. The breathable fabric and moisture-wicking properties ensure comfort during active wear, while the durable construction withstands regular use.

Ordering is simple: select your preferred colour and size, upload your design, and our experienced team handles the rest. We offer volume discounts for bulk orders and free shipping on qualifying purchases. Our production facility in ${location} ensures local support and fast delivery times.

Customer satisfaction is guaranteed. We work closely with each client to ensure their custom hoodies meet their exact specifications, and our customer service team is always available to assist with questions or special requests.

Experience premium custom apparel in ${location}. Order your ${productName} today and join the many satisfied customers across ${location} and South Africa who trust MOTARRO Supplies for their custom printing needs.`;
}

/**
 * Template 3: Accessories (Caps, Bags, Mugs)
 * 350-450 words
 */
export function generateAccessoryDescription(params: ProductDescriptionParams): string {
  const { productName, category, price, colors, material, location = "Johannesburg" } = params;
  
  return `${productName} - Custom Printed Accessories in ${location}

Complete your custom branding with our ${productName}, a premium accessory perfect for businesses, events, and promotional campaigns in ${location}. This high-quality item combines functionality with style, making it an ideal choice for custom printing and branding.

Crafted from ${material || "durable, premium materials"}, this accessory is designed to withstand daily use while maintaining its professional appearance. Whether you're looking to create branded merchandise for your business, promotional items for events, or personalised gifts, this product delivers exceptional value.

Our custom printing services in ${location} utilise advanced techniques to ensure your logos, designs, or text appear crisp, vibrant, and long-lasting. The smooth surface and quality materials provide the perfect canvas for your custom branding, ensuring your message stands out.

Available in ${colors?.length || "multiple"} colour options${colors ? `: ${colors.join(', ')}` : ''}, allowing you to match your brand colours or create eye-catching designs that capture attention. Each colour option is carefully selected to ensure optimal print quality and visual appeal.

Why Choose Our Custom Accessories in ${location}?

As a leading provider of custom printed accessories in ${location}, we understand the importance of quality and reliability. Our products are manufactured to the highest standards, ensuring your investment delivers lasting value and professional results.

For businesses in ${location}, custom accessories serve as powerful marketing tools. Whether you're attending trade shows, hosting corporate events, or looking to increase brand visibility, our custom printed accessories help you make a lasting impression on clients and prospects.

Event organisers in ${location} trust us for their promotional merchandise needs. From conferences and festivals to sports events and school functions, our accessories are designed to be practical, stylish, and memorable.

Our printing process uses high-quality inks and sustainable practices, ensuring vibrant, long-lasting prints that won't fade or deteriorate over time. The durable construction means your custom accessories will continue to promote your brand for years to come.

Ordering is straightforward and convenient. Select your preferred colour, upload your design or logo, and our experienced team handles the rest. We offer competitive pricing for bulk orders, with volume discounts available for larger quantities.

Customer satisfaction is our priority. We work closely with each client to ensure their custom accessories meet their exact specifications, and our customer service team is always ready to assist with questions or special requests.

Experience quality custom accessories in ${location}. Order your ${productName} today and discover why businesses and individuals across ${location} and South Africa trust MOTARRO Supplies for their custom printing needs.`;
}

/**
 * Template 4: Corporate/Workwear
 * 500-600 words
 */
export function generateCorporateDescription(params: ProductDescriptionParams): string {
  const { productName, category, price, colors, sizes, material, location = "Johannesburg" } = params;
  
  return `${productName} - Professional Corporate Workwear in ${location}

Elevate your team's professional appearance with our ${productName}, premium corporate workwear designed for businesses in ${location} seeking high-quality, custom-branded uniforms and apparel. Perfect for corporate offices, retail environments, hospitality businesses, and service industries.

Crafted from ${material || "professional-grade fabric"}, this workwear combines comfort, durability, and professional styling to create uniforms that your team will be proud to wear. The fabric is designed to withstand the demands of daily wear while maintaining a polished, corporate appearance.

Our custom printing and embroidery services in ${location} ensure your company logo, branding, or text appears professional and long-lasting. Whether you choose embroidery for a premium finish or printing for vibrant designs, our experienced team delivers results that reflect your brand's quality and professionalism.

Available in ${colors?.length || "multiple"} professional colour options${colors ? `: ${colors.join(', ')}` : ''}, each selected to complement corporate environments and brand guidelines. The colour-fast fabric ensures your branding remains vibrant, even after multiple professional washes.

Sizing options accommodate all team members, from ${sizes?.[0] || "XS"} to ${sizes?.[sizes.length - 1] || "5XL"}, ensuring everyone looks professional and feels comfortable. Our detailed size guide and custom sizing options for bulk orders ensure the perfect fit for every team member.

Why Choose Our Corporate Workwear in ${location}?

As a trusted provider of corporate uniforms and workwear in ${location}, we understand that your team's appearance directly impacts your brand image and customer perception. Our workwear is designed to project professionalism, quality, and attention to detail.

For businesses in ${location}, professional uniforms create a cohesive brand identity, improve team morale, and enhance customer trust. Whether you're outfitting a retail team, hospitality staff, corporate office, or service professionals, our workwear helps you present a unified, professional image.

Our corporate workwear solutions are designed with functionality in mind. The breathable fabric, comfortable fit, and durable construction ensure your team can perform their duties comfortably while maintaining a professional appearance throughout the day.

The custom branding options allow you to incorporate your company logo, colours, and messaging, creating uniforms that reinforce your brand identity at every customer interaction. Our printing and embroidery techniques ensure your branding appears professional and withstands regular wear and washing.

We offer flexible ordering options to accommodate businesses of all sizes. From small teams to large corporate orders, we provide competitive pricing, volume discounts, and fast turnaround times. Our production facility in ${location} ensures local support and reliable delivery.

Customer service is a priority. We work closely with each business to understand their specific requirements, brand guidelines, and timeline needs. Our team provides expert guidance on fabric selection, design placement, and sizing to ensure your corporate workwear meets your exact specifications.

Quality assurance is built into every step of our process. From material selection to final inspection, we ensure your corporate workwear meets the highest standards. We stand behind every product with a satisfaction guarantee and ongoing support.

Experience professional corporate workwear in ${location}. Order your ${productName} today and discover why businesses across ${location} and South Africa trust MOTARRO Supplies for their corporate uniform and workwear needs.`;
}

/**
 * Template 5: Event/Sports Apparel
 * 400-500 words
 */
export function generateEventDescription(params: ProductDescriptionParams): string {
  const { productName, category, price, colors, sizes, material, location = "Johannesburg" } = params;
  
  return `${productName} - Custom Event & Sports Apparel in ${location}

Make your event memorable with our ${productName}, premium custom apparel designed for sports teams, events, and group activities in ${location}. Perfect for tournaments, festivals, school events, corporate functions, and team sports.

Crafted from ${material || "high-performance fabric"}, this apparel is designed to withstand the demands of active wear while maintaining comfort and style. The breathable, moisture-wicking fabric keeps participants cool and comfortable, even during intense activities.

Our custom printing services in ${location} utilise advanced sublimation and DTG techniques to ensure your team colours, logos, or event branding appear vibrant and professional. Whether you're creating team jerseys, event t-shirts, or group uniforms, our printing delivers outstanding results.

Available in ${colors?.length || "multiple"} colour options${colors ? `: ${colors.join(', ')}` : ''}, allowing you to match team colours, event themes, or create eye-catching designs. Each colour option is selected to ensure optimal print quality and visual impact.

Sizing accommodates all participants, from ${sizes?.[0] || "XS"} to ${sizes?.[sizes.length - 1] || "5XL"}, ensuring everyone has the perfect fit. Our size guide helps you select the right size, and we offer custom sizing options for bulk orders to ensure comfort for all participants.

Why Choose Our Event Apparel in ${location}?

As a leading provider of custom event and sports apparel in ${location}, we understand the importance of quality, reliability, and fast turnaround times. Our apparel is designed to perform under pressure while maintaining a professional, polished appearance.

For sports teams in ${location}, our custom jerseys and uniforms help create team identity and unity. The durable construction and high-performance fabric ensure your team looks professional and performs comfortably, whether on the field, court, or track.

Event organisers in ${location} trust us for their custom merchandise needs. From music festivals and conferences to school events and corporate functions, our apparel helps create memorable experiences and lasting souvenirs for participants.

Our printing process ensures vibrant, long-lasting designs that won't fade or crack, even after multiple washes and extended wear. The colour-fast fabric and quality construction mean your custom apparel will continue to look great throughout the season or event.

We offer competitive pricing for bulk orders, with volume discounts available for larger quantities. Our production facility in ${location} ensures fast turnaround times, allowing you to meet tight deadlines without compromising on quality.

Customer service is a priority. We work closely with each client to understand their specific needs, design requirements, and timeline constraints. Our team provides expert guidance on design placement, colour selection, and sizing to ensure your custom apparel meets your exact specifications.

Experience quality event apparel in ${location}. Order your ${productName} today and discover why sports teams, event organisers, and groups across ${location} and South Africa trust MOTARRO Supplies for their custom printing needs.`;
}

/**
 * Main function to generate description based on product type
 */
export function generateProductDescription(params: ProductDescriptionParams): string {
  const { category, productName } = params;
  const nameLower = productName.toLowerCase();

  // Determine template based on product name and category
  if (nameLower.includes('hoodie') || nameLower.includes('sweatshirt')) {
    return generateHoodieDescription(params);
  } else if (nameLower.includes('cap') || nameLower.includes('hat') || nameLower.includes('bag') || nameLower.includes('mug')) {
    return generateAccessoryDescription(params);
  } else if (nameLower.includes('corporate') || nameLower.includes('workwear') || nameLower.includes('uniform')) {
    return generateCorporateDescription(params);
  } else if (nameLower.includes('event') || nameLower.includes('sport') || nameLower.includes('team')) {
    return generateEventDescription(params);
  } else {
    // Default to t-shirt template
    return generateTShirtDescription(params);
  }
}

