'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Receipt, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { invoiceService } from '@/lib/services/invoiceService';
import { Quotation, QuotationStatus } from '@/types/invoice';
import { pdfGenerator } from '@/lib/utils/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('Current user:', user);
    });
  }, []);

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchTerm, statusFilter]);

  const loadQuotations = async () => {
    try {
      const data = await invoiceService.getQuotations();
      console.log('Fetched quotations:', data);
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = quotations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quotation =>
        quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${quotation.customer.firstName} ${quotation.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quotation => quotation.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  };

  const handleStatusUpdate = async (quotationId: string, newStatus: QuotationStatus) => {
    try {
      await invoiceService.updateQuotationStatus(quotationId, newStatus);
      await loadQuotations();
      toast({
        title: 'Success',
        description: 'Quotation status updated successfully',
      });
    } catch (error) {
      console.error('Error updating quotation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quotation status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        await invoiceService.deleteQuotation(quotationId);
        await loadQuotations();
        toast({
          title: 'Success',
          description: 'Quotation deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete quotation',
          variant: 'destructive',
        });
      }
    }
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    try {
      toast({
        title: 'Converting...',
        description: 'Converting quotation to invoice...',
      });

      const invoice = await invoiceService.convertQuotationToInvoice(quotation.id);
      
      toast({
        title: 'Success',
        description: `Quotation converted to invoice ${invoice.invoiceNumber}`,
      });

      // Redirect to the new invoice for review and finalization
      router.push(`/admin/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert quotation to invoice',
        variant: 'destructive',
      });
    }
  };

  const downloadPDF = async (quotation: Quotation) => {
    try {
      const pdf = await pdfGenerator.generateQuotationPDF(quotation);
      pdf.save(`${quotation.quotationNumber}.pdf`);
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quotations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage and track all customer quotations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quotations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No quotations found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first quotation.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild className="mt-4">
                  <Link href="/admin/quotations/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quotation
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {quotation.customer?.firstName || 'Unknown'} {quotation.customer?.lastName || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quotation.customer?.email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(quotation.issueDate).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      {new Date(quotation.expiryDate).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="font-medium">
                      R {quotation.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadPDF(quotation)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quotations/${quotation.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quotations/${quotation.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {quotation.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(quotation.id, 'SENT')}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {quotation.status === 'SENT' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation.id, 'ACCEPTED')}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Mark as Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation.id, 'REJECTED')}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Mark as Rejected
                              </DropdownMenuItem>
                            </>
                          )}
                          {quotation.status === 'ACCEPTED' && (
                            <DropdownMenuItem onClick={() => handleConvertToInvoice(quotation)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Convert to Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuotation(quotation.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 