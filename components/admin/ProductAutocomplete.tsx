import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface ProductAutocompleteProps {
  value: string;
  onSelect: (product: Product | null, customValue?: string) => void;
}

export const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    // Use admin client to bypass RLS policies
    const client = supabaseAdmin || supabase;
    client
      .from('all_products_unified')
      .select('id, name, price, description, image, images')
      .eq('status', 'active') // CRITICAL: Only show active products
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error fetching products for quotation:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            hint: error.hint
          });
          setResults([]);
          setLoading(false);
          return;
        }
        
        // Transform data to match Product interface
        // Handle image field - use image if available, otherwise first from images array
        const transformedResults = (data || []).map((product: any) => {
          let imageUrl = product.image || '';
          if (!imageUrl && product.images) {
            try {
              const images = typeof product.images === 'string' 
                ? JSON.parse(product.images) 
                : product.images;
              if (Array.isArray(images) && images.length > 0) {
                imageUrl = images[0];
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
          
          return {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            description: product.description || '',
            image: imageUrl
          };
        });
        
        setResults(transformedResults);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setShowDropdown(true);
          onSelect(null, e.target.value);
        }}
        placeholder="Product or service description"
        onFocus={() => {
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 bg-white border w-full max-h-60 overflow-auto shadow-lg rounded-md mt-1">
          {results.map(product => (
            <div
              key={product.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setQuery(product.name);
                setShowDropdown(false);
                onSelect(product);
              }}
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">{product.description}</div>
              <div className="text-xs text-gray-700">R {product.price?.toFixed(2) || '0.00'}</div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-10 bg-white border w-full px-4 py-2 text-gray-500 rounded-md mt-1">
          No products found. You can enter a custom description.
        </div>
      )}
    </div>
  );
}; 