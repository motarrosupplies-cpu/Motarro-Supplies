"use client";
import { invoiceService } from '@/lib/services/invoiceService';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateVatInclusive } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { CreditNote } from '@/types/invoice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreditNoteDetailsPage({ params }: { params: { id: string } }) {
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreditNote() {
      try {
        console.log('Fetching credit note with ID:', params.id);
        const data = await invoiceService.getCreditNote(params.id);
        console.log('Credit note details page loaded:', data);
        
        if (!data || !data.id || data.id === 'unknown') {
          setError('Credit note not found');
          setCreditNote(null);
        } else {
          setCreditNote(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching credit note:', err);
        setError('Failed to load credit note');
        setCreditNote(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCreditNote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading credit note...</div>
      </div>
    );
  }

  if (error || !creditNote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">Error</div>
          <div className="text-muted-foreground">{error || 'Credit note not found'}</div>
        </div>
      </div>
    );
  }

  const { subtotal, vat, total } = calculateVatInclusive(creditNote.total);

  // Defensive helpers
  const customer = creditNote.customer || {};
  const issueDate = creditNote.issueDate ? (creditNote.issueDate instanceof Date ? creditNote.issueDate : new Date(creditNote.issueDate)) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Note #{creditNote.creditNoteNumber}</CardTitle>
          <div className="text-muted-foreground text-sm">Status: <Badge>{creditNote.status}</Badge></div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div><b>Customer:</b> {customer.firstName || 'Unknown'} {customer.lastName || ''}</div>
            <div><b>Email:</b> {customer.email || ''}</div>
            <div><b>Issue Date:</b> {issueDate ? issueDate.toLocaleDateString('en-GB') : 'N/A'}</div>
            <div><b>Reason:</b> {creditNote.reason || 'N/A'}</div>
            {creditNote.invoiceId && (
              <div><b>Related Invoice:</b> {creditNote.invoiceId}</div>
            )}
          </div>
          <div>
            <b>Items:</b>
            <ul className="list-disc ml-6">
              {(creditNote.items || []).map(item => (
                <li key={item.id}>{item.description} — Qty: {item.quantity} @ R {item.unitPrice?.toFixed ? item.unitPrice.toFixed(2) : item.unitPrice}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <div><b>Subtotal (excl. VAT):</b> R {subtotal.toFixed(2)}</div>
            <div><b>VAT (15%):</b> R {vat.toFixed(2)}</div>
            <div><b>Total (incl. VAT):</b> R {total.toFixed(2)}</div>
          </div>
          {creditNote.notes && (
            <div className="mt-4">
              <b>Notes:</b> {creditNote.notes}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/admin/credit-notes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Credit Notes
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 