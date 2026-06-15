import { supabaseAdmin } from '@/lib/supabaseClient'

/**
 * Order creation for checkout. Used by PayFast initiate and EFT.
 * Inserts order then order_items; rolls back order if items insert fails.
 */
export interface CreateOrderPayload {
  customerId: string
  items: Array<{
    productId: string
    name: string
    image?: string
    price: number
    quantity: number
    selectedColorId?: string
    selectedColor?: string
    selectedSizeId?: string
    selectedSize?: string
    customPrinting?: unknown
  }>
  total: number
  shippingCost?: number
  paymentMethod: string
  shippingAddress: Record<string, unknown>
  specialInstructions?: string
  discountCode?: string
  discountAmount?: number
  status?: string
}

export interface CreateOrderResult {
  order: { id: string; [key: string]: unknown }
  orderNumber: string
}

export async function createOrderInDb(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for order creation')
  }

  const {
    customerId,
    items,
    total,
    shippingCost,
    paymentMethod,
    shippingAddress,
    specialInstructions,
    discountCode,
    discountAmount,
    status = 'pending',
  } = payload

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      status,
      total_amount: total,
      shipping_cost: shippingCost ?? 0,
      discount_code: discountCode ?? null,
      discount_amount: discountAmount ?? 0,
      payment_method: paymentMethod,
      shipping_address: JSON.stringify(shippingAddress),
      special_instructions: specialInstructions ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  const orderItemsData = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_image: item.image ?? null,
    quantity: item.quantity || 1,
    price_at_time: item.price,
    selected_color_id: item.selectedColorId ?? null,
    selected_color: item.selectedColor ?? null,
    selected_size_id: item.selectedSizeId ?? null,
    selected_size: item.selectedSize ?? null,
    custom_printing: item.customPrinting ? JSON.stringify(item.customPrinting) : null,
    created_at: new Date().toISOString(),
  }))

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsData)

  if (itemsError) {
    // Rollback: remove order so we do not leave orphan orders without items
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  return { order, orderNumber }
}
