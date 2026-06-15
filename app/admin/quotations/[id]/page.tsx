"use client";
import { invoiceService } from '@/lib/services/invoiceService';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDocumentTotals } from '@/lib/invoice-totals';
import { DocumentTotalsSummary } from '@/components/admin/DocumentTotalsSummary';
import { useState, useEffect } from 'react';
import { Quotation } from '@/types/invoice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QuotationDetailsPage({ params }: { params: { id: string } }) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotation() {
      try {
        console.log('Fetching quotation with ID:', params.id);
        const data = await invoiceService.getQuotation(params.id);
        console.log('Quotation details page loaded:', data);
        
        if (!data || !data.id || data.id === 'unknown') {
          setError('Quotation not found');
          setQuotation(null);
        } else {
          setQuotation(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching quotation:', err);
        setError('Failed to load quotation');
        setQuotation(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quotation...</div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">Error</div>
          <div className="text-muted-foreground">{error || 'Quotation not found'}</div>
        </div>
      </div>
    );
  }

  const totals = formatDocumentTotals(quotation);

  // Defensive helpers
  const customer = quotation.customer || {};
  const issueDate = quotation.issueDate ? (quotation.issueDate instanceof Date ? quotation.issueDate : new Date(quotation.issueDate)) : null;
  const expiryDate = quotation.expiryDate ? (quotation.expiryDate instanceof Date ? quotation.expiryDate : new Date(quotation.expiryDate)) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotation #{quotation.quotationNumber}</CardTitle>
          <div className="text-muted-foreground text-sm">Status: <Badge>{quotation.status}</Badge></div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div><b>Customer:</b> {customer.firstName || 'Unknown'} {customer.lastName || ''}</div>
            <div><b>Email:</b> {customer.email || ''}</div>
            <div><b>Issue Date:</b> {issueDate ? issueDate.toLocaleDateString('en-GB') : 'N/A'}</div>
            <div><b>Expiry Date:</b> {expiryDate ? expiryDate.toLocaleDateString('en-GB') : 'N/A'}</div>
          </div>
          <div>
            <b>Items:</b>
            <ul className="list-disc ml-6">
              {(quotation.items || []).map(item => (
                <li key={item.id}>{item.description} — Qty: {item.quantity} @ R {item.unitPrice?.toFixed ? item.unitPrice.toFixed(2) : item.unitPrice}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 max-w-md">
            <DocumentTotalsSummary totals={totals} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/admin/quotations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotations
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 