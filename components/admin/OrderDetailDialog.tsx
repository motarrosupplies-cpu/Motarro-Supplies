import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, orderService } from '@/lib/services/orderService';
import { formatDate, formatCurrency } from '@/lib/utils';
import { customerService, Customer } from '@/lib/services/customerService';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

interface Product {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  colors?: any[];
  sizes?: any[];
}

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

const statusColors = {
  pending: 'outline',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'outline',
  cancelled: 'destructive',
} as const;

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailDialogProps) {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [enrichedOrderItems, setEnrichedOrderItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      customerService.getCustomerById(order.customerId).then(setCustomer);
      orderService.getOrderItems(order.id).then(async (items) => {
        setOrderItems(items);
        // Fetch product details for each item
        const enriched = await Promise.all(items.map(async (item: any) => {
          let product: Product | null = null;
          try {
            const res = await fetch(`/api/products/optimized/${item.product_id}`);
            if (res.ok) product = await res.json();
          } catch {}
          // Use snapshot fallback if product is missing
          let image = product?.image || item.product_image;
          let name = product?.name || item.product_name || item.name || item.product_id;
          // Resolve color/size names if possible
          let selectedColor = item.selectedColor || item.selected_color_id || null;
          let selectedSize = item.selectedSize || item.selected_size_id || null;
          if (product?.colors && selectedColor) {
            const colorObj = product.colors.find((c: any) => c.name === selectedColor || c.value === selectedColor || c.id === selectedColor);
            if (colorObj) selectedColor = colorObj.name;
          }
          if (product?.sizes && selectedSize) {
            const sizeObj = product.sizes.find((s: any) => s === selectedSize || s.id === selectedSize);
            if (sizeObj) selectedSize = typeof sizeObj === 'string' ? sizeObj : sizeObj.name || sizeObj.id;
          }
          return {
            ...item,
            productName: name,
            productImage: image,
            customPrinting: item.customPrinting || item.custom_printing || null,
            selectedColor,
            selectedSize,
          };
        }));
        setEnrichedOrderItems(enriched);
      });
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await orderService.updateOrderStatus(order.id, newStatus);
    onOrderUpdated();
  };

  let parsedShippingAddress: any = {};
  try {
    parsedShippingAddress = typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress || {};
    if (typeof parsedShippingAddress !== 'object' || parsedShippingAddress === null) {
      parsedShippingAddress = {};
    }
  } catch {
    parsedShippingAddress = {};
  }

  const handleAcceptOrder = async () => {
    if (!order) return;
    try {
      const items = orderItems.length > 0 ? orderItems : await orderService.getOrderItems(order.id);
      // Idempotent: skip stock deduction if already done (e.g. PayFast IPN fulfillment)
      if (!order.stockDeducted) {
        for (const item of items) {
          const res = await fetch(`/api/products/optimized/${item.product_id}`);
          if (!res.ok) throw new Error('Failed to fetch product');
          const product = await res.json();
          const newStock = Number(product.stock) - Number(item.quantity);
          if (newStock < 0) throw new Error('Insufficient stock for product: ' + product.name);
          const updateRes = await fetch(`/api/products/optimized/${item.product_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, stock: newStock }),
          });
          if (!updateRes.ok) throw new Error('Failed to update stock for product: ' + product.name);
        }
      }
      await orderService.updateOrderStatus(order.id, 'accepted');
      toast({
        title: 'Order Accepted',
        description: order.stockDeducted ? 'Order status updated.' : 'Order status updated and stock deducted.',
      });
      onOrderUpdated();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to accept order', variant: 'destructive' });
    }
  };

  const handleRejectOrder = async () => {
    if (!order) return;
    try {
      await orderService.updateOrderStatus(order.id, 'cancelled');
      toast({ title: 'Order Cancelled', description: 'Order status updated to cancelled.' });
      onOrderUpdated();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    const doc = new jsPDF();
    // Title
    doc.setFontSize(18);
    doc.text('Invoice', 14, 18);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 28);
    doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 36);
    doc.text(`Customer: ${customer ? `${customer.firstName} ${customer.lastName}` : ''}`, 14, 44);
    doc.text(`Email: ${customer?.email || ''}`, 14, 52);
    doc.text('Shipping Address:', 14, 60);
    doc.text(`${parsedShippingAddress?.street || ''}`, 14, 68);
    doc.text(`${parsedShippingAddress?.city || ''}, ${parsedShippingAddress?.state || ''} ${parsedShippingAddress?.zipCode || ''}`, 14, 76);
    doc.text(`${parsedShippingAddress?.country || ''}`, 14, 84);
    // Table header
    let y = 96;
    doc.setFontSize(12);
    doc.text('Product', 14, y);
    doc.text('Price', 80, y);
    doc.text('Qty', 120, y);
    doc.text('Total', 150, y);
    y += 8;
    // Table rows
    enrichedOrderItems.forEach((item) => {
      let desc = item.productName || item.product_id;
      if (item.selectedColor) desc += ` | Color: ${item.selectedColor}`;
      if (item.selectedSize) desc += ` | Size: ${item.selectedSize}`;
      // Wrap product description if too long
      const splitDesc = doc.splitTextToSize(desc, 60);
      doc.text(splitDesc, 14, y);
      doc.text(formatCurrency(item.price_at_time), 80, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(formatCurrency(item.price_at_time * item.quantity), 150, y);
      y += 8 * splitDesc.length;
    });
    // Subtotal, shipping, and total
    y += 4;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(order.totalAmount - (order.shippingCost || 0))}`, 14, y);
    y += 8;
    doc.text(`Shipping: ${formatCurrency(order.shippingCost || 0)}`, 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(`Total: ${formatCurrency(order.totalAmount)}`, 150, y);
    // Download
    doc.save(`invoice-${order.id}.pdf`);
  };

  const handleSendInvoice = async () => {
    if (!order || !customer?.email) {
      toast({ title: 'Error', description: 'Customer email not found', variant: 'destructive' });
      return;
    }
    try {
      // Generate PDF (same as handleGenerateInvoice, but in memory)
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Invoice', 14, 18);
      doc.setFontSize(12);
      doc.text(`Order ID: ${order.id}`, 14, 28);
      doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 36);
      doc.text(`Customer: ${customer ? `${customer.firstName} ${customer.lastName}` : ''}`, 14, 44);
      doc.text(`Email: ${customer?.email || ''}`, 14, 52);
      doc.text('Shipping Address:', 14, 60);
      doc.text(`${parsedShippingAddress?.street || ''}`, 14, 68);
      doc.text(`${parsedShippingAddress?.city || ''}, ${parsedShippingAddress?.state || ''} ${parsedShippingAddress?.zipCode || ''}`, 14, 76);
      doc.text(`${parsedShippingAddress?.country || ''}`, 14, 84);
      let y = 96;
      doc.setFontSize(12);
      doc.text('Product', 14, y);
      doc.text('Price', 80, y);
      doc.text('Qty', 120, y);
      doc.text('Total', 150, y);
      y += 8;
      enrichedOrderItems.forEach((item) => {
        let desc = item.productName || item.product_id;
        if (item.selectedColor) desc += ` | Color: ${item.selectedColor}`;
        if (item.selectedSize) desc += ` | Size: ${item.selectedSize}`;
        // Wrap product description if too long
        const splitDesc = doc.splitTextToSize(desc, 60);
        doc.text(splitDesc, 14, y);
        doc.text(formatCurrency(item.price_at_time), 80, y);
        doc.text(String(item.quantity), 120, y);
        doc.text(formatCurrency(item.price_at_time * item.quantity), 150, y);
        y += 8 * splitDesc.length;
      });
      // Subtotal, shipping, and total
      y += 4;
      doc.setFontSize(12);
      doc.text(`Subtotal: ${formatCurrency(order.totalAmount - (order.shippingCost || 0))}`, 14, y);
      y += 8;
      doc.text(`Shipping: ${formatCurrency(order.shippingCost || 0)}`, 14, y);
      y += 8;
      doc.setFontSize(14);
      doc.text(`Total: ${formatCurrency(order.totalAmount)}`, 150, y);
      // Convert PDF to base64
      const pdfBase64 = btoa(
        new Uint8Array(doc.output('arraybuffer'))
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      // Send to API
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer.email,
          subject: `Invoice for Order ${order.id}`,
          pdfBase64,
        }),
      });
      if (!res.ok) throw new Error('Failed to send invoice');
      toast({ title: 'Invoice Sent', description: `Invoice sent to ${customer.email}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send invoice', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p>{customer ? `${customer.firstName} ${customer.lastName}` : 'Loading...'}</p>
              <p>{customer?.email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p>Date: {formatDate(order.createdAt)}</p>
              <p>Payment Method: {order.paymentMethod}</p>
              <div className="flex items-center gap-2 mt-2">
                <span>Status:</span>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <Badge className={status === 'pending' ? 'bg-orange-400 text-white' : ''} variant={statusColors[status as keyof typeof statusColors] || 'default'}>{status}</Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <Badge className={status === 'pending' ? 'bg-orange-400 text-white' : ''} variant={statusColors.pending}>Pending</Badge>
                    </SelectItem>
                    <SelectItem value="processing">
                      <Badge variant={statusColors.processing}>Processing</Badge>
                    </SelectItem>
                    <SelectItem value="shipped">
                      <Badge variant={statusColors.shipped}>Shipped</Badge>
                    </SelectItem>
                    <SelectItem value="delivered">
                      <Badge variant={statusColors.delivered}>Delivered</Badge>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <Badge variant={statusColors.cancelled}>Cancelled</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p>{parsedShippingAddress?.street}</p>
            <p>
              {parsedShippingAddress?.city}, {parsedShippingAddress?.state}{' '}
              {parsedShippingAddress?.zipCode}
            </p>
            <p>{parsedShippingAddress?.country}</p>
          </div>

          {order.specialInstructions && (
            <div>
              <h3 className="font-semibold mb-2">Special Instructions</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{order.specialInstructions}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedOrderItems.map((item) => (
                    <tr key={item.id} className="border-t align-top">
                      <td className="px-4 py-2 flex items-start gap-2">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded mr-2" />
                        )}
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="text-xs text-muted-foreground">
                              {item.selectedSize && <>Size: {item.selectedSize}</>}
                              {item.selectedColor && <> | Color: {item.selectedColor}</>}
                            </div>
                          )}
                          {item.customPrinting?.source === 'titan-jet' && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Titan Jet supply · SKU {item.customPrinting.sku || '—'}
                            </div>
                          )}
                          {item.customPrinting?.source === 'kevro' && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {item.customPrinting.wantsBranding === false ? (
                                <div>Plain garment — no branding</div>
                              ) : item.customPrinting.branding ? (
                                <div>
                                  Branding: {[
                                    item.customPrinting.branding.brandingType,
                                    item.customPrinting.branding.brandingPosition,
                                    item.customPrinting.branding.brandingSize,
                                  ].filter(Boolean).join(' · ')}
                                  {item.customPrinting.setupFee > 0 && (
                                    <span> · Setup {formatCurrency(item.customPrinting.setupFee)}</span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {item.customPrinting && item.customPrinting.source !== 'kevro' && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {item.customPrinting.designs && item.customPrinting.designs.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.customPrinting.designs.map((design: any, idx: number) => (
                                    <a
                                      key={idx}
                                      href={design.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block border rounded p-1 bg-white hover:shadow"
                                    >
                                      <img
                                        src={design.url}
                                        alt={design.filename}
                                        className="w-10 h-10 object-contain"
                                      />
                                      <div className="truncate w-20 text-xs">{design.filename}</div>
                                    </a>
                                  ))}
                                </div>
                              )}
                              {item.customPrinting.instructions && (
                                <div className="mt-1 italic">Instructions: {item.customPrinting.instructions}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.price_at_time)}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.price_at_time * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(order.totalAmount - (order.shippingCost || 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">Shipping:</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(order.shippingCost || 0)}</td>
                  </tr>
                  <tr className="border-t font-semibold">
                    <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            {status === 'pending' && (
              <Button variant="default" onClick={() => handleStatusChange('processing')}>Accept Order</Button>
            )}
            {(status === 'processing' || status === 'accepted') && (
              <Button variant="destructive" onClick={handleRejectOrder}>Reject/Cancel Order</Button>
            )}
            <Button variant="secondary" onClick={handleGenerateInvoice}>Generate Invoice</Button>
            <Button variant="outline" onClick={handleSendInvoice}>Send Invoice</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 