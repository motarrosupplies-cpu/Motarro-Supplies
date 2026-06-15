# School Events Printing System

A comprehensive system for managing school events and allowing parents to place custom printing orders for their children's apparel.

## 🎯 Overview

This system provides:
- **Admin Interface**: Create and manage school events, products, and variants
- **Public Ordering**: Parents can browse events and place orders
- **Payment Integration**: Works with your existing PayFast integration
- **Email Notifications**: Automatic confirmation emails to parents and admin
- **Order Management**: Track order status and manage production workflow

## 🚀 Quick Start

### 1. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `school-events-schema.sql`
4. Run the SQL script

This will create all necessary tables and insert sample data for testing.

### 2. Access the Admin Panel

1. Navigate to `/admin/school-events` in your application
2. You'll see the sample events (Soap Box Derby 2024 and Choral Verse Competition)
3. Click on any event to manage its products and view orders

### 3. Test the Public Interface

1. Navigate to `/school-events` to see the public events page
2. Click on an event to view products and place test orders
3. Complete the checkout process

## 📋 System Components

### Admin Pages

- **`/admin/school-events`** - Main events dashboard
- **`/admin/school-events/new`** - Create new events
- **`/admin/school-events/[id]`** - View event details
- **`/admin/school-events/[id]/edit`** - Edit event details
- **`/admin/school-events/[id]/products`** - Manage event products
- **`/admin/school-events/[id]/variants`** - Manage product variants
- **`/admin/school-events/[id]/orders`** - View event orders
- **`/admin/school-events/[id]/public`** - Get public sharing link

### Public Pages

- **`/school-events`** - Browse all active events
- **`/school-events/[id]`** - View event products and place orders
- **`/school-events/checkout/[orderId]`** - Complete order checkout

### API Endpoints

- **`/api/admin/school-events`** - CRUD operations for events
- **`/api/admin/school-events/[id]/products`** - Manage event products
- **`/api/admin/school-events/products/[id]/variants`** - Manage product variants
- **`/api/school-events`** - Public events listing
- **`/api/school-events/[id]`** - Public event details
- **`/api/school-events/orders`** - Create new orders

## 🛠️ Admin Workflow

### 1. Create a School Event

1. Go to `/admin/school-events`
2. Click "New Event"
3. Fill in event details:
   - Event name (e.g., "Annual Sports Day")
   - Description
   - Start and end dates
   - Set as active

### 2. Add Products

1. Click "Manage Products" on your event
2. Click "Add Product"
3. Configure:
   - Product name (e.g., "Event T-Shirt")
   - Description
   - Base price
   - Optional image URL

### 3. Configure Variants

1. Click "Manage Variants" on a product
2. Add size/color combinations:
   - S, M, L, XL sizes
   - White, Black, Navy colors
   - Additional pricing for premium options

### 4. Share with Parents

1. Go to "Public Page" tab
2. Copy the public URL
3. Share via email, WhatsApp, or school newsletters

## 👥 Parent Ordering Process

### 1. Browse Events

Parents visit `/school-events` to see all active events

### 2. Select Products

- Choose event products (t-shirts, hoodies, etc.)
- Select size and color options
- Add to order

### 3. Provide Information

- Child's name and age
- Parent contact details
- School information
- Special instructions

### 4. Checkout

- Review order summary
- Choose payment method (PayFast or EFT)
- Complete payment

## 💳 Payment Integration

### PayFast (Online Payment)

- Credit cards, EFT, and other online methods
- Automatic order confirmation
- Real-time payment status

### EFT (Bank Transfer)

- Order marked as pending
- Bank details sent via email
- Manual payment verification

## 📧 Email Notifications

### Order Confirmation

- Sent to parent immediately after order
- Includes order number and total amount
- Confirms order receipt

### Admin Notification

- Sent to `motarrodotcoza@gmail.com`
- Includes order details and parent information
- Helps track incoming orders

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```env
GMAIL_APP_PASSWORD=your_gmail_app_password
DATABASE_URL=your_supabase_database_url
```

### Email Settings

The system uses Gmail for sending emails. Update the email addresses in:
- `app/api/school-events/orders/route.ts` (line 67)
- `app/api/school-events/orders/route.ts` (line 78)

## 📊 Order Management

### Order Statuses

- **PENDING** - Order received, awaiting confirmation
- **CONFIRMED** - Order confirmed, ready for production
- **IN_PRODUCTION** - Being printed/manufactured
- **READY_FOR_PICKUP** - Ready for collection
- **COMPLETED** - Order fulfilled
- **CANCELLED** - Order cancelled

### Payment Statuses

- **PENDING** - Payment not yet received
- **PAID** - Payment confirmed
- **FAILED** - Payment failed
- **REFUNDED** - Payment refunded

## 🎨 Customization

### Styling

The system uses your existing Tailwind CSS setup and UI components. Customize colors and styling in:
- `app/globals.css`
- `tailwind.config.js`

### Branding

Update logos and branding in:
- `components/header.tsx`
- `app/layout.tsx`

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check your Supabase connection string
   - Ensure database is accessible

2. **Email Not Sending**
   - Verify Gmail app password
   - Check email addresses in API routes

3. **Orders Not Creating**
   - Check browser console for errors
   - Verify API endpoints are accessible

4. **Payment Issues**
   - Test with small amounts first
   - Check PayFast configuration

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error information.

## 🔮 Future Enhancements

### Planned Features

- **Bulk Order Management** - Export orders to CSV/Excel
- **QR Code Generation** - Easy mobile access to events
- **Order Deadlines** - Set cutoff dates for orders
- **Inventory Tracking** - Monitor stock levels
- **Advanced Reporting** - Sales analytics and insights
- **Parent Portal** - Order history and status updates

### Integration Opportunities

- **SMS Notifications** - Text message confirmations
- **WhatsApp Integration** - Direct messaging for updates
- **School Management Systems** - Sync with existing platforms
- **Accounting Software** - Export financial data

## 📞 Support

For technical support or questions about the school events system:

1. Check this README for common solutions
2. Review the code comments for implementation details
3. Check browser console and server logs for errors
4. Contact your development team for custom modifications

## 📝 License

This system is part of your MOTARRO Supplies application. Ensure all modifications comply with your existing licensing and terms of service.

---

**Happy Event Planning! 🎉**

The school events printing system is designed to streamline your workflow and provide parents with a seamless ordering experience. Start with the sample data to understand the system, then customize it to match your specific needs.
