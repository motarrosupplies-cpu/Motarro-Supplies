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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, FileText } from 'lucide-react';
import { Order, orderService } from '@/lib/services/orderService';
import { OrderDetailDialog } from '@/components/admin/OrderDetailDialog';
import { formatDate, formatCurrency } from '@/lib/utils';
import { customerService, Customer } from '@/lib/services/customerService';
import { toast } from '@/components/ui/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';

const statusColors = {
  pending: 'outline',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'outline',
  cancelled: 'destructive',
} as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, number>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const [ordersData, customersData] = await Promise.all([
        orderService.getAllOrders(),
        customerService.getAllCustomers(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      // Fetch item counts for all orders
      const itemsCounts: Record<string, number> = {};
      await Promise.all(
        ordersData.map(async (order) => {
          const items = await orderService.getOrderItems(order.id);
          itemsCounts[order.id] = items.length;
        })
      );
      setOrderItemsMap(itemsCounts);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    const success = await orderService.deleteOrder(orderId);
    if (success) {
      toast({ title: 'Order deleted', description: 'The order was deleted successfully.' });
      loadOrders();
    } else {
      toast({ title: 'Error', description: 'Failed to delete order.', variant: 'destructive' });
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const result = await response.json();
      
      toast({ 
        title: 'Invoice Generated', 
        description: result.message 
      });

      // Reload orders to update status
      loadOrders();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate invoice from order.', 
        variant: 'destructive' 
      });
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    getCustomerName(order.customerId).toLowerCase().includes(search.toLowerCase()) ||
    order.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminHeader searchQuery={search} onSearchChange={setSearch} />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">No orders found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{getCustomerName(order.customerId)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{orderItemsMap[order.id] ?? 0}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={order.status === 'pending' ? 'bg-orange-400 text-white' : ''} variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {order.status !== 'invoiced' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleGenerateInvoice(order.id)}
                          title="Generate Invoice"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete Order"
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

      <OrderDetailDialog
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onOrderUpdated={loadOrders}
      />
    </div>
  );
} 