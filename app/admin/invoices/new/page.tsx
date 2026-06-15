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
import { calculateDocumentTotals } from '@/lib/invoice-totals';
import { Customer, CreateInvoiceData, InvoiceItem } from '@/types/invoice';
import { DocumentTotalsSummary } from '@/components/admin/DocumentTotalsSummary';
import { IncludeVatToggle } from '@/components/admin/IncludeVatToggle';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProductAutocomplete } from '@/components/admin/ProductAutocomplete';

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInvoiceData>({
    customerId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      }
    ],
    notes: '',
    terms: 'Payment due within 30 days',
    includeVat: false,
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

  const handleInputChange = (field: keyof CreateInvoiceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        }
      ],
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

  const totals = calculateDocumentTotals(
    formData.items.reduce((sum, item) => sum + item.total, 0),
    formData.deliveryFee || 0,
    formData.includeVat ?? false,
  );

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
      const invoice = await invoiceService.createInvoice(formData);
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
      router.push(`/admin/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setCustomerError('');
    
    // Validate required fields
    if (!newCustomer.firstName.trim() || !newCustomer.lastName.trim() || !newCustomer.phone.trim()) {
      setCustomerError('First name, last name, and phone are required.');
      return;
    }

    setCreatingCustomer(true);
    
    try {
      console.log('Creating customer with data:', newCustomer);
      
      const created = await invoiceService.createCustomer({
        firstName: newCustomer.firstName.trim(),
        lastName: newCustomer.lastName.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim() || '',
        company: newCustomer.company.trim() || undefined,
        vatNumber: newCustomer.vatNumber.trim() || undefined,
        address: {
          street: newCustomer.address.street.trim() || '',
          city: newCustomer.address.city.trim() || '',
          state: newCustomer.address.state.trim() || '',
          zipCode: newCustomer.address.zipCode.trim() || '',
          country: newCustomer.address.country.trim() || '',
        },
        source: 'manual',
      });

      console.log('Customer created successfully:', created);
      
      setCustomers(prev => [...prev, created]);
      setFormData(prev => ({ ...prev, customerId: created.id }));
      setShowCustomerModal(false);
      setNewCustomer({ 
        firstName: '', 
        lastName: '', 
        phone: '', 
        email: '', 
        company: '', 
        vatNumber: '', 
        address: { street: '', city: '', state: '', zipCode: '', country: '' } 
      });
      toast({ title: 'Success', description: 'Customer created successfully.' });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage = error?.message || error?.error || 'Failed to create customer';
      setCustomerError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setCreatingCustomer(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">
            Create a new invoice for your customer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Select customer and set invoice information
            </CardDescription>
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
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('dueDate', new Date(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>
              Add products or services to this invoice
            </CardDescription>
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
                        // Update all fields in a single state update
                        const newItems = [...formData.items];
                        newItems[index] = {
                          ...newItems[index],
                          description: product.name,
                          unitPrice: product.price,
                          productImage: product.image || '',
                          productId: product.id,
                          total: newItems[index].quantity * product.price
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          items: newItems
                        }));
                      } else if (typeof customValue === 'string') {
                        handleItemChange(index, 'description', customValue);
                        handleItemChange(index, 'productImage', '');
                        handleItemChange(index, 'productId', '');
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
                  <div className="text-sm font-medium">
                    R {item.total.toFixed(2)}
                  </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <IncludeVatToggle
              checked={formData.includeVat ?? false}
              onCheckedChange={(checked) => handleInputChange('includeVat', checked)}
            />
            <DocumentTotalsSummary totals={totals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Fee</CardTitle>
            <CardDescription>Add a delivery fee to this invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee (R)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.deliveryFee || ''}
                onChange={(e) => handleInputChange('deliveryFee', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Delivery fee will be added to the total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Terms */}
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
                placeholder="Additional notes for the customer"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder="Payment terms and conditions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/invoices">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Invoice'}
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
              <form onSubmit={(e) => { e.preventDefault(); handleCreateCustomer(); }} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      placeholder="First Name *" 
                      value={newCustomer.firstName} 
                      onChange={e => setNewCustomer(c => ({ ...c, firstName: e.target.value }))} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name *" 
                      value={newCustomer.lastName} 
                      onChange={e => setNewCustomer(c => ({ ...c, lastName: e.target.value }))} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      placeholder="Phone *" 
                      value={newCustomer.phone} 
                      onChange={e => setNewCustomer(c => ({ ...c, phone: e.target.value }))} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email" 
                      value={newCustomer.email} 
                      onChange={e => setNewCustomer(c => ({ ...c, email: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company"
                      name="company"
                      placeholder="Company" 
                      value={newCustomer.company} 
                      onChange={e => setNewCustomer(c => ({ ...c, company: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number</Label>
                    <Input 
                      id="vatNumber"
                      name="vatNumber"
                      placeholder="VAT Number" 
                      value={newCustomer.vatNumber} 
                      onChange={e => setNewCustomer(c => ({ ...c, vatNumber: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input 
                      id="street"
                      name="street"
                      placeholder="Street" 
                      value={newCustomer.address.street} 
                      onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, street: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      name="city"
                      placeholder="City" 
                      value={newCustomer.address.city} 
                      onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, city: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state"
                      name="state"
                      placeholder="State" 
                      value={newCustomer.address.state} 
                      onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, state: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input 
                      id="zipCode"
                      name="zipCode"
                      placeholder="Zip Code" 
                      value={newCustomer.address.zipCode} 
                      onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, zipCode: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country"
                      name="country"
                      placeholder="Country" 
                      value={newCustomer.address.country} 
                      onChange={e => setNewCustomer(c => ({ ...c, address: { ...c.address, country: e.target.value } }))} 
                    />
                  </div>
                  {customerError && <div className="text-red-600 text-sm">{customerError}</div>}
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCustomerModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingCustomer}>
                    {creatingCustomer ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 