'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Package, 
  Settings, 
  Eye, 
  EyeOff,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EventProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  variants: EventProductVariant[];
  additionalItems: AdditionalItem[];
}

interface EventProductVariant {
  id: string;
  size: string;
  color: string;
  additionalPrice?: number;
  isActive: boolean;
}

interface AdditionalItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  options: AdditionalItemOption[];
}

interface AdditionalItemOption {
  id: string;
  optionName: string;
  optionValue: string;
  priceAdjustment: number;
  isActive: boolean;
}

interface EditProductForm {
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  isActive: boolean;
}

interface EditVariantForm {
  size: string;
  color: string;
  additionalPrice: string;
  isActive: boolean;
}

interface EditAdditionalItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
}

interface EditAdditionalItemOptionForm {
  optionName: string;
  optionValue: string;
  priceAdjustment: string;
  isActive: boolean;
}

interface EnhancedProductManagementProps {
  eventId: string;
  onProductUpdated?: () => void;
}

export function EnhancedProductManagement({ eventId, onProductUpdated }: EnhancedProductManagementProps) {
  const [products, setProducts] = useState<EventProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<EventProduct | null>(null);
  const [editingVariant, setEditingVariant] = useState<{ productId: string; variant: EventProductVariant } | null>(null);
  const [editingAdditionalItem, setEditingAdditionalItem] = useState<{ productId: string; item: AdditionalItem } | null>(null);
  const [editingOption, setEditingOption] = useState<{ itemId: string; option: AdditionalItemOption } | null>(null);
  const [showAddVariant, setShowAddVariant] = useState<string | null>(null);
  const [showAddAdditionalItem, setShowAddAdditionalItem] = useState<string | null>(null);
  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states
  const [productForm, setProductForm] = useState<EditProductForm>({
    name: '',
    description: '',
    basePrice: '',
    imageUrl: '',
    isActive: true
  });

  const [variantForm, setVariantForm] = useState<EditVariantForm>({
    size: '',
    color: '',
    additionalPrice: '0',
    isActive: true
  });

  const [additionalItemForm, setAdditionalItemForm] = useState<EditAdditionalItemForm>({
    name: '',
    description: '',
    price: '',
    category: '',
    isActive: true
  });

  const [optionForm, setOptionForm] = useState<EditAdditionalItemOptionForm>({
    optionName: '',
    optionValue: '',
    priceAdjustment: '',
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
  }, [eventId]);

  useEffect(() => {
    if (!editingVariant) return;
    const v = editingVariant.variant;
    setVariantForm({
      size: v.size ?? '',
      color: v.color ?? '',
      additionalPrice:
        v.additionalPrice != null ? String(v.additionalPrice) : '0',
      isActive: v.isActive !== false,
    });
  }, [editingVariant]);

  useEffect(() => {
    if (!editingAdditionalItem) return;
    const it = editingAdditionalItem.item;
    setAdditionalItemForm({
      name: it.name ?? '',
      description: it.description ?? '',
      price: it.price != null ? String(it.price) : '',
      category: it.category ?? 'accessory',
      isActive: it.isActive !== false,
    });
  }, [editingAdditionalItem]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/school-events/${eventId}/products`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setProducts(
          list.map((p: EventProduct & Record<string, unknown>) => {
            const basePrice =
              typeof p.basePrice === "number"
                ? p.basePrice
                : Number(p.basePrice) || 0;
            const additionalItemsRaw = p.additionalItems;
            const additionalItems = Array.isArray(additionalItemsRaw)
              ? additionalItemsRaw.map((item: Record<string, unknown>) => ({
                  id: String(item.id),
                  name: String(item.name ?? ''),
                  description: String(item.description ?? ''),
                  price: Number(item.price ?? 0),
                  category: String(item.category ?? 'accessory'),
                  isActive: item.isActive !== false,
                  options: Array.isArray(item.options)
                    ? item.options
                    : [],
                }))
              : [];
            return {
              ...p,
              description: String(p.description ?? ""),
              basePrice,
              variants: Array.isArray(p.variants)
                ? p.variants.map((v: Record<string, unknown>) => ({
                    id: String(v.id),
                    size: String(v.size ?? ''),
                    color: String(v.color ?? ''),
                    additionalPrice: Number(v.additionalPrice ?? 0),
                    isActive: v.isActive !== false,
                  }))
                : [],
              additionalItems,
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: EventProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive
    });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/admin/school-events/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
        setEditingProduct(null);
        fetchProducts();
        onProductUpdated?.();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/school-events/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/school-events/products/${productId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        throw new Error('Failed to toggle product status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle product status',
        variant: 'destructive',
      });
    }
  };

  const handleAddAdditionalItem = async () => {
    if (!showAddAdditionalItem) return;

    try {
      const response = await fetch(`/api/admin/school-events/products/${showAddAdditionalItem}/additional-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(additionalItemForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Additional item added successfully',
        });
        setShowAddAdditionalItem(null);
        setAdditionalItemForm({
          name: '',
          description: '',
          price: '',
          category: '',
          isActive: true
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add additional item');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add additional item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddVariant = async () => {
    if (!showAddVariant) return;
    if (!variantForm.size.trim() || !variantForm.color.trim()) {
      toast({
        title: 'Validation',
        description: 'Size and color are required',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/school-events/products/${showAddVariant}/variants`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            size: variantForm.size.trim(),
            color: variantForm.color.trim(),
            additionalPrice: parseFloat(variantForm.additionalPrice || '0') || 0,
          }),
        }
      );
      if (response.ok) {
        toast({ title: 'Success', description: 'Variant added' });
        setShowAddVariant(null);
        setVariantForm({
          size: '',
          color: '',
          additionalPrice: '0',
          isActive: true,
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add variant');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add variant',
        variant: 'destructive',
      });
    }
  };

  const handleSaveVariant = async () => {
    if (!editingVariant) return;
    if (!variantForm.size.trim() || !variantForm.color.trim()) {
      toast({
        title: 'Validation',
        description: 'Size and color are required',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/school-events/products/variants/${editingVariant.variant.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            size: variantForm.size.trim(),
            color: variantForm.color.trim(),
            additionalPrice: parseFloat(variantForm.additionalPrice || '0') || 0,
            isActive: variantForm.isActive,
          }),
        }
      );
      if (response.ok) {
        toast({ title: 'Success', description: 'Variant updated' });
        setEditingVariant(null);
        fetchProducts();
        onProductUpdated?.();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update variant');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update variant',
        variant: 'destructive',
      });
    }
  };

  const handleSaveAdditionalItem = async () => {
    if (!editingAdditionalItem) return;
    if (!additionalItemForm.name.trim() || !additionalItemForm.category) {
      toast({
        title: 'Validation',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/school-events/products/additional-items/${editingAdditionalItem.item.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: additionalItemForm.name.trim(),
            description: additionalItemForm.description || '',
            price: parseFloat(additionalItemForm.price || '0') || 0,
            category: additionalItemForm.category,
            isActive: additionalItemForm.isActive,
          }),
        }
      );
      if (response.ok) {
        toast({ title: 'Success', description: 'Additional item updated' });
        setEditingAdditionalItem(null);
        fetchProducts();
        onProductUpdated?.();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update item');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVariantActive = async (
    variantId: string,
    nextActive: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/admin/school-events/products/variants/${variantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: nextActive }),
        }
      );
      if (response.ok) {
        toast({
          title: 'Success',
          description: nextActive ? 'Variant activated' : 'Variant deactivated',
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        throw new Error('Failed to update variant');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update variant',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAdditionalItemActive = async (
    itemId: string,
    nextActive: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/admin/school-events/products/additional-items/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: nextActive }),
        }
      );
      if (response.ok) {
        toast({
          title: 'Success',
          description: nextActive ? 'Item activated' : 'Item deactivated',
        });
        fetchProducts();
        onProductUpdated?.();
      } else {
        throw new Error('Failed to update item');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Products List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                  >
                    {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Base Price</Label>
                  <p className="text-lg font-semibold">R{product.basePrice?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Variants</Label>
                  <p className="text-lg">{product.variants?.length || 0} variants</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingVariant(null);
                      setVariantForm({
                        size: '',
                        color: '',
                        additionalPrice: '0',
                        isActive: true,
                      });
                      setShowAddVariant(product.id);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                <div>
                  <Label className="text-sm font-medium">Additional Items</Label>
                  <p className="text-lg">{product.additionalItems?.length || 0} items</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAdditionalItem(null);
                      setAdditionalItemForm({
                        name: '',
                        description: '',
                        price: '',
                        category: '',
                        isActive: true,
                      });
                      setShowAddAdditionalItem(product.id);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Variants List */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Variants</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-sm">
                          {variant.size} - {variant.color}
                          {variant.additionalPrice != null &&
                          variant.additionalPrice > 0
                            ? ` (+R${variant.additionalPrice.toFixed(2)})`
                            : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={variant.isActive}
                            onCheckedChange={(checked) =>
                              handleToggleVariantActive(
                                variant.id,
                                checked === true
                              )
                            }
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddVariant(null);
                              setEditingVariant({
                                productId: product.id,
                                variant,
                              });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Items List */}
              {product.additionalItems && product.additionalItems.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Additional Items</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {product.additionalItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <p className="text-xs text-muted-foreground">R{item.price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={(checked) =>
                              handleToggleAdditionalItemActive(
                                item.id,
                                checked === true
                              )
                            }
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddAdditionalItem(null);
                              setEditingAdditionalItem({
                                productId: product.id,
                                item,
                              });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="basePrice">Base Price (R)</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={productForm.basePrice}
                onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={productForm.isActive}
                onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit variant */}
      <Dialog
        open={!!editingVariant}
        onOpenChange={(open) => {
          if (!open) setEditingVariant(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editVariantSize">Size</Label>
              <Input
                id="editVariantSize"
                value={variantForm.size}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, size: e.target.value })
                }
                placeholder="e.g. 7-8"
              />
            </div>
            <div>
              <Label htmlFor="editVariantColor">Colour</Label>
              <Input
                id="editVariantColor"
                value={variantForm.color}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, color: e.target.value })
                }
                placeholder="e.g. Blue"
              />
            </div>
            <div>
              <Label htmlFor="editVariantExtra">Extra price (R)</Label>
              <Input
                id="editVariantExtra"
                type="number"
                step="0.01"
                min="0"
                value={variantForm.additionalPrice}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    additionalPrice: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Added on top of the product base price for this option.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="editVariantActive"
                checked={variantForm.isActive}
                onCheckedChange={(checked) =>
                  setVariantForm({ ...variantForm, isActive: checked })
                }
              />
              <Label htmlFor="editVariantActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingVariant(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveVariant}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit additional item */}
      <Dialog
        open={!!editingAdditionalItem}
        onOpenChange={(open) => {
          if (!open) setEditingAdditionalItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit additional item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editItemName">Item name</Label>
              <Input
                id="editItemName"
                value={additionalItemForm.name}
                onChange={(e) =>
                  setAdditionalItemForm({
                    ...additionalItemForm,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="editItemDescription">Description</Label>
              <Textarea
                id="editItemDescription"
                value={additionalItemForm.description}
                onChange={(e) =>
                  setAdditionalItemForm({
                    ...additionalItemForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="editItemPrice">Price (R)</Label>
              <Input
                id="editItemPrice"
                type="number"
                step="0.01"
                min="0"
                value={additionalItemForm.price}
                onChange={(e) =>
                  setAdditionalItemForm({
                    ...additionalItemForm,
                    price: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={additionalItemForm.category}
                onValueChange={(value) =>
                  setAdditionalItemForm({
                    ...additionalItemForm,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="addon">Add-on</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="editItemActive"
                checked={additionalItemForm.isActive}
                onCheckedChange={(checked) =>
                  setAdditionalItemForm({
                    ...additionalItemForm,
                    isActive: checked,
                  })
                }
              />
              <Label htmlFor="editItemActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingAdditionalItem(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAdditionalItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog
        open={!!showAddVariant}
        onOpenChange={(open) => {
          if (!open) setShowAddVariant(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="variantSize">Size</Label>
              <Input
                id="variantSize"
                value={variantForm.size}
                onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                placeholder="e.g., S, M, L, XL"
              />
            </div>
            <div>
              <Label htmlFor="variantColor">Colour</Label>
              <Input
                id="variantColor"
                value={variantForm.color}
                onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                placeholder="e.g., Red, Blue, White"
              />
            </div>
            <div>
              <Label htmlFor="variantExtraPrice">Extra price (R)</Label>
              <Input
                id="variantExtraPrice"
                type="number"
                step="0.01"
                min="0"
                value={variantForm.additionalPrice}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    additionalPrice: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVariant(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddVariant}>
                Add variant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Additional Item Dialog */}
      <Dialog open={!!showAddAdditionalItem} onOpenChange={() => setShowAddAdditionalItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Additional Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={additionalItemForm.name}
                onChange={(e) => setAdditionalItemForm({ ...additionalItemForm, name: e.target.value })}
                placeholder="e.g., Cap, Sticker, Badge"
              />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={additionalItemForm.description}
                onChange={(e) => setAdditionalItemForm({ ...additionalItemForm, description: e.target.value })}
                placeholder="Brief description of the item"
              />
            </div>
            <div>
              <Label htmlFor="itemPrice">Price (R)</Label>
              <Input
                id="itemPrice"
                type="number"
                step="0.01"
                value={additionalItemForm.price}
                onChange={(e) => setAdditionalItemForm({ ...additionalItemForm, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="itemCategory">Category</Label>
              <Select
                value={additionalItemForm.category}
                onValueChange={(value) => setAdditionalItemForm({ ...additionalItemForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="addon">Add-on</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddAdditionalItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddAdditionalItem}>
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
