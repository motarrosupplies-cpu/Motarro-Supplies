'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { invoiceService } from '@/lib/services/invoiceService';
import { Customer, CreateCreditNoteData, CreditNoteItem, Invoice } from '@/types/invoice';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProductAutocomplete } from '@/components/admin/ProductAutocomplete';

export default function NewCreditNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCreditNoteData>({
    customerId: '',
    invoiceId: '',
    reason: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
  });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    vatNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState('');

  useEffect(() => {
    loadCustomers();
    loadInvoices();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await invoiceService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    }
  };

  const loadInvoices = async () => {
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const handleInputChange = (field: keyof CreateCreditNoteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof CreditNoteItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.total, 0);
  const calculateTax = () => calculateTotal() * 15 / 115;
  const calculateSubtotal = () => calculateTotal() - calculateTax();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the credit note',
        variant: 'destructive',
      });
      return;
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: 'Error',
        description: 'Please fill in all item details correctly',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const creditNote = await invoiceService.createCreditNote(formData);
      toast({
        title: 'Success',
        description: 'Credit note created successfully',
      });
      router.push(`/admin/credit-notes/${creditNote.id}`);
    } catch (error) {
      console.error('Error creating credit note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create credit note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setCustomerError('');
    if (!newCustomer.firstName.trim() || !newCustomer.lastName.trim() || !newCustomer.phone.trim()) {
      setCustomerError('First name, last name, and phone are required.');
      return;
    }
    setCreatingCustomer(true);
    try {
      const created = await invoiceService.createCustomer({
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        phone: newCustomer.phone,
        email: newCustomer.email,
        company: newCustomer.company,
        vatNumber: newCustomer.vatNumber,
        address: {
          street: newCustomer.address.street,
          city: newCustomer.address.city,
          state: newCustomer.address.state,
          zipCode: newCustomer.address.zipCode,
          country: newCustomer.address.country,
        },
        source: 'manual',
      });
      setCustomers(prev => [...prev, created]);
      setFormData(prev => ({ ...prev, customerId: created.id }));
      setShowCustomerModal(false);
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '', company: '', vatNumber: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
      toast({ title: 'Success', description: 'Customer created.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to create customer', variant: 'destructive' });
    } finally {
      setCreatingCustomer(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    !formData.customerId || invoice.customerId === formData.customerId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/credit-notes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Credit Notes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Credit Note</h1>
          <p className="text-muted-foreground">Create a new credit note for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Note Details</CardTitle>
            <CardDescription>Select customer and provide credit note information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => {
                    if (value === '__add_new__') {
                      setShowCustomerModal(true);
                      return;
                    }
                    handleInputChange('customerId', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__add_new__" className="text-primary font-semibold">
                      + Add New Customer
                    </SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice">Related Invoice (Optional)</Label>
                <Select
                  value={formData.invoiceId || '__none__'}
                  onValueChange={(value) => {
                    handleInputChange('invoiceId', value === '__none__' ? undefined : value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No invoice selected</SelectItem>
                    {filteredInvoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - R {invoice.total.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Credit Note *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Explain why this credit note is being issued"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Note Items</CardTitle>
            <CardDescription>Add items to be credited</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-6 space-y-2">
                  <Label htmlFor={`description-${index}`}>Description *</Label>
                  <ProductAutocomplete
                    value={item.description}
                    onSelect={(product, customValue) => {
                      if (product) {
                        handleItemChange(index, 'description', product.name);
                        handleItemChange(index, 'unitPrice', product.price);
                      } else if (typeof customValue === 'string') {
                        handleItemChange(index, 'description', customValue);
                      }
                    }}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price (R) *</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>Total</Label>
                  <div className="text-sm font-medium">R {item.total.toFixed(2)}</div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Note Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%):</span>
                <span>R {calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Credit:</span>
                <span>R {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this credit note"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/credit-notes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Credit Note'}
          </Button>
        </div>
      </form>

      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 overflow-hidden">
          <div className="h-full overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--primary) / 0.4) hsl(var(--muted))'
          }}>
            <div className="p-6">
              <DialogHeader className="sticky top-0 z-10 bg-background pb-4">
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="First Name *" value={newCustomer.firstName} onChange={e => setNewCustomer(c => ({ ...c, firstName: e.target.value }))} />
                <Input placeholder="Last Name *" value={newCustomer.lastName} onChange={e => setNewCustomer(c => ({ ...c, lastName: e.target.value }))} />
                <Input placeholder="Phone *" value={newCustomer.phone} onChange={e => setNewCustomer(c => ({ ...c, phone: e.target.value }))} />
                <Input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer(c => ({ ...c, email: e.target.value }))} />
                <Input placeholder="Company" value={newCustomer.company} onChange={e => setNewCustomer(c => ({ ...c, company: e.target.value }))} />
                <Input placeholder="VAT Number" value={newCustomer.vatNumber} onChange={e => setNewCustomer(c => ({ ...c, vatNumber: e.target.value }))} />
                <Input placeholder="Street" value={newCustomer.address.street} onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, street: e.target.value } }))} />
                <Input placeholder="City" value={newCustomer.address.city} onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, city: e.target.value } }))} />
                <Input placeholder="State" value={newCustomer.address.state} onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, state: e.target.value } }))} />
                <Input placeholder="Zip Code" value={newCustomer.address.zipCode} onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, zipCode: e.target.value } }))} />
                <Input placeholder="Country" value={newCustomer.address.country} onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, country: e.target.value } }))} />
                {customerError && <div className="text-red-600 text-sm">{customerError}</div>}
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCustomerModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomer} disabled={creatingCustomer}>
                  {creatingCustomer ? 'Creating...' : 'Create Customer'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 