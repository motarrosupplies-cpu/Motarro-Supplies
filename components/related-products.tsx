'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { ProductGrid } from './product-grid';

interface RelatedProductsProps {
  currentProduct: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(`/api/products?category=${currentProduct.category}&limit=4&exclude=${currentProduct.id}`);
        if (response.ok) {
          const data = await response.json();
          setRelatedProducts(data);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    }

    fetchRelatedProducts();
  }, [currentProduct]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <ProductGrid products={relatedProducts} />
      </div>
    </section>
  );
} 