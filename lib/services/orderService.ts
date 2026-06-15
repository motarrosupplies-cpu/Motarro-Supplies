import { supabase } from '@/lib/supabaseClient';

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD${timestamp}${random}`.toUpperCase();
}

function generateItemId(): string {
  return `ITEM${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
}

export interface OrderItem {
  id: string;
  productId: string; // uuid
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  customPrinting?: {
    designs: {
      url: string;
      filename: string;
      size: number;
    }[];
    instructions?: string;
  };
  selectedColorId?: string;
  selectedSizeId?: string;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  shippingCost?: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  /** Set when stock was already deducted (e.g. PayFast IPN fulfillment). Accept button then only updates status. */
  stockDeducted?: boolean;
}

class OrderService {
  // Create a new order in Supabase
  async createOrder(orderData: {
    customerId: string;
    items: OrderItem[];
    total: number;
    shippingCost?: number;
    paymentMethod: string;
    shippingAddress: any; // object, will be stringified
    specialInstructions?: string;
  }): Promise<Order | null> {
    const now = new Date().toISOString();
    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: orderData.customerId,
          status: 'pending',
          total_amount: orderData.total,
          shipping_cost: orderData.shippingCost ?? null,
          payment_method: orderData.paymentMethod,
          shipping_address: JSON.stringify(orderData.shippingAddress),
          special_instructions: orderData.specialInstructions,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();
    if (error) {
      console.error('Supabase createOrder error:', error);
      return null;
    }
    // Insert order items
    const orderId = data.id;
    const orderItemsPayload = orderData.items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price_at_time: item.price,
      selected_color_id: this.isValidUUID(item.selectedColorId) ? item.selectedColorId : null,
      selected_color: item.selectedColor || null,
      selected_size_id: this.isValidUUID(item.selectedSizeId) ? item.selectedSizeId : null,
      selected_size: item.selectedSize || null,
      custom_printing: item.customPrinting ? JSON.stringify(item.customPrinting) : null,
      created_at: now,
    }));
    if (orderItemsPayload.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);
      if (itemsError) {
        console.error('Supabase createOrderItems error:', JSON.stringify(itemsError, null, 2));
        console.error('Payload:', JSON.stringify(orderItemsPayload, null, 2));
      }
    }
    return this.mapDbToOrder(data);
  }

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(this.mapDbToOrder);
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) return null;
    return this.mapDbToOrder(data);
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: now })
      .eq('id', orderId)
      .select()
      .single();
    if (error) return null;
    return this.mapDbToOrder(data);
  }

  // Get orders by customer ID
  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(this.mapDbToOrder);
  }

  // Fetch order items for a given orderId
  async getOrderItems(orderId: string) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error || !data) return [];
    // Parse custom_printing JSON
    return data.map(item => ({
      ...item,
      custom_printing: item.custom_printing ? JSON.parse(item.custom_printing) : null,
      product_name: item.product_name,
      product_image: item.product_image,
      selectedColor: item.selected_color,
      selectedSize: item.selected_size,
    }));
  }

  // Helper to map DB row to Order
  private mapDbToOrder(row: any): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      status: row.status,
      totalAmount: row.total_amount,
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      shippingCost: row.shipping_cost,
      specialInstructions: row.special_instructions,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      stockDeducted: row.stock_deducted === true,
    };
  }

  // Helper to check if a string is a valid UUID (v4)
  private isValidUUID(str: string | undefined): boolean {
    if (!str) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
  }

  // Delete order
  async deleteOrder(orderId: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    if (error) {
      console.error('Supabase deleteOrder error:', error);
      return false;
    }
    return true;
  }
}

export const orderService = new OrderService(); 