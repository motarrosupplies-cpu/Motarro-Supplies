import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  vatNumber?: string;
  source?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

class CustomerService {
  // Create a new customer in Supabase
  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> {
    const now = new Date().toISOString();
    
    // Insert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (customerError) {
      console.error('Supabase createCustomer error:', customerError);
      return null;
    }

    // Insert address if provided
    if (customerData.address) {
      await supabase
        .from('addresses')
        .insert([{
          customer_id: customer.id,
          street: customerData.address.street,
          city: customerData.address.city,
          state: customerData.address.state,
          zip_code: customerData.address.zipCode,
          country: customerData.address.country,
        }]);
    }

    // Get complete customer with address
    const { data: completeCustomer } = await supabase
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', customer.id)
      .single();

    return this.mapDbToCustomer(completeCustomer);
  }

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('email', email)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapDbToCustomer(data);
  }

  // Get customer by ID
  async getCustomerById(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', customerId)
      .single();
    if (error) return null;
    return this.mapDbToCustomer(data);
  }

  // Update customer
  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer | null> {
    const now = new Date().toISOString();
    
    // Update customer
    await supabase
      .from('customers')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        updated_at: now,
      })
      .eq('id', customerId);

    // Update address if provided
    if (data.address) {
      await supabase
        .from('addresses')
        .upsert([{
          customer_id: customerId,
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zip_code: data.address.zipCode,
          country: data.address.country,
        }]);
    }

    // Get updated customer
    const { data: updatedCustomer } = await supabase
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', customerId)
      .single();

    return this.mapDbToCustomer(updatedCustomer);
  }

  // Get all customers
  async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(this.mapDbToCustomer);
  }

  // Get customer stats
  async getCustomerStats() {
    const customers = await this.getAllCustomers();
    const totalCustomers = customers.length;
    // No totalSpent or orders fields in schema, so just return totalCustomers
    return {
      totalCustomers,
    };
  }

  // Delete customer
  async deleteCustomer(customerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    if (error) {
      console.error('Supabase deleteCustomer error:', error);
      return false;
    }
    return true;
  }

  // Helper to map DB row to Customer
  private mapDbToCustomer(row: any): Customer {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      vatNumber: row.vat_number,
      source: row.source,
      address: row.address ? {
        street: row.address.street,
        city: row.address.city,
        state: row.address.state,
        zipCode: row.address.zip_code,
        country: row.address.country,
      } : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const customerService = new CustomerService(); 