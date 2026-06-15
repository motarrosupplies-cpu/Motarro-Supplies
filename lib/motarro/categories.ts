/**
 * MOTARRO product categories derived from motarro.com.au catalogue (product_type field).
 * Used for navigation, admin categories, and storefront filters.
 */

export interface MotarroCategory {
  slug: string
  name: string
  description: string
  /** DB `category` value on simple_products */
  dbCategory: string
  /** product_type values from Motarro AU that map to this category */
  productTypes: string[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
}

const baseKeywords = [
  'stationery south africa',
  'craft supplies south africa',
  'motarro supplies',
  'school supplies',
  'art supplies johannesburg',
]

export const MOTARRO_CATEGORIES: MotarroCategory[] = [
  {
    slug: 'plastic',
    name: 'Plastic',
    description: 'Plastic stationery, organisers, and craft components.',
    dbCategory: 'plastic',
    productTypes: ['Plastic'],
    seoTitle: 'Plastic Stationery & Craft Supplies South Africa | MOTARRO',
    seoDescription:
      'Shop plastic stationery, organisers, and craft supplies from MOTARRO Supplies. Quality products for schools, offices, and creative projects — prices in Rands with nationwide delivery.',
    seoKeywords: [...baseKeywords, 'plastic stationery', 'plastic craft supplies'],
  },
  {
    slug: 'paper',
    name: 'Paper & Stationery',
    description: 'Paper products, carbon paper, and everyday stationery essentials.',
    dbCategory: 'paper',
    productTypes: ['Paper', 'Carbon'],
    seoTitle: 'Paper & Stationery Supplies South Africa | MOTARRO',
    seoDescription:
      'Browse paper and stationery supplies at MOTARRO Supplies South Africa. Carbon paper, writing essentials, and classroom stationery — affordable prices in Rands.',
    seoKeywords: [...baseKeywords, 'paper stationery', 'carbon paper south africa'],
  },
  {
    slug: 'wooden',
    name: 'Wooden',
    description: 'Wooden letters, craft pieces, and decorative stationery items.',
    dbCategory: 'wooden',
    productTypes: ['Wooden'],
    seoTitle: 'Wooden Craft & Stationery South Africa | MOTARRO',
    seoDescription:
      'Wooden letters, craft pieces, and decorative stationery from MOTARRO Supplies. Perfect for classrooms, crafts, and creative projects across South Africa.',
    seoKeywords: [...baseKeywords, 'wooden letters', 'wooden craft supplies'],
  },
  {
    slug: 'metal',
    name: 'Metal',
    description: 'Metal stationery clips, fasteners, and durable office supplies.',
    dbCategory: 'metal',
    productTypes: ['Metal'],
    seoTitle: 'Metal Stationery & Office Supplies South Africa | MOTARRO',
    seoDescription:
      'Metal stationery and durable office supplies from MOTARRO Supplies. Clips, fasteners, and classroom essentials — shop online in South African Rands.',
    seoKeywords: [...baseKeywords, 'metal stationery', 'office supplies south africa'],
  },
  {
    slug: 'acrylic',
    name: 'Acrylic',
    description: 'Acrylic craft sheets, displays, and creative materials.',
    dbCategory: 'acrylic',
    productTypes: ['Acrylic', 'glass', 'Glass'],
    seoTitle: 'Acrylic Craft Supplies South Africa | MOTARRO',
    seoDescription:
      'Acrylic sheets and craft materials from MOTARRO Supplies. Ideal for displays, crafts, and creative projects — delivered across South Africa.',
    seoKeywords: [...baseKeywords, 'acrylic craft supplies', 'acrylic sheets'],
  },
  {
    slug: 'tiles',
    name: 'Tiles',
    description: 'Taxitiles and decorative tile craft supplies.',
    dbCategory: 'tiles',
    productTypes: ['Taxitiles'],
    seoTitle: 'Taxitiles & Craft Tiles South Africa | MOTARRO',
    seoDescription:
      'Taxitiles and decorative craft tiles from MOTARRO Supplies. Creative tile supplies for schools and craft projects in South Africa.',
    seoKeywords: [...baseKeywords, 'taxitiles', 'craft tiles'],
  },
  {
    slug: 'foam-craft',
    name: 'Foam & Craft',
    description: 'EVA foam, glitter foam, felt, rubber, and soft craft materials.',
    dbCategory: 'foam-craft',
    productTypes: [
      'Glitter EVA Foam',
      'EVA Foam',
      'felt',
      'foam',
      'Rubber',
    ],
    seoTitle: 'EVA Foam & Craft Materials South Africa | MOTARRO',
    seoDescription:
      'EVA foam, glitter foam, felt, and rubber craft materials from MOTARRO Supplies. Essential soft craft supplies for schools and creative projects.',
    seoKeywords: [...baseKeywords, 'eva foam', 'glitter foam', 'felt craft supplies'],
  },
  {
    slug: 'art-supplies',
    name: 'Art Supplies',
    description: 'Crayons, clay, paint, chalk, pastels, and creative art materials.',
    dbCategory: 'art-supplies',
    productTypes: [
      'Crayon',
      'Clay',
      'clay',
      'Watercolor',
      'Chalk',
      'Washable paint',
      'Plasticine',
      'Pastel',
      'Oil',
      'Gouache',
    ],
    seoTitle: 'Art Supplies South Africa | Crayons, Clay & Paint | MOTARRO',
    seoDescription:
      'Art supplies including crayons, clay, paint, chalk, and pastels from MOTARRO Supplies. Quality creative materials for schools and artists — prices in Rands.',
    seoKeywords: [...baseKeywords, 'art supplies', 'crayons', 'clay', 'washable paint'],
  },
]

export const MOTARRO_CATEGORY_BY_SLUG = Object.fromEntries(
  MOTARRO_CATEGORIES.map((c) => [c.slug, c])
) as Record<string, MotarroCategory>

export const MOTARRO_CATEGORY_BY_DB = Object.fromEntries(
  MOTARRO_CATEGORIES.map((c) => [c.dbCategory, c])
) as Record<string, MotarroCategory>

/** Map Motarro AU product_type → storefront category slug */
export function mapProductTypeToCategory(productType: string): string {
  const normalized = (productType || '').trim()
  if (!normalized) return 'plastic'

  for (const cat of MOTARRO_CATEGORIES) {
    if (cat.productTypes.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      return cat.dbCategory
    }
  }
  return 'plastic'
}

export function getCategoryForSlug(slug: string): MotarroCategory | undefined {
  return MOTARRO_CATEGORY_BY_SLUG[slug]
}
