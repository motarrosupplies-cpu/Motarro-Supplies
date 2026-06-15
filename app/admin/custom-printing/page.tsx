"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ImageUpload } from '@/components/admin/image-upload';
import { Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from "@/types/product"
import { EditProductForm } from '@/components/admin/edit-product-form';
import { CustomPrintingAddProductForm } from '@/components/admin/custom-printing-add-product-form';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeCondition,
} from '@/lib/utils';

export default function CustomPrintingAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string>("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newColorName, setNewColorName] = useState("")
  const [newColorValue, setNewColorValue] = useState("#000000")
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchProducts() {
    console.log('=== CUSTOM PRINTING FETCH DEBUG ===');
    // Add cache busting parameter with more randomness
    const cacheBuster = `${Date.now()}-${Math.random()}`;
    // FIXED: Use the optimized API endpoint to match where products are being created
    const res = await fetch(`/api/products/optimized?filter=custom-printing&cb=${cacheBuster}`, {
      cache: 'no-store',
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    console.log('API response status:', res.status);
    const responseData = await res.json()
    console.log('Raw API response:', responseData);
    
    // Handle new API response format
    const data = responseData.products || responseData;
    console.log('Products array:', data);
    console.log('Total products from API:', data.length);
    console.log('API timestamp:', responseData.timestamp);
    
    // Debug: Check all categories
    const allCategories = [...new Set(data.map((p: any) => p.category))];
    console.log('All categories found:', allCategories);
    
    // API already returns only custom printing when ?filter=custom-printing
    console.log('Custom Printing products from API:', data.length);
    
    // Transform data to match Product interface
    const coerceImages = (images: any): string[] => normalizeSupabaseUrls(images)
    
    const safeArray: Product[] = (Array.isArray(data) ? data : []).map((p: any) => {
      const normalizedImages = coerceImages(p.images);
      const stockValue = Number(p.stock ?? p.total_stock ?? 0);
      return {
        id: String(p.id),
        name: String(p.name ?? ''),
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
    
    console.log('Processed products:', safeArray.length);
    console.log('Products by category:', safeArray.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    // Filter for custom printing products (case-insensitive)
    const customPrinting = safeArray.filter((p: Product) => {
      const cat = (p.category || '').toLowerCase().trim();
      return cat === 'custom printing';
    })
    console.log('Custom Printing products after filter:', customPrinting);
    console.log('Custom Printing count:', customPrinting.length);
    console.log('Sample Custom Printing product:', customPrinting[0]);
    
    console.log('Setting products state with:', customPrinting.length, 'products');
    setProducts(customPrinting)
    if (customPrinting.length > 0) {
      setSelectedTab((customPrinting[0] as any).subcategory || "Other")
    }
    setIsLoading(false)
    console.log('fetchProducts completed');
  }

  useEffect(() => {
    // Force immediate fetch on mount with reload parameter
    fetchProducts()
    // Also add a page focus listener to refresh when tab becomes active
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts()
      }
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('visibilitychange', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('visibilitychange', handleFocus)
    }
  }, [])

  // Filtered products by search
  const filteredProducts = products.filter(product =>
    (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
    (product.price && product.price.toString().includes(search)) ||
    (product.status && product.status.toLowerCase().includes(search.toLowerCase()))
  );

  // Group filtered products by subcategory
  const grouped = filteredProducts.reduce((acc, product) => {
    const subcat = (product as any).subcategory;
    if (subcat) {
      if (!acc[subcat]) acc[subcat] = [];
      acc[subcat].push(product);
    } else {
      if (!acc['All']) acc['All'] = [];
      acc['All'].push(product);
    }
    return acc;
  }, {} as Record<string, Product[]>);

  // Get current tab's products and calculate pagination
  const currentTabProducts = grouped[selectedTab] || grouped['All'] || [];
  const totalPages = Math.ceil(currentTabProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTabProducts = currentTabProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search, itemsPerPage, or selectedTab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, selectedTab]);

  console.log('Grouped products:', grouped);
  console.log('Grouped keys:', Object.keys(grouped));
  console.log('All products in grouped:', grouped['All']?.length || 0);

  const tabs = Object.keys(grouped).filter(tab => tab !== 'Other');

  // If only 'All' exists, set selectedTab to 'All'
  useEffect(() => {
    if (tabs.length === 1 && tabs[0] === 'All') {
      setSelectedTab('All');
    }
  }, [tabs.length]);

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      console.log('=== CUSTOM PRINTING UPDATE DEBUG ===');
      console.log('Updating product:', updatedProduct.id);
      console.log('Product data:', JSON.stringify(updatedProduct, null, 2));
      
      // FIXED: Use the optimized API endpoint to match where products are stored
      const response = await fetch(`/api/products/optimized/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const savedProduct = await response.json();
      setProducts((prev) => prev.map((p) => p.id === savedProduct.id ? savedProduct : p));
      toast.success('Product updated successfully');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update product');
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('=== CUSTOM PRINTING DELETE DEBUG ===');
      console.log('Deleting product ID:', productId);
      
      // Add confirmation dialog
      if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        console.log('Delete cancelled by user');
        return;
      }
      
      setIsDeleting(true);
      
      // FIXED: Use the optimized API endpoint to match where products are stored
      const response = await fetch(`/api/products/optimized/${productId}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Delete error response:', error);
        toast.error(error.error || 'Failed to delete product');
        return;
      }
      
      console.log('Product deleted successfully');
      toast.success('Product deleted successfully');
      
      // Force refresh to get the latest data from the database
      console.log('Refreshing products list to confirm deletion...');
      // Add a small delay to ensure database is updated
      setTimeout(async () => {
        await fetchProducts();
        console.log('Products list refreshed after deletion');
      }, 500);
      
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const addColor = () => {
    if (!newColorName) {
      toast.error("Color name is required")
      return
    }
    if (!editingProduct) return
    const currentColors = editingProduct.colors || []
    setEditingProduct({
      ...editingProduct,
      colors: [...currentColors, { name: newColorName, value: newColorValue }]
    })
    setNewColorName("")
    setNewColorValue("#000000")
  }

  const removeColor = (index: number) => {
    if (!editingProduct) return
    const currentColors = editingProduct.colors || []
    setEditingProduct({
      ...editingProduct,
      colors: currentColors.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="container p-3 sm:p-6 mx-auto max-w-7xl">
      <AdminHeader searchQuery={search} onSearchChange={setSearch} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Custom Printing Management</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page-custom" className="text-sm text-muted-foreground whitespace-nowrap">
              Products per page:
            </label>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger id="items-per-page-custom" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CustomPrintingAddProductForm onProductAdded={fetchProducts} />
        </div>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        tabs.length === 1 && tabs[0] === 'All' ? (
          <Card className="p-3 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold">Products</h2>
              </div>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Min. Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTabProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>R{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.minOrder}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditProductForm product={{
                            ...product,
                            price: product.price.toString(),
                            stock: String(product.stock ?? 0),
                            originalPrice: product.originalPrice !== undefined ? String(product.originalPrice) : undefined,
                            onSale: !!product.onSale,
                            isNew: !!product.isNew,
                            status: product.status || 'active',
                          }} onProductUpdated={fetchProducts} />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, currentTabProducts.length)} of {currentTabProducts.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Tabs defaultValue={selectedTab} value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 w-full">
              {tabs.map(tab => (
                <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm">{tab}</TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(tab => (
              <TabsContent key={tab} value={tab}>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">{tab} Products</h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Min. Order</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const tabProducts = grouped[tab] || [];
                          const tabTotalPages = Math.ceil(tabProducts.length / itemsPerPage);
                          const tabStartIndex = (currentPage - 1) * itemsPerPage;
                          const tabEndIndex = tabStartIndex + itemsPerPage;
                          const paginatedTabProducts = tabProducts.slice(tabStartIndex, tabEndIndex);
                          return paginatedTabProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>R{Number(product.price).toFixed(2)}</TableCell>
                            <TableCell>{product.minOrder}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <EditProductForm product={{
                                  ...product,
                                  price: product.price.toString(),
                                  stock: String(product.stock ?? 0),
                                  originalPrice: product.originalPrice !== undefined ? String(product.originalPrice) : undefined,
                                  onSale: !!product.onSale,
                                  isNew: !!product.isNew,
                                  status: product.status || 'active',
                                }} onProductUpdated={fetchProducts} />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                    {/* Pagination Controls for each tab */}
                    {(() => {
                      const tabProducts = grouped[tab] || [];
                      const tabTotalPages = Math.ceil(tabProducts.length / itemsPerPage);
                      const tabStartIndex = (currentPage - 1) * itemsPerPage;
                      const tabEndIndex = tabStartIndex + itemsPerPage;
                      return tabTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Showing {tabStartIndex + 1} to {Math.min(tabEndIndex, tabProducts.length)} of {tabProducts.length} products
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <div className="text-sm">
                              Page {currentPage} of {tabTotalPages}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(tabTotalPages, prev + 1))}
                              disabled={currentPage === tabTotalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )
      )}
    </div>
  )
} 