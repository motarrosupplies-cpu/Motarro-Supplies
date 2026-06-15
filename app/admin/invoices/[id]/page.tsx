"use client";
import { invoiceService } from '@/lib/services/invoiceService';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDocumentTotals } from '@/lib/invoice-totals';
import { DocumentTotalsSummary } from '@/components/admin/DocumentTotalsSummary';
import { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Printer, Mail } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { pdfGenerator } from '@/lib/utils/pdfGenerator';
import { PersonalizedEmailDialog } from '@/components/admin/PersonalizedEmailDialog';

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoice() {
      try {
        console.log('Fetching invoice with ID:', params.id);
        const data = await invoiceService.getInvoice(params.id);
        console.log('Invoice details page loaded:', data);
        
        if (!data || !data.id || data.id === 'unknown') {
          setError('Invoice not found');
          setInvoice(null);
        } else {
          setInvoice(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice');
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    
    setUpdating(true);
    try {
      await invoiceService.updateInvoiceStatus(invoice.id, newStatus);
      setInvoice(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: 'Success',
        description: `Invoice marked as ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!invoice) return;
    
    try {
      const pdf = await pdfGenerator.generateInvoicePDF(invoice);
      
      // Open print dialog with PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create a new window for printing
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast({
        title: 'Success',
        description: 'Invoice PDF opened for printing',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF for printing',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = () => {
    setShowEmailDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">Error</div>
          <div className="text-muted-foreground">{error || 'Invoice not found'}</div>
        </div>
      </div>
    );
  }

  const totals = formatDocumentTotals(invoice);

  // Defensive helpers
  const customer = invoice.customer || {};
  const issueDate = invoice.issueDate ? (invoice.issueDate instanceof Date ? invoice.issueDate : new Date(invoice.issueDate)) : null;
  const dueDate = invoice.dueDate ? (invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate)) : null;

  // Check if this is a converted invoice (recently created)
  const isConvertedInvoice = invoice.createdAt && 
    new Date(invoice.createdAt).getTime() > Date.now() - (5 * 60 * 1000); // Created within last 5 minutes

  return (
    <div className="space-y-6">
      {isConvertedInvoice && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Invoice created from quotation</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Review the invoice details below and finalize when ready.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
              <div className="text-muted-foreground text-sm">Status: <Badge>{invoice.status}</Badge></div>
            </div>
            {invoice.status === 'DRAFT' && (
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrintInvoice}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  variant="outline"
                  className="border-purple-300 hover:bg-purple-50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('SENT')}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {updating ? 'Sending...' : 'Send to Customer'}
                </Button>
              </div>
            )}
            {invoice.status === 'SENT' && (
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrintInvoice}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  variant="outline"
                  className="border-purple-300 hover:bg-purple-50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('PAID')}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {updating ? 'Marking...' : 'Mark as Paid'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div><b>Customer:</b> {customer.firstName || 'Unknown'} {customer.lastName || ''}</div>
            <div><b>Email:</b> {customer.email || ''}</div>
            <div><b>Issue Date:</b> {issueDate ? issueDate.toLocaleDateString('en-GB') : 'N/A'}</div>
            <div><b>Due Date:</b> {dueDate ? dueDate.toLocaleDateString('en-GB') : 'N/A'}</div>
          </div>
          <div>
            <b>Items:</b>
            <ul className="list-disc ml-6">
              {(invoice.items || []).map(item => (
                <li key={item.id}>{item.description} — Qty: {item.quantity} @ R {item.unitPrice?.toFixed ? item.unitPrice.toFixed(2) : item.unitPrice}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 max-w-md">
            <DocumentTotalsSummary totals={totals} />
          </div>
          {invoice.notes && (
            <div className="mt-4">
              <b>Notes:</b> {invoice.notes}
            </div>
          )}
          {invoice.terms && (
            <div className="mt-4">
              <b>Terms:</b> {invoice.terms}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/invoices/${invoice.id}/edit`}>
              Edit Invoice
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Personalized Email Dialog */}
      {invoice && (
        <PersonalizedEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          invoice={invoice}
        />
      )}
    </div>
  );
} 