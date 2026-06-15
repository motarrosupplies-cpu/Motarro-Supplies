# Supabase Setup Guide for Invoicing System

This guide will help you set up Supabase for the invoicing system in your admin dashboard.

## 🗄️ Database Setup

### 1. **Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `motarro-invoicing` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. **Get Your Project Credentials**

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. **Update Environment Variables**

Update your `.env` file with the correct Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Database URLs (for Prisma if needed)
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres?sslmode=require"
```

## 🗂️ Database Schema Setup

### 1. **Run the SQL Schema**

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-invoicing-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

### 2. **Verify Tables Created**

After running the SQL, you should see these tables in **Table Editor**:

- `customers` - Customer information
- `addresses` - Customer addresses
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `quotations` - Quotation records
- `quotation_items` - Quotation line items
- `credit_notes` - Credit note records
- `credit_note_items` - Credit note line items

## 🔐 Row Level Security (RLS) Setup

The SQL schema includes RLS policies for authenticated users. To enable:

1. Go to **Authentication** → **Policies** in Supabase
2. Ensure RLS is enabled for all tables
3. Verify the policies are active:
   - `Enable read access for authenticated users`
   - `Enable insert access for authenticated users`
   - `Enable update access for authenticated users`
   - `Enable delete access for authenticated users`

## 🧪 Testing the Setup

### 1. **Test Database Connection**

Run your development server:
```powershell
npm run dev
```

Navigate to `/admin/invoices` and try to:
- View the invoices list
- Create a new invoice
- Check for any connection errors in the browser console

### 2. **Create Test Data**

You can create test data through the admin interface:
1. Go to `/admin/customers` and create a test customer
2. Go to `/admin/invoices/new` and create a test invoice
3. Go to `/admin/quotations/new` and create a test quotation
4. Go to `/admin/credit-notes/new` and create a test credit note

## 🚀 Deployment Setup

### 1. **Vercel Deployment**

If deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Deploy your application:
```powershell
git add .
git commit -m "Add invoicing system with Supabase integration"
git push
```

### 2. **Other Platforms**

For other deployment platforms, ensure you set the same environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env` file has the correct variables
   - Ensure variable names match exactly

2. **"Failed to load customers/invoices"**
   - Verify RLS policies are enabled
   - Check browser console for specific error messages
   - Ensure tables were created successfully

3. **"Permission denied" errors**
   - Verify RLS policies are correctly configured
   - Check if user is authenticated

4. **Connection timeouts**
   - Verify Supabase project is active
   - Check network connectivity
   - Ensure correct project URL

### Debug Steps:

1. **Check Supabase Dashboard**
   - Go to **Logs** to see database queries
   - Check **Table Editor** to verify data

2. **Browser Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Environment Variables**
   - Verify `.env` file is in project root
   - Restart development server after changes
   - Check variable names are correct

## 📊 Database Schema Overview

### Tables Structure:

**customers**
- `id` (UUID, Primary Key)
- `first_name`, `last_name`, `email`
- `phone`, `company`
- `created_at`, `updated_at`

**addresses**
- `id` (UUID, Primary Key)
- `customer_id` (Foreign Key)
- `street`, `city`, `state`, `zip_code`, `country`

**invoices**
- `id` (UUID, Primary Key)
- `invoice_number` (Auto-generated)
- `customer_id` (Foreign Key)
- `issue_date`, `due_date`
- `status`, `subtotal`, `tax_amount`, `total`
- `notes`, `terms`

**invoice_items**
- `id` (UUID, Primary Key)
- `invoice_id` (Foreign Key)
- `description`, `quantity`, `unit_price`, `total`

**quotations**
- Similar structure to invoices with `expiry_date`

**credit_notes**
- Similar structure with `reason` and optional `invoice_id`

## 🔄 Next Steps

After setup:

1. **Test all functionality**:
   - Create customers
   - Generate invoices
   - Create quotations
   - Issue credit notes
   - Download PDFs

2. **Customize as needed**:
   - Modify PDF templates
   - Adjust tax rates
   - Add custom fields
   - Configure email notifications

3. **Monitor usage**:
   - Check Supabase dashboard for usage metrics
   - Monitor database performance
   - Review logs for any issues

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check browser console for specific error messages
4. Verify all environment variables are set correctly

---

**Note**: Keep your Supabase credentials secure and never commit them to version control. Use environment variables for all sensitive information. 