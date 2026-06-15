export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  customerId: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productImage?: string;
  productId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee?: number;
  includeVat: boolean;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceItem[];
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productImage?: string;
  productId?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer: Customer;
  issueDate: Date;
  expiryDate: Date;
  status: QuotationStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee?: number;
  includeVat: boolean;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  items: QuotationItem[];
}

export interface CreditNoteItem {
  id: string;
  creditNoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customer: Customer;
  invoiceId?: string;
  issueDate: Date;
  status: CreditNoteStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: CreditNoteItem[];
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
export type CreditNoteStatus = 'DRAFT' | 'SENT' | 'APPLIED' | 'CANCELLED';

export interface CreateInvoiceData {
  customerId: string;
  dueDate: Date;
  items: Omit<InvoiceItem, 'id' | 'invoiceId'>[];
  deliveryFee?: number;
  includeVat?: boolean;
  notes?: string;
  terms?: string;
}

export interface CreateQuotationData {
  customerId: string;
  expiryDate: Date;
  items: Omit<QuotationItem, 'id' | 'quotationId'>[];
  deliveryFee?: number;
  includeVat?: boolean;
  notes?: string;
  terms?: string;
}

export interface CreateCreditNoteData {
  customerId: string;
  invoiceId?: string;
  reason: string;
  items: Omit<CreditNoteItem, 'id' | 'creditNoteId'>[];
  notes?: string;
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  address?: Omit<Address, 'id' | 'customerId'>;
  source?: string;
} 