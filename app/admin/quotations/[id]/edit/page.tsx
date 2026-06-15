"use client";
import { invoiceService } from '@/lib/services/invoiceService';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Quotation, QuotationItem } from '@/types/invoice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { calculateDocumentTotals } from '@/lib/invoice-totals';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { DocumentTotalsSummary } from '@/components/admin/DocumentTotalsSummary';
import { IncludeVatToggle } from '@/components/admin/IncludeVatToggle';
import { Label } from '@/components/ui/label';

export default function EditQuotationPage({ params }: { params: { id: string } }) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [formData, setFormData] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchQuotation() {
      try {
        const data = await invoiceService.getQuotation(params.id);
        if (!data || !data.id || data.id === 'unknown') {
          setQuotation(null);
          setFormData(null);
        } else {
          setQuotation(data);
          setFormData({ ...data });
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
        setQuotation(null);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotation();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!quotation || !formData) return notFound();

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    if (!formData.items) return;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData(prev => prev ? { ...prev, items: newItems } : prev);
  };

  const addItem = () => {
    setFormData(prev => prev && prev.items ? {
      ...prev,
      items: [
        ...prev.items,
        {
          id: '',
          quotationId: prev.id,
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    } : prev);
  };

  const removeItem = (index: number) => {
    setFormData(prev => prev && prev.items && prev.items.length > 1 ? {
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    } : prev);
  };

  const totals = calculateDocumentTotals(
    formData.items ? formData.items.reduce((sum, item) => sum + item.total, 0) : 0,
    formData.deliveryFee || 0,
    formData.includeVat ?? false,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !formData.items) return;

    setSaving(true);
    try {
      // Validate form data
      const validItems = formData.items.filter(item => 
        item.description.trim() && item.quantity > 0 && item.unitPrice > 0
      );

      if (validItems.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one valid item',
          variant: 'destructive',
        });
        return;
      }

      // Prepare update data
      const updateData = {
        items: validItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        deliveryFee: formData.deliveryFee,
        includeVat: formData.includeVat ?? false,
        notes: formData.notes,
        terms: formData.terms,
      };

      await invoiceService.updateQuotation(quotation.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Quotation updated successfully',
      });

      // Redirect to quotation details page
      router.push(`/admin/quotations/${quotation.id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quotation',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Quotation #{quotation.quotationNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Notes</label>
              <Textarea
                value={formData.notes || ''}
                onChange={e => setFormData(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                placeholder="Additional notes for the quotation..."
              />
            </div>

            <div className="space-y-2">
              <label>Terms & Conditions</label>
              <Textarea
                value={formData.terms || ''}
                onChange={e => setFormData(prev => prev ? { ...prev, terms: e.target.value } : prev)}
                placeholder="Terms and conditions for the quotation..."
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Items</h3>
            {formData.items && formData.items.map((item, index) => (
              <div key={item.id || index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-6 space-y-2">
                  <label>Description *</label>
                  <Input
                    value={item.description}
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label>Quantity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label>Unit Price (R) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label>Total</label>
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
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              Add Item
            </Button>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="deliveryFee">Delivery Fee (R)</label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryFee || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, deliveryFee: parseFloat(e.target.value) || undefined } : prev)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Delivery fee will be added to the total
                </p>
              </div>
              <IncludeVatToggle
                checked={formData.includeVat ?? false}
                onCheckedChange={(checked) => setFormData(prev => prev ? { ...prev, includeVat: checked } : prev)}
              />
            </div>
            <Separator />
            <DocumentTotalsSummary totals={totals} />
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.push('/admin/quotations')}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 