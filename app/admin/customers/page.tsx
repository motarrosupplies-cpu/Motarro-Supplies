'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Trash2 } from 'lucide-react';
import { customerService, Customer } from '@/lib/services/customerService';
import { CustomerDetailDialog } from '@/components/admin/CustomerDetailDialog';
import { formatCurrency } from '@/lib/utils';
import { orderService, Order } from '@/lib/services/orderService';
import { toast } from '@/components/ui/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const [customersData, ordersData] = await Promise.all([
        customerService.getAllCustomers(),
        orderService.getAllOrders(),
      ]);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderCount = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId).length;
  };

  const getTotalSpent = (customerId: string) => {
    return orders
      .filter((order) => order.customerId === customerId)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    const success = await customerService.deleteCustomer(customerId);
    if (success) {
      toast({ title: 'Customer deleted', description: 'The customer was deleted successfully.' });
      loadCustomers();
    } else {
      toast({ title: 'Error', description: 'Failed to delete customer.', variant: 'destructive' });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (`${customer.firstName} ${customer.lastName}`.toLowerCase().includes(search.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
    (customer.phone && customer.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <AdminHeader searchQuery={search} onSearchChange={setSearch} />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">No customers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{customer.firstName} {customer.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getOrderCount(customer.id)}</TableCell>
                    <TableCell>{formatCurrency(getTotalSpent(customer.id))}</TableCell>
                    <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerDetailDialog
        customer={selectedCustomer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
} 