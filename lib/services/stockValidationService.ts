/**
 * Server-side stock validation for checkout.
 * Used by payfast-initiate and EFT to prevent oversell before creating an order.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { getKevroVariantStock } from '@/lib/kevro/repository'
import { getTitanJetProductStock } from '@/lib/titan-jet/repository'

const OPTIMIZED_TABLES = [
  { table: 'simple_products', type: 'simple', variantTable: null as string | null },
  { table: 'color_only_products', type: 'color_only', variantTable: 'color_variants' },
  { table: 'size_only_products', type: 'size_only', variantTable: 'size_variants' },
  { table: 'full_variant_products', type: 'full_variant', variantTable: 'full_variants' },
]

export interface CartItemForValidation {
  productId: string
  name?: string
  quantity: number
  selectedColorId?: string | null
  selectedSizeId?: string | null
  selectedColor?: string | null
  selectedSize?: string | null
  customPrinting?: {
    source?: string
    stockHeaderId?: number
    stockId?: number
    wcProductId?: number
  } | null
}

export interface StockValidationResult {
  valid: boolean
  message?: string
}

/**
 * Resolve available stock for a product (and optional variant). Uses optimized tables first, then falls back to products.
 */
async function getAvailableStock(
  client: SupabaseClient,
  productId: string,
  item: CartItemForValidation
): Promise<{ available: number; productName: string }> {
  let product: any = null
  let productType = 'simple'
  let variantTable: string | null = null

  for (const { table, type, variantTable: vt } of OPTIMIZED_TABLES) {
    const { data, error } = await client
      .from(table)
      .select('id, name, stock, total_stock')
      .eq('id', productId)
      .eq('status', 'active')
      .maybeSingle()

    if (!error && data) {
      product = data
      productType = type
      variantTable = vt
      break
    }
  }

  if (!product) {
    const { data: legacy } = await client
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .maybeSingle()
    if (legacy) {
      const stock = Number(legacy.stock) ?? 0
      return { available: Math.max(0, stock), productName: legacy.name || item.name || productId }
    }
    return { available: 0, productName: item.name || productId }
  }

  const productName = product.name || item.name || productId

  if (productType === 'simple' || !variantTable) {
    const stock = Number(product.stock ?? product.total_stock ?? 0)
    return { available: Math.max(0, stock), productName }
  }

  const { data: variants } = await client
    .from(variantTable)
    .select('id, stock_available, color_name, color_value, size')
    .eq('product_id', productId)

  if (!variants || variants.length === 0) {
    const total = Number(product.total_stock ?? product.stock ?? 0)
    return { available: Math.max(0, total), productName }
  }

  const variantId = item.selectedColorId || item.selectedSizeId
  if (variantId) {
    const v = variants.find((x: any) => x.id === variantId)
    if (v) {
      const available = Math.max(0, Number(v.stock_available) ?? 0)
      return { available, productName }
    }
  }

  const matchByColorSize = (v: any) => {
    const colorMatch = !item.selectedColor && !item.selectedColorId ||
      (item.selectedColor && (v.color_name === item.selectedColor || v.color_value === item.selectedColor)) ||
      (item.selectedColorId && v.id === item.selectedColorId)
    const sizeMatch = !item.selectedSize && !item.selectedSizeId ||
      (item.selectedSize && v.size === item.selectedSize) ||
      (item.selectedSizeId && v.id === item.selectedSizeId)
    return colorMatch && sizeMatch
  }
  const matched = variants.find(matchByColorSize)
  if (matched) {
    const available = Math.max(0, Number(matched.stock_available) ?? 0)
    return { available, productName }
  }

  const totalAvailable = variants.reduce((sum: number, v: any) => sum + (Number(v.stock_available) ?? 0), 0)
  return { available: Math.max(0, totalAvailable), productName }
}

/**
 * Validate that all cart items have quantity <= available stock. Call before creating an order.
 */
export async function validateOrderItemsStock(
  client: SupabaseClient,
  items: CartItemForValidation[]
): Promise<StockValidationResult> {
  if (!items || items.length === 0) {
    return { valid: true }
  }
  for (const item of items) {
    const qty = Number(item.quantity) || 0
    if (qty <= 0) continue

    if (item.customPrinting?.source === 'kevro') {
      const stockHeaderId = Number(item.customPrinting.stockHeaderId)
      const stockId = Number(item.customPrinting.stockId)
      if (stockHeaderId > 0 && stockId > 0) {
        const available = await getKevroVariantStock(stockHeaderId, stockId)
        if (qty > available) {
          return {
            valid: false,
            message: `Insufficient stock for "${item.name || 'Kevro item'}". Requested: ${qty}, available: ${available}.`,
          }
        }
        continue
      }
    }

    if (item.customPrinting?.source === 'titan-jet') {
      const wcProductId = Number(item.customPrinting.wcProductId)
      if (wcProductId > 0) {
        const available = await getTitanJetProductStock(wcProductId)
        if (qty > available) {
          return {
            valid: false,
            message: `Insufficient stock for "${item.name || 'Titan Jet item'}". Requested: ${qty}, available: ${available}.`,
          }
        }
        continue
      }
    }

    const { available, productName } = await getAvailableStock(client, item.productId, item)
    if (qty > available) {
      return {
        valid: false,
        message: `Insufficient stock for "${productName}". Requested: ${qty}, available: ${available}.`,
      }
    }
  }
  return { valid: true }
}
