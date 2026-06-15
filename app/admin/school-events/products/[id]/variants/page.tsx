"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

interface EventProductVariant {
  id: string;
  size: string;
  color: string;
  additionalPrice: number;
  isActive: boolean;
}

interface EventProduct {
  id: string;
  name: string;
  basePrice: number;
  variants: EventProductVariant[];
}

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<EventProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<EventProductVariant | null>(null);
  const [formData, setFormData] = useState({
    size: "",
    color: "",
    additionalPrice: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/school-events/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingVariant 
        ? `/api/admin/school-events/products/variants/${editingVariant.id}`
        : `/api/admin/school-events/products/${params.id}/variants`;
      
      const method = editingVariant ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          additionalPrice: parseFloat(formData.additionalPrice),
          productId: params.id,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingVariant(null);
        setFormData({ size: "", color: "", additionalPrice: "" });
        fetchProduct(params.id as string);
      } else {
        throw new Error('Failed to save variant');
      }
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save variant. Please try again.');
    }
  };

  const handleEdit = (variant: EventProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      size: variant.size,
      color: variant.color,
      additionalPrice: variant.additionalPrice.toString(),
    });
    setShowAddForm(true);
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/school-events/products/variants/${variantId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchProduct(params.id as string);
      } else {
        throw new Error('Failed to delete variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Failed to delete variant. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product variants...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button asChild>
          <Link href="/admin/school-events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/school-events/${product.id}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Variants</h1>
          <p className="text-muted-foreground">
            {product.name} - Configure size and color options
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Variants</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Add/Edit Variant Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    placeholder="e.g., S, M, L, XL"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="e.g., Red, Blue, White"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="additionalPrice">Additional Price (R)</Label>
                  <Input
                    id="additionalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additionalPrice}
                    onChange={(e) => handleInputChange('additionalPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingVariant ? 'Update Variant' : 'Add Variant'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingVariant(null);
                    setFormData({ size: "", color: "", additionalPrice: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Variants List */}
      {product.variants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Variants Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add size and color options to make this product available for ordering.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Variant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {product.variants.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {variant.size} - {variant.color}
                      </h3>
                      <Badge variant={variant.isActive ? "default" : "secondary"}>
                        {variant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Base Price: R{product.basePrice.toFixed(2)}
                      {variant.additionalPrice > 0 && (
                        <span className="text-primary font-medium">
                          {" "}+ R{variant.additionalPrice.toFixed(2)}
                        </span>
                      )}
                    </p>
                    <p className="font-semibold text-primary">
                      Total Price: R{(product.basePrice + variant.additionalPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(variant.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
