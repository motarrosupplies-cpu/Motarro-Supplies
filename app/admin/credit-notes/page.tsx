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
  UserCheck, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { invoiceService } from '@/lib/services/invoiceService';
import { CreditNote, CreditNoteStatus } from '@/types/invoice';
import { pdfGenerator } from '@/lib/utils/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [filteredCreditNotes, setFilteredCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadCreditNotes();
  }, []);

  useEffect(() => {
    filterCreditNotes();
  }, [creditNotes, searchTerm, statusFilter]);

  const loadCreditNotes = async () => {
    try {
      const data = await invoiceService.getCreditNotes();
      setCreditNotes(data);
    } catch (error) {
      console.error('Error loading credit notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCreditNotes = () => {
    let filtered = creditNotes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(creditNote =>
        creditNote.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${creditNote.customer.firstName} ${creditNote.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creditNote.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creditNote.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(creditNote => creditNote.status === statusFilter);
    }

    setFilteredCreditNotes(filtered);
  };

  const handleStatusUpdate = async (creditNoteId: string, newStatus: CreditNoteStatus) => {
    try {
      await invoiceService.updateCreditNoteStatus(creditNoteId, newStatus);
      await loadCreditNotes();
      toast({
        title: 'Success',
        description: 'Credit note status updated successfully',
      });
    } catch (error) {
      console.error('Error updating credit note status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update credit note status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCreditNote = async (creditNoteId: string) => {
    if (confirm('Are you sure you want to delete this credit note?')) {
      try {
        await invoiceService.deleteCreditNote(creditNoteId);
        await loadCreditNotes();
        toast({
          title: 'Success',
          description: 'Credit note deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting credit note:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete credit note',
          variant: 'destructive',
        });
      }
    }
  };

  const downloadPDF = async (creditNote: CreditNote) => {
    try {
      const pdf = await pdfGenerator.generateCreditNotePDF(creditNote);
      pdf.save(`${creditNote.creditNoteNumber}.pdf`);
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

  const getStatusColor = (status: CreditNoteStatus) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading credit notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground">
            Manage and track all customer credit notes
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/credit-notes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Credit Note
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
                  placeholder="Search credit notes..."
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
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Credit Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Credit Notes</CardTitle>
          <CardDescription>
            {filteredCreditNotes.length} credit note{filteredCreditNotes.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCreditNotes.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No credit notes found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first credit note.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild className="mt-4">
                  <Link href="/admin/credit-notes/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Credit Note
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell className="font-medium">
                      {creditNote.creditNoteNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {creditNote.customer?.firstName || 'Unknown'} {creditNote.customer?.lastName || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {creditNote.customer?.email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(creditNote.issueDate).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={creditNote.reason}>
                        {creditNote.reason}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      R {creditNote.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(creditNote.status)}>
                        {creditNote.status}
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
                          <DropdownMenuItem onClick={() => downloadPDF(creditNote)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/credit-notes/${creditNote.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/credit-notes/${creditNote.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {creditNote.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(creditNote.id, 'SENT')}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {creditNote.status === 'SENT' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(creditNote.id, 'APPLIED')}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Mark as Applied
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCreditNote(creditNote.id)}
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