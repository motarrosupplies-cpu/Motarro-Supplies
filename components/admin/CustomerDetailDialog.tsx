import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Customer } from '@/lib/services/customerService';
import { Order, orderService } from '@/lib/services/orderService';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomerDetailDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (customer) {
      orderService.getOrdersByCustomerId(customer.id).then(setOrders);
    }
  }, [customer]);

  if (!customer) return null;

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <div>
                    <p>{customer.address.street}</p>
                    <p>{customer.address.city}, {customer.address.state}</p>
                    <p>{customer.address.zipCode}</p>
                    <p>{customer.address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-semibold">{orderCount}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(avgOrderValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order History</h3>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="capitalize">{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(customer.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 