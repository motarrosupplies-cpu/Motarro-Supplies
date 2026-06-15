import { supabase } from '@/lib/supabaseClient';
import { invoiceService } from './invoiceService';
import { orderService, Order } from './orderService';
import { customerService, Customer } from './customerService';

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalInvoices: number;
  totalOrders: number;
  paidInvoices: number;
  pendingInvoices: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  activeCustomers: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  invoices: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice' | 'order' | 'customer';
  title: string;
  amount?: number;
  customer: string;
  date: Date;
  status: string;
}

export interface StockUpdate {
  productId: string;
  productName: string;
  quantitySold: number;
  previousStock: number;
  newStock: number;
  date: Date;
}

export class DashboardService {
  // Get comprehensive dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [invoices, orders, customers] = await Promise.all([
        invoiceService.getInvoices(),
        orderService.getAllOrders(),
        customerService.getAllCustomers(),
      ]);

      // Calculate revenue from paid invoices
      const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID');
      const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

      // Calculate monthly revenue (current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyInvoices = paidInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

      // Calculate monthly growth (compare with previous month)
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const previousMonthInvoices = paidInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate.getMonth() === previousMonth && invoiceDate.getFullYear() === previousYear;
      });
      
      const previousMonthRevenue = previousMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const monthlyGrowth = previousMonthRevenue > 0 
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      // Count active customers (customers with orders or invoices in last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeCustomerIds = new Set([
        ...orders.filter(order => new Date(order.createdAt) > thirtyDaysAgo).map(order => order.customerId),
        ...invoices.filter(invoice => new Date(invoice.createdAt) > thirtyDaysAgo).map(invoice => invoice.customerId)
      ]);

      return {
        totalRevenue,
        totalSales: orders.length,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalOrders: orders.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: invoices.filter(invoice => invoice.status === 'SENT' || invoice.status === 'DRAFT').length,
        monthlyRevenue,
        monthlyGrowth,
        activeCustomers: activeCustomerIds.size,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get revenue data for charts (last 30 days)
  async getRevenueData(): Promise<RevenueData[]> {
    try {
      const invoices = await invoiceService.getInvoices();
      const orders = await orderService.getAllOrders();
      
      const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID');
      const revenueData: RevenueData[] = [];
      
      // Generate data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayInvoices = paidInvoices.filter(invoice => {
          const invoiceDate = new Date(invoice.issueDate);
          return invoiceDate.toISOString().split('T')[0] === dateString;
        });
        
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toISOString().split('T')[0] === dateString;
        });
        
        const dayRevenue = dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
        
        revenueData.push({
          date: dateString,
          revenue: dayRevenue,
          orders: dayOrders.length,
          invoices: dayInvoices.length,
        });
      }
      
      return revenueData;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }

  // Get recent activity (invoices, orders, new customers)
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const [invoices, orders, customers] = await Promise.all([
        invoiceService.getInvoices(),
        orderService.getAllOrders(),
        customerService.getAllCustomers(),
      ]);

      const activities: RecentActivity[] = [];

      // Add recent invoices
      invoices.slice(0, limit).forEach(invoice => {
        activities.push({
          id: invoice.id,
          type: 'invoice',
          title: `Invoice ${invoice.invoiceNumber}`,
          amount: invoice.total,
          customer: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
          date: invoice.createdAt,
          status: invoice.status,
        });
      });

      // Add recent orders
      orders.slice(0, limit).forEach(order => {
        activities.push({
          id: order.id,
          type: 'order',
          title: `Order #${order.id}`,
          amount: order.totalAmount,
          customer: order.customerId, // We'll need to fetch customer name separately
          date: new Date(order.createdAt),
          status: order.status,
        });
      });

      // Add recent customers
      customers.slice(0, limit).forEach(customer => {
        activities.push({
          id: customer.id,
          type: 'customer',
          title: 'New Customer',
          customer: `${customer.firstName} ${customer.lastName}`,
          date: new Date(customer.createdAt),
          status: 'Active',
        });
      });

      // Sort by date and return top results
      return activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Update stock inventory when invoice is marked as paid
  async updateStockFromPaidInvoice(invoiceId: string): Promise<StockUpdate[]> {
    try {
      const invoice = await invoiceService.getInvoice(invoiceId);
      if (!invoice || invoice.status !== 'PAID') {
        throw new Error('Invoice not found or not paid');
      }

      const stockUpdates: StockUpdate[] = [];

      // Process each item in the invoice
      for (const item of invoice.items) {
        try {
          // Try to find a product by name in the description
          const { data: products, error: productError } = await supabase
            .from('products')
            .select('id, name, stock')
            .ilike('name', `%${item.description}%`)
            .limit(1);

          if (productError || !products || products.length === 0) {
            // If no product found, create a placeholder stock update
            const stockUpdate: StockUpdate = {
              productId: 'unknown',
              productName: item.description,
              quantitySold: item.quantity,
              previousStock: 0,
              newStock: 0,
              date: new Date(),
            };
            stockUpdates.push(stockUpdate);
            continue;
          }

          const product = products[0];
          const previousStock = Number(product.stock) || 0;
          const newStock = Math.max(0, previousStock - item.quantity);

          // Update the product stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', product.id);

          if (updateError) {
            console.error('Error updating stock for product:', product.id, updateError);
            continue;
          }

          const stockUpdate: StockUpdate = {
            productId: product.id,
            productName: product.name,
            quantitySold: item.quantity,
            previousStock,
            newStock,
            date: new Date(),
          };

          stockUpdates.push(stockUpdate);
          await this.logStockUpdate({
            productId: product.id,
            productName: product.name,
            quantitySold: item.quantity,
            previousStock,
            newStock,
            invoiceId,
          });
        } catch (itemError) {
          console.error('Error processing invoice item:', item, itemError);
        }
      }

      return stockUpdates;
    } catch (error) {
      console.error('Error updating stock from paid invoice:', error);
      throw error;
    }
  }

  // Add logStockUpdate helper
  private async logStockUpdate({ productId, productName, quantitySold, previousStock, newStock, invoiceId }: { productId: string, productName: string, quantitySold: number, previousStock: number, newStock: number, invoiceId: string }) {
    await supabase.from('stock_updates').insert([
      {
        product_id: productId,
        product_name: productName,
        quantity_sold: quantitySold,
        previous_stock: previousStock,
        new_stock: newStock,
        invoice_id: invoiceId,
        date: new Date().toISOString(),
      },
    ]);
  }

  // Get customer insights
  async getCustomerInsights() {
    try {
      const [invoices, orders, customers] = await Promise.all([
        invoiceService.getInvoices(),
        orderService.getAllOrders(),
        customerService.getAllCustomers(),
      ]);

      // Calculate customer lifetime value
      const customerRevenue = new Map<string, number>();
      
      // Add revenue from invoices
      invoices.filter(invoice => invoice.status === 'PAID').forEach(invoice => {
        const currentRevenue = customerRevenue.get(invoice.customerId) || 0;
        customerRevenue.set(invoice.customerId, currentRevenue + invoice.total);
      });

      // Add revenue from orders
      orders.forEach(order => {
        const currentRevenue = customerRevenue.get(order.customerId) || 0;
        customerRevenue.set(order.customerId, currentRevenue + (order.totalAmount || 0));
      });

      // Calculate average customer lifetime value
      const totalRevenue = Array.from(customerRevenue.values()).reduce((sum, revenue) => sum + revenue, 0);
      const averageLTV = customers.length > 0 ? totalRevenue / customers.length : 0;

      // Get top customers
      const topCustomers = Array.from(customerRevenue.entries())
        .map(([customerId, revenue]) => {
          const customer = customers.find(c => c.id === customerId);
          return {
            customerId,
            name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
            revenue,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        averageLTV,
        topCustomers,
        totalCustomers: customers.length,
        activeCustomers: customerRevenue.size,
      };
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 