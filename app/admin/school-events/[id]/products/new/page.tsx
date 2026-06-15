"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Search, Plus, Package, X } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  stock: number;
  status: string;
}

interface EventProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  variants: EventProductVariant[];
}

interface EventProductVariant {
  id: string;
  size: string;
  color: string;
  additionalPrice: number;
  isActive: boolean;
}

interface VariantFormData {
  size: string;
  color: string;
  additionalPrice: string;
  isActive: boolean;
}

export default function AddEventProductPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = typeof params?.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customBasePrice, setCustomBasePrice] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState<VariantFormData>({
    size: '',
    color: '',
    additionalPrice: '0',
    isActive: true
  });
  const [hasVariants, setHasVariants] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      const raw = Array.isArray(payload) ? payload : payload?.products;
      const list = Array.isArray(raw) ? raw : [];
      const normalized: Product[] = list.map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        description: String(p.description ?? ""),
        category: String(p.category ?? "uncategorized"),
        price:
          typeof p.price === "number"
            ? String(p.price)
            : String(p.price ?? "0"),
        stock:
          typeof p.stock === "number"
            ? p.stock
            : Number(p.stock) || 0,
        status: String(p.status ?? "active"),
        images: Array.isArray(p.images)
          ? (p.images as string[])
          : p.image
            ? [String(p.image)]
            : [],
      }));
      setProducts(normalized);
      setFilteredProducts(normalized);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCustomName(product.name);
    setCustomDescription(product.description);
    setCustomBasePrice(product.price);
    setCustomImageUrl(product.images?.[0] || "");
    setIsCustomProduct(false);
  };

  const createCustomProduct = () => {
    setIsCustomProduct(true);
    setSelectedProduct(null);
    setCustomName("");
    setCustomDescription("");
    setCustomBasePrice("");
    setCustomImageUrl("");
    setVariants([]);
    setHasVariants(false);
  };

  const addVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      toast({
        title: "Error",
        description: "Size and color are required for variants",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate variants
    const isDuplicate = variants.some(
      v => v.size === newVariant.size && v.color === newVariant.color
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "A variant with this size and color already exists",
        variant: "destructive",
      });
      return;
    }

    // Ensure additionalPrice is not empty, default to '0' if it is
    const variantToAdd = {
      ...newVariant,
      additionalPrice: newVariant.additionalPrice || '0'
    };

    setVariants([...variants, variantToAdd]);
    setNewVariant({
      size: '',
      color: '',
      additionalPrice: '0',
      isActive: true
    });
    setShowVariantForm(false);
    setHasVariants(true);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (variants.length === 1) {
      setHasVariants(false);
    }
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    const updatedVariants = [...variants];
    // Ensure additionalPrice defaults to '0' if empty
    if (field === 'additionalPrice') {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value || '0' };
    } else {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    }
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customName || !customBasePrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (hasVariants && variants.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one variant or disable variants",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the event product
      const productResponse = await fetch(`/api/admin/school-events/${eventId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          description: customDescription,
          basePrice: parseFloat(customBasePrice),
          imageUrl: customImageUrl || null,
          isActive: true,
          variants: hasVariants ? variants.map(v => ({
            size: v.size,
            color: v.color,
            additionalPrice: parseFloat(v.additionalPrice || '0'),
            isActive: v.isActive
          })) : []
        })
      });

      if (!productResponse.ok) {
        throw new Error('Failed to create product');
      }

      const product = await productResponse.json();

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      // Redirect back to products list
      router.push(`/admin/school-events/${eventId}/products`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (images: string[]) => {
    if (images.length > 0) {
      setCustomImageUrl(images[0]);
    }
  };

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Error: Event ID not found
          </h1>
          <p className="text-muted-foreground mt-2">
            Please navigate to a valid school event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/school-events/${eventId}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Product to Event</h1>
          <p className="text-muted-foreground">
            Search existing products or create a custom one for this school event
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Search Existing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Existing Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedProduct?.id === product.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => selectProduct(product)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R{parseFloat(product.price || '0').toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={createCustomProduct}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Product Instead
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Product Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isCustomProduct ? 'Custom Product Details' : 'Selected Product Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="basePrice">Base Price (R) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={customBasePrice}
                    onChange={(e) => setCustomBasePrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Product Image</Label>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Upload an image for this product:
                    </div>
                    <ImageUpload onImagesChange={handleImageUpload} />
                  </div>
                </div>

                {/* Variants Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasVariants"
                        checked={hasVariants}
                        onCheckedChange={setHasVariants}
                      />
                      <Label htmlFor="hasVariants" className="text-sm">
                        Enable variants (sizes, colors, pricing)
                      </Label>
                    </div>
                  </div>

                  {hasVariants && (
                    <div className="space-y-4">
                      {/* Existing Variants */}
                      {variants.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Current Variants</Label>
                          <div className="space-y-2">
                            {variants.map((variant, index) => (
                              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                  <Input
                                    placeholder="Size (e.g., S, M, L, XL)"
                                    value={variant.size}
                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                    className="h-8"
                                  />
                                  <Input
                                    placeholder="Color (e.g., Red, Blue, White)"
                                    value={variant.color}
                                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                    className="h-8"
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={variant.additionalPrice}
                                    onChange={(e) => updateVariant(index, 'additionalPrice', e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={variant.isActive}
                                    onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariant(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Variant Form */}
                      {showVariantForm ? (
                        <div className="p-4 border rounded-lg bg-muted/20">
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <Input
                              placeholder="Size (e.g., S, M, L, XL)"
                              value={newVariant.size}
                              onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                              className="h-8"
                            />
                            <Input
                              placeholder="Color (e.g., Red, Blue, White)"
                              value={newVariant.color}
                              onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                              className="h-8"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={newVariant.additionalPrice}
                              onChange={(e) => setNewVariant({ ...newVariant, additionalPrice: e.target.value })}
                              className="h-8"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={addVariant}
                              className="flex-1"
                            >
                              Add Variant
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowVariantForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVariantForm(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {selectedProduct && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Selected from existing products:</strong> {selectedProduct.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can modify the details above before adding to this event.
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Add Product to Event"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
