export interface UploadedFile {
  url: string
  filename: string
  size: number
}

export interface CustomPrinting {
  designs: UploadedFile[]
  instructions?: string
}

export interface ColorOption {
  name: string
  value: string
}

export interface ProductVariant {
  id: string
  productId: string
  colorName?: string | null
  colorValue?: string | null
  size?: string | null
  sku?: string | null
  priceOverride?: number | null
  stockAvailable: number
  stockIncoming: number
  stockReserved: number
  isActive: boolean
  sortIndex?: number | null
}

export interface ProductDetails {
  material?: string
  fit?: string
  care?: string
  origin?: string
}

import type { ProductAvailability, ProductCondition } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  sku?: string | null
  price: number
  image: string
  images: string[]
  category: 'men' | 'women' | 'kids' | 'accessories' | 'unisex' | 'Custom Printing'
  description: string
  stock: number
  isNew: boolean
  originalPrice?: number
  onSale?: boolean
  status?: 'active' | 'disabled'
  availability?: ProductAvailability
  availabilityDate?: string | null
  condition?: ProductCondition
  lowStockThreshold?: number | null
  selectedSize?: string
  selectedColor?: string
  quantity?: number
  customPrinting?: CustomPrinting
  minOrder?: number
  sizes?: string[]
  colors?: ColorOption[]
  hasColorOptions?: boolean
  hasSizeOptions?: boolean
  variants?: ProductVariant[]
  variantId?: string
  details?: ProductDetails
  slug?: string
  seoSlug?: string
  subcategory?: string | null
  isKevro?: boolean
  kevroBrand?: string
  kevroType?: string
  isTitanJet?: boolean
  titanJetBrand?: string
} 