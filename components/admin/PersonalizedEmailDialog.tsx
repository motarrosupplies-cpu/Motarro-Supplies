'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Send, X } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { pdfGenerator } from '@/lib/utils/pdfGenerator';
import { getAdminAuthHeaders } from '@/lib/auth/adminFetch';

interface PersonalizedEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function PersonalizedEmailDialog({ open, onOpenChange, invoice }: PersonalizedEmailDialogProps) {
  const [email, setEmail] = useState(invoice.customer?.email || '');
  const [subject, setSubject] = useState(`Invoice ${invoice.invoiceNumber} - Payment Due`);
  const [message, setMessage] = useState(`Dear ${invoice.customer?.firstName || 'Valued Customer'},

Please find attached your invoice ${invoice.invoiceNumber} for the amount of R ${invoice.total.toFixed(2)}.

Payment is due by ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
MOTARRO Supplies Team`);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a subject',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Generate PDF
      const pdf = await pdfGenerator.generateInvoicePDF(invoice);
      const pdfBase64 = btoa(
        new Uint8Array(pdf.output('arraybuffer'))
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Send email with PDF attachment
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({
          to: email,
          subject: subject,
          message: message,
          pdfBase64: pdfBase64,
          invoiceNumber: invoice.invoiceNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      toast({
        title: 'Success',
        description: `Email sent successfully to ${email}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Personalized Email
          </DialogTitle>
          <DialogDescription>
            Send a personalized email with the invoice PDF attachment to your customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Customer Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Invoice subject line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your personalized message..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The invoice PDF will be automatically attached to this email.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={sending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
