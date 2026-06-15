import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Helper to escape CSV fields
function escapeCSV(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  // Fetch products from Supabase
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  // Pinterest CSV header (exact order from sample template)
  const header = [
    'id',
    'item_group_id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'availability',
    'condition',
    'google_product_category',
    'product_type',
    'additional_image_link',
    'sale_price',
    'brand',
    'gender',
    'age_group',
    'size',
    'size_type',
    'shipping',
    'custom_label_0',
    'adwords_redirect'
  ];

  const siteUrl = 'https://www.motarro.co.za';

  // Build CSV rows in the exact same order as the header
  const rows = (products || []).map((p: any) => [
    escapeCSV(p.id),
    '', // item_group_id
    escapeCSV(p.name),
    escapeCSV(p.description),
    escapeCSV(`${siteUrl}/products/${p.id}`),
    escapeCSV(Array.isArray(p.images) ? p.images[0] : p.image),
    escapeCSV(`${p.price} ZAR`),
    p.stock > 0 ? 'in stock' : 'out of stock',
    'new', // condition
    '', // google_product_category
    escapeCSV(p.category || ''), // product_type
    escapeCSV(Array.isArray(p.images) && p.images.length > 1 ? p.images.slice(1).join('|') : ''),
    escapeCSV(p.originalPrice ? `${p.originalPrice} ZAR` : ''),
    'MOTARRO Supplies', // brand
    '', // gender
    '', // age_group
    '', // size
    '', // size_type
    '', // shipping
    '', // custom_label_0
    ''  // adwords_redirect
  ]);

  // Combine header and rows
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');

  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv' }
  });
} 