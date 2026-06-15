'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddProductForm } from '@/components/admin/add-product-form';
import { EditProductForm } from '@/components/admin/edit-product-form';
import { DeleteProductButton } from '@/components/admin/delete-product-button';
import { useToast } from '@/components/ui/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ImportMotarroCatalogCard } from '@/components/admin/ImportMotarroCatalogCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeCondition,
} from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: string;
  originalPrice?: string;
  stock: string;
  status: string;
  isNew: boolean;
  onSale: boolean;
  image: string;
  description: string;
  images: string[];
  hasColorOptions?: boolean;
  hasSizeOptions?: boolean;
  colors?: any[];
  availability?: string;
  availabilityDate?: string | null;
  condition?: string;
  lowStockThreshold?: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const coerceImages = (images: any): string[] => normalizeSupabaseUrls(images)

  const fetchProducts = async () => {
    try {
      console.log('=== REGULAR PRODUCTS FETCH DEBUG ===');
      // Add cache busting parameter
      // FIXED: Use optimized API to match where products are being created/updated
      const cacheBuster = Date.now();
      const response = await fetch(`/api/products/optimized?filter=store&cb=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Products API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const responseData = await response.json();
      console.log('Raw API response:', responseData);
      
      // Handle new API response format
      const data = responseData.products || responseData;
      console.log('Products array:', data);
      console.log('API timestamp:', responseData.timestamp);
      console.log('Total products:', data.length);
      
      const safeArray: Product[] = (Array.isArray(data) ? data : []).map((p: any) => {
        const normalizedImages = coerceImages(p.images);
        const stockValue = Number(p.stock ?? p.total_stock ?? 0);
        return {
          id: String(p.id),
          name: String(p.name ?? ''),
          sku: p.sku ? String(p.sku) : undefined,
          category: String(p.category ?? ''),
          price: String(p.price ?? ''),
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : undefined,
          stock: String(p.stock ?? ''),
          status: String(p.status ?? 'active'),
          isNew: Boolean(p.isNew),
          onSale: Boolean(p.onSale),
          image: normalizeSupabaseUrl(p.image || normalizedImages[0] || ''),
          description: String(p.description ?? ''),
          images: normalizedImages,
          hasColorOptions: Boolean(p.hasColorOptions),
          hasSizeOptions: Boolean(p.hasSizeOptions),
          colors: Array.isArray(p.colors) ? p.colors : [],
          availability: resolveAvailability(p.availability, stockValue),
          availabilityDate: p.availability_date ?? null,
          condition: sanitizeCondition(p.condition),
          lowStockThreshold: p.low_stock_threshold ?? null,
        }
      })
      
      console.log('Processed products:', safeArray);
      console.log('Products by category:', safeArray.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      // API already returns store-only when ?filter=store; no client-side filter needed
      console.log('Setting products state with:', safeArray.length, 'products');
      setProducts(safeArray);
      console.log('fetchProducts completed');
    } catch (error) {
      console.error('Products fetch error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'disabled':
        return 'secondary';
      case 'low-stock':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredProducts = products.filter(product =>
    (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(search.toLowerCase())) ||
    (product.price && product.price.toString().includes(search))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="space-y-3 sm:space-y-6 p-3 sm:p-0">
      <AdminHeader searchQuery={search} onSearchChange={setSearch} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
        <AddProductForm onProductAdded={fetchProducts} />
      </div>

      <ImportMotarroCatalogCard />
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Products</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                Per page:
              </label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger id="items-per-page" className="w-full sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">No products found</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize mt-1">{product.category}</p>
                        </div>
                        <div className="flex flex-col gap-2 ml-2">
                          <Badge variant={getStatusBadgeVariant(product.status)} className="text-xs">
                            {product.status === 'active' ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <div className="font-medium">
                            R{parseFloat(product.price).toFixed(2)}
                            {product.originalPrice && (
                              <span className="ml-2 text-xs text-muted-foreground line-through">
                                R{parseFloat(product.originalPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stock:</span>
                          <div className="font-medium">{product.stock}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={product.isNew ? 'default' : 'secondary'} className="text-xs">
                          New: {product.isNew ? 'Yes' : 'No'}
                        </Badge>
                        <Badge variant={product.onSale ? 'destructive' : 'secondary'} className="text-xs">
                          Sale: {product.onSale ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <div className="flex-1">
                          <EditProductForm
                            product={{
                              ...product,
                              images: Array.isArray(product.images)
                                ? product.images
                                : (() => { try { return JSON.parse((product as any).images || '[]') } catch { return [] } })(),
                            } as any}
                            onProductUpdated={fetchProducts}
                          />
                        </div>
                        <div className="flex-1">
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                            onProductDeleted={fetchProducts}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Sale</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { (Array.isArray(paginatedProducts) ? paginatedProducts : [])
                      .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>
                        R{parseFloat(product.price).toFixed(2)}
                        {product.originalPrice && (
                          <span className="ml-2 text-sm text-muted-foreground line-through">
                            R{parseFloat(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {product.status === 'active' ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isNew ? 'default' : 'secondary'}>
                          {product.isNew ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.onSale ? 'destructive' : 'secondary'}>
                          {product.onSale ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <EditProductForm
                          product={{
                            ...product,
                            images: Array.isArray(product.images)
                              ? product.images
                              : (() => { try { return JSON.parse((product as any).images || '[]') } catch { return [] } })(),
                          } as any}
                          onProductUpdated={fetchProducts}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          onProductDeleted={fetchProducts}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial min-w-[100px]"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="text-xs sm:text-sm px-2">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial min-w-[100px]"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 