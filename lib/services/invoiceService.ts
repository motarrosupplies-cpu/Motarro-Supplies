import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { calculateDocumentTotals } from '@/lib/invoice-totals';
import { 
  Customer, 
  Invoice, 
  InvoiceItem,
  Quotation, 
  QuotationItem,
  CreditNote, 
  CreditNoteItem,
  CreateInvoiceData, 
  CreateQuotationData, 
  CreateCreditNoteData,
  CreateCustomerData,
  InvoiceStatus,
  QuotationStatus,
  CreditNoteStatus
} from '@/types/invoice';

export class InvoiceService {
  // Get admin client for operations that need to bypass RLS
  private getClient() {
    return supabaseAdmin || supabase;
  }

  // Customer Management
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const now = new Date().toISOString();
    const client = this.getClient();
    
    const { data: customer, error: customerError } = await client
      .from('customers')
      .insert([{
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        vat_number: data.vatNumber,
        source: data.source || 'manual',
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    if (data.address) {
      await client
        .from('addresses')
        .insert([{
          customer_id: customer.id,
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zip_code: data.address.zipCode,
          country: data.address.country,
        }]);
    }

    const { data: completeCustomer } = await client
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', customer.id)
      .single();

    return this.mapDbToCustomer(completeCustomer);
  }

  async getCustomers(): Promise<Customer[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row) => this.mapDbToCustomer(row));
  }

  async getCustomer(id: string): Promise<Customer> {
    const client = this.getClient();
    const { data, error } = await client
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', id)
      .single();

    if (error) return this.mapDbToCustomer({}); // Return a default customer on error
    return this.mapDbToCustomer(data);
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    const now = new Date().toISOString();
    const client = this.getClient();
    
    await client
      .from('customers')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        updated_at: now,
      })
      .eq('id', id);

    if (data.address) {
      await client
        .from('addresses')
        .upsert([{
          customer_id: id,
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zip_code: data.address.zipCode,
          country: data.address.country,
        }]);
    }

    const { data: updatedCustomer } = await client
      .from('customers')
      .select(`
        *,
        address:addresses(*)
      `)
      .eq('id', id)
      .single();

    return this.mapDbToCustomer(updatedCustomer);
  }

  async deleteCustomer(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Invoice Management
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const now = new Date().toISOString();
    const client = this.getClient();
    
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const includeVat = data.includeVat ?? false;
    const { subtotal, taxAmount, deliveryFee, total } = calculateDocumentTotals(
      itemsTotal,
      data.deliveryFee || 0,
      includeVat,
    );

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        customer_id: data.customerId,
        issue_date: now, // CRITICAL: Set issue_date to current date
        due_date: data.dueDate.toISOString(),
        status: 'DRAFT', // CRITICAL: Set default status
        subtotal,
        tax_amount: taxAmount,
        include_vat: includeVat,
        delivery_fee: deliveryFee > 0 ? deliveryFee : null,
        total,
        notes: data.notes,
        terms: data.terms,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      throw invoiceError;
    }

    const items = data.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      product_image: item.productImage,
      product_id: item.productId,
    }));

    const { error: itemsError } = await client
      .from('invoice_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error creating invoice items, rolling back invoice:', itemsError);
      // Rollback: Delete the invoice if items insertion fails
      await client.from('invoices').delete().eq('id', invoice.id);
      throw new Error(`Failed to create invoice items: ${itemsError.message}`);
    }

    return this.getInvoice(invoice.id) as Promise<Invoice>;
  }

  async getInvoices(): Promise<Invoice[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('invoices')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row) => this.mapDbToInvoice(row));
  }

  async getInvoice(id: string): Promise<Invoice> {
    const client = this.getClient();
    const { data, error } = await client
      .from('invoices')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapDbToInvoice(data);
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const now = new Date().toISOString();
    const client = this.getClient();
    
    await client
      .from('invoices')
      .update({ status, updated_at: now })
      .eq('id', id);

    // If invoice is marked as paid, update stock inventory
    if (status === 'PAID') {
      try {
        // Import dashboard service dynamically to avoid circular dependencies
        const { dashboardService } = await import('./dashboardService');
        await dashboardService.updateStockFromPaidInvoice(id);
        console.log(`Stock inventory updated for paid invoice ${id}`);
      } catch (error) {
        console.error('Error updating stock inventory:', error);
        // Don't throw error to avoid breaking the invoice status update
      }
    }

    return this.getInvoice(id) as Promise<Invoice>;
  }

  async updateInvoice(id: string, data: {
    items: Omit<InvoiceItem, 'id' | 'invoiceId'>[];
    deliveryFee?: number;
    includeVat?: boolean;
    notes?: string;
    terms?: string;
  }): Promise<Invoice> {
    const now = new Date().toISOString();
    
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const includeVat = data.includeVat ?? false;
    const { subtotal, taxAmount, deliveryFee, total } = calculateDocumentTotals(
      itemsTotal,
      data.deliveryFee || 0,
      includeVat,
    );

    const client = this.getClient();
    
    // Update invoice
    await client
      .from('invoices')
      .update({
        subtotal,
        tax_amount: taxAmount,
        include_vat: includeVat,
        delivery_fee: deliveryFee > 0 ? deliveryFee : null,
        total,
        notes: data.notes,
        terms: data.terms,
        updated_at: now,
      })
      .eq('id', id);

    // Delete existing items
    await client
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    // Insert new items
    const items = data.items.map(item => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      product_image: item.productImage,
      product_id: item.productId,
    }));

    const { error: itemsError } = await client
      .from('invoice_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error updating invoice items:', itemsError);
      throw new Error(`Failed to update invoice items: ${itemsError.message}`);
    }

    return this.getInvoice(id) as Promise<Invoice>;
  }

  async deleteInvoice(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Quotation Management
  async createQuotation(data: CreateQuotationData): Promise<Quotation> {
    const quotationNumber = await this.generateQuotationNumber();
    const now = new Date().toISOString();
    const client = this.getClient();
    
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const includeVat = data.includeVat ?? false;
    const { subtotal, taxAmount, deliveryFee, total } = calculateDocumentTotals(
      itemsTotal,
      data.deliveryFee || 0,
      includeVat,
    );

    const { data: quotation, error: quotationError } = await client
      .from('quotations')
      .insert([{
        quotation_number: quotationNumber,
        customer_id: data.customerId,
        issue_date: now, // CRITICAL: Set issue_date to current date
        expiry_date: data.expiryDate.toISOString(),
        status: 'DRAFT', // CRITICAL: Set default status
        subtotal,
        tax_amount: taxAmount,
        include_vat: includeVat,
        delivery_fee: deliveryFee > 0 ? deliveryFee : null,
        total,
        notes: data.notes,
        terms: data.terms,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (quotationError) {
      console.error('❌ Error creating quotation:', quotationError);
      throw quotationError;
    }

    const items = data.items.map(item => ({
      quotation_id: quotation.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      product_image: item.productImage,
      product_id: item.productId,
    }));

    // CRITICAL: Verify items insertion succeeds, rollback if it fails
    const { error: itemsError } = await client
      .from('quotation_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error creating quotation items, rolling back quotation:', itemsError);
      // Rollback: Delete the quotation if items insertion fails
      await client.from('quotations').delete().eq('id', quotation.id);
      throw new Error(`Failed to create quotation items: ${itemsError.message}`);
    }

    console.log(`✅ Created quotation ${quotation.quotation_number} with ${items.length} items`);

    // Verify quotation was created correctly with items
    const verifiedQuotation = await this.getQuotation(quotation.id);
    if (!verifiedQuotation || !verifiedQuotation.items || verifiedQuotation.items.length === 0) {
      console.error('❌ CRITICAL: Quotation created but items are missing!');
      // Attempt cleanup
      await client.from('quotations').delete().eq('id', quotation.id);
      throw new Error('Quotation was created but items were not saved correctly');
    }

    return verifiedQuotation;
  }

  async getQuotations(): Promise<Quotation[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('quotations')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:quotation_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row) => this.mapDbToQuotation(row));
  }

  async getQuotation(id: string): Promise<Quotation> {
    console.log('getQuotation called with id:', id);
    const client = this.getClient();
    const { data, error } = await client
      .from('quotations')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:quotation_items(*)
      `)
      .eq('id', id)
      .single();

    console.log('Supabase raw quotation data:', data, error);
    console.log('Supabase error details:', error);
    if (error) throw error;
    const mapped = this.mapDbToQuotation(data);
    console.log('Mapped quotation:', mapped);
    return mapped;
  }

  async updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    const now = new Date().toISOString();
    const client = this.getClient();
    
    await client
      .from('quotations')
      .update({ status, updated_at: now })
      .eq('id', id);

    return this.getQuotation(id) as Promise<Quotation>;
  }

  async updateQuotation(id: string, data: {
    items: Omit<QuotationItem, 'id' | 'quotationId'>[];
    deliveryFee?: number;
    includeVat?: boolean;
    notes?: string;
    terms?: string;
  }): Promise<Quotation> {
    const now = new Date().toISOString();
    
    const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const includeVat = data.includeVat ?? false;
    const { subtotal, taxAmount, deliveryFee, total } = calculateDocumentTotals(
      itemsTotal,
      data.deliveryFee || 0,
      includeVat,
    );

    const client = this.getClient();
    
    // Update quotation
    await client
      .from('quotations')
      .update({
        subtotal,
        tax_amount: taxAmount,
        include_vat: includeVat,
        delivery_fee: deliveryFee > 0 ? deliveryFee : null,
        total,
        notes: data.notes,
        terms: data.terms,
        updated_at: now,
      })
      .eq('id', id);

    // Delete existing items
    await client
      .from('quotation_items')
      .delete()
      .eq('quotation_id', id);

    // Insert new items
    const items = data.items.map(item => ({
      quotation_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      product_image: item.productImage,
      product_id: item.productId,
    }));

    const { error: itemsError } = await client
      .from('quotation_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error updating quotation items:', itemsError);
      throw new Error(`Failed to update quotation items: ${itemsError.message}`);
    }

    return this.getQuotation(id) as Promise<Quotation>;
  }

  async deleteQuotation(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async convertQuotationToInvoice(quotationId: string): Promise<Invoice> {
    // First, get the quotation with all its data
    const quotation = await this.getQuotation(quotationId);
    if (!quotation || !quotation.id || quotation.id === 'unknown') {
      throw new Error('Quotation not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();
    const now = new Date().toISOString();
    
    // Set due date to 30 days from now (or you can customize this)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const client = this.getClient();
    
    // Create the invoice
    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        customer_id: quotation.customerId,
        issue_date: now, // CRITICAL: Set issue_date to current date
        due_date: dueDate.toISOString(),
        status: 'DRAFT', // CRITICAL: Set default status
        subtotal: quotation.subtotal,
        tax_amount: quotation.taxAmount,
        include_vat: quotation.includeVat,
        delivery_fee: quotation.deliveryFee ? quotation.deliveryFee : null,
        total: quotation.total,
        notes: quotation.notes,
        terms: quotation.terms,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice from quotation:', invoiceError);
      throw invoiceError;
    }

    // Copy the items from quotation to invoice
    if (quotation.items && quotation.items.length > 0) {
      const items = quotation.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
        product_image: item.productImage,
        product_id: item.productId,
      }));

      const { error: itemsError } = await client
        .from('invoice_items')
        .insert(items);
      
      if (itemsError) {
        // Rollback invoice if items fail
        await client.from('invoices').delete().eq('id', invoice.id);
        throw itemsError;
      }
    }

    // Update quotation status to indicate it was converted
    const { error: statusError } = await client
      .from('quotations')
      .update({ status: 'CONVERTED', updated_at: now })
      .eq('id', quotationId);
    
    if (statusError) throw statusError;

    // Return the created invoice
    return this.getInvoice(invoice.id) as Promise<Invoice>;
  }

  // Credit Note Management
  async createCreditNote(data: CreateCreditNoteData): Promise<CreditNote> {
    const creditNoteNumber = await this.generateCreditNoteNumber();
    const now = new Date().toISOString();
    
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.15;
    const total = subtotal + taxAmount;

    const client = this.getClient();
    const { data: creditNote, error: creditNoteError } = await client
      .from('credit_notes')
      .insert([{
        credit_note_number: creditNoteNumber,
        customer_id: data.customerId,
        invoice_id: data.invoiceId,
        issue_date: now, // CRITICAL: Set issue_date to current date
        status: 'DRAFT', // CRITICAL: Set default status
        reason: data.reason,
        subtotal,
        tax_amount: taxAmount,
        total,
        notes: data.notes,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single();

    if (creditNoteError) {
      console.error('Error creating credit note:', creditNoteError);
      throw creditNoteError;
    }

    const items = data.items.map(item => ({
      credit_note_id: creditNote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await client
      .from('credit_note_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error creating credit note items, rolling back credit note:', itemsError);
      await client.from('credit_notes').delete().eq('id', creditNote.id);
      throw new Error(`Failed to create credit note items: ${itemsError.message}`);
    }

    return this.getCreditNote(creditNote.id) as Promise<CreditNote>;
  }

  async getCreditNotes(): Promise<CreditNote[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('credit_notes')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:credit_note_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row) => this.mapDbToCreditNote(row));
  }

  async getCreditNote(id: string): Promise<CreditNote> {
    const client = this.getClient();
    const { data, error } = await client
      .from('credit_notes')
      .select(`
        *,
        customer:customers(
          *,
          address:addresses(*)
        ),
        items:credit_note_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) return this.mapDbToCreditNote({}); // Return a default credit note on error
    return this.mapDbToCreditNote(data);
  }

  async updateCreditNoteStatus(id: string, status: CreditNoteStatus): Promise<CreditNote> {
    const now = new Date().toISOString();
    const client = this.getClient();
    
    await client
      .from('credit_notes')
      .update({ status, updated_at: now })
      .eq('id', id);

    return this.getCreditNote(id) as Promise<CreditNote>;
  }

  async updateCreditNote(id: string, data: {
    items: Omit<CreditNoteItem, 'id' | 'creditNoteId'>[];
    reason: string;
    notes?: string;
  }): Promise<CreditNote> {
    const now = new Date().toISOString();
    
    // Calculate new totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.15;
    const total = subtotal + taxAmount;

    const client = this.getClient();
    
    // Update credit note
    await client
      .from('credit_notes')
      .update({
        subtotal,
        tax_amount: taxAmount,
        total,
        reason: data.reason,
        notes: data.notes,
        updated_at: now,
      })
      .eq('id', id);

    // Delete existing items
    await client
      .from('credit_note_items')
      .delete()
      .eq('credit_note_id', id);

    // Insert new items
    const items = data.items.map(item => ({
      credit_note_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await client
      .from('credit_note_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Error updating credit note items:', itemsError);
      throw new Error(`Failed to update credit note items: ${itemsError.message}`);
    }

    return this.getCreditNote(id) as Promise<CreditNote>;
  }

  async deleteCreditNote(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('credit_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Helper methods for generating document numbers
  /**
   * Generate next invoice number atomically to avoid duplicates under concurrency.
   * Uses DB sequence via get_next_invoice_number() when available; falls back to max+1.
   */
  private async generateInvoiceNumber(): Promise<string> {
    const client = this.getClient();
    const { data: seqData, error: rpcError } = await client.rpc('get_next_invoice_number');
    if (!rpcError && seqData && typeof seqData === 'string') {
      return seqData;
    }
    // Fallback when sequence/RPC not yet deployed (e.g. migration not run)
    const { data } = await client
      .from('invoices')
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1);

    const lastNumber = data && data[0] ? parseInt(data[0].invoice_number.replace('INV-', ''), 10) : 0;
    return `INV-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  private async generateQuotationNumber(): Promise<string> {
    const client = this.getClient();
    const { data } = await client
      .from('quotations')
      .select('quotation_number')
      .order('quotation_number', { ascending: false })
      .limit(1);
    
    const lastNumber = data && data[0] ? parseInt(data[0].quotation_number.replace('QUO-', '')) : 0;
    return `QUO-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  private async generateCreditNoteNumber(): Promise<string> {
    const client = this.getClient();
    const { data } = await client
      .from('credit_notes')
      .select('credit_note_number')
      .order('credit_note_number', { ascending: false })
      .limit(1);
    
    const lastNumber = data && data[0] ? parseInt(data[0].credit_note_number.replace('CN-', '')) : 0;
    return `CN-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  // Mapping methods
  private mapDbToCustomer(dbCustomer: any): Customer {
    if (!dbCustomer) {
      return {
        id: 'unknown',
        firstName: 'Unknown',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: undefined,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      };
    }
    return {
      id: dbCustomer.id,
      firstName: dbCustomer.first_name,
      lastName: dbCustomer.last_name,
      email: dbCustomer.email,
      phone: dbCustomer.phone,
      company: dbCustomer.company,
      address: dbCustomer.address ? {
        id: dbCustomer.address.id,
        street: dbCustomer.address.street,
        city: dbCustomer.address.city,
        state: dbCustomer.address.state,
        zipCode: dbCustomer.address.zip_code,
        country: dbCustomer.address.country,
        customerId: dbCustomer.address.customer_id,
      } : undefined,
      createdAt: new Date(dbCustomer.created_at),
      updatedAt: new Date(dbCustomer.updated_at),
    };
  }

  private mapDbToInvoice(dbInvoice: any): Invoice {
    // Handle missing issue_date by using created_at as fallback
    const issueDate = dbInvoice.issue_date || dbInvoice.created_at;
    // Handle missing status by defaulting to DRAFT
    const status = dbInvoice.status || 'DRAFT';
    
    return {
      id: dbInvoice.id,
      invoiceNumber: dbInvoice.invoice_number,
      customerId: dbInvoice.customer_id,
      customer: this.mapDbToCustomer(dbInvoice.customer),
      issueDate: new Date(issueDate),
      dueDate: new Date(dbInvoice.due_date),
      status: status as InvoiceStatus,
      subtotal: dbInvoice.subtotal,
      taxAmount: dbInvoice.tax_amount,
      deliveryFee: dbInvoice.delivery_fee ? Number(dbInvoice.delivery_fee) : undefined,
      includeVat: dbInvoice.include_vat ?? Number(dbInvoice.tax_amount) > 0,
      total: dbInvoice.total,
      notes: dbInvoice.notes,
      terms: dbInvoice.terms,
      createdAt: new Date(dbInvoice.created_at),
      updatedAt: new Date(dbInvoice.updated_at),
      items: (dbInvoice.items ?? []).map((item: any) => ({
        id: item.id,
        invoiceId: item.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
        productImage: item.product_image,
        productId: item.product_id,
      })),
    };
  }

  private mapDbToQuotation(dbQuotation: any): Quotation {
    // Handle missing issue_date by using created_at as fallback
    const issueDate = dbQuotation.issue_date || dbQuotation.created_at;
    // Handle missing status by defaulting to DRAFT
    const status = dbQuotation.status || 'DRAFT';
    
    return {
      id: dbQuotation.id,
      quotationNumber: dbQuotation.quotation_number,
      customerId: dbQuotation.customer_id,
      customer: this.mapDbToCustomer(dbQuotation.customer),
      issueDate: new Date(issueDate),
      expiryDate: new Date(dbQuotation.expiry_date),
      status: status as QuotationStatus,
      subtotal: dbQuotation.subtotal,
      taxAmount: dbQuotation.tax_amount,
      deliveryFee: dbQuotation.delivery_fee ? Number(dbQuotation.delivery_fee) : undefined,
      includeVat: dbQuotation.include_vat ?? Number(dbQuotation.tax_amount) > 0,
      total: dbQuotation.total,
      notes: dbQuotation.notes,
      terms: dbQuotation.terms,
      createdAt: new Date(dbQuotation.created_at),
      updatedAt: new Date(dbQuotation.updated_at),
      items: (dbQuotation.items ?? []).map((item: any) => ({
        id: item.id,
        quotationId: item.quotation_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
        productImage: item.product_image,
        productId: item.product_id,
      })),
    };
  }

  private mapDbToCreditNote(dbCreditNote: any): CreditNote {
    // Handle missing issue_date by using created_at as fallback
    const issueDate = dbCreditNote.issue_date || dbCreditNote.created_at;
    // Handle missing status by defaulting to DRAFT
    const status = dbCreditNote.status || 'DRAFT';
    
    return {
      id: dbCreditNote.id,
      creditNoteNumber: dbCreditNote.credit_note_number,
      customerId: dbCreditNote.customer_id,
      customer: this.mapDbToCustomer(dbCreditNote.customer),
      invoiceId: dbCreditNote.invoice_id,
      issueDate: new Date(issueDate),
      status: status as CreditNoteStatus,
      subtotal: dbCreditNote.subtotal,
      taxAmount: dbCreditNote.tax_amount,
      total: dbCreditNote.total,
      reason: dbCreditNote.reason,
      notes: dbCreditNote.notes,
      createdAt: new Date(dbCreditNote.created_at),
      updatedAt: new Date(dbCreditNote.updated_at),
      items: (dbCreditNote.items ?? []).map((item: any) => ({
        id: item.id,
        creditNoteId: item.credit_note_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
    };
  }
}

export const invoiceService = new InvoiceService(); 