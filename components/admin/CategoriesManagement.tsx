"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface KevroTaxonomy {
  categories: Array<{ name: string; count: number }>;
  types: Array<{ name: string; count: number; storeSections: string[] }>;
  brands: Array<{ name: string; count: number }>;
}

export function CategoriesManagement() {
  const [nativeCategories, setNativeCategories] = useState<ProductCategory[]>([]);
  const [kevroTaxonomy, setKevroTaxonomy] = useState<KevroTaxonomy>({
    categories: [],
    types: [],
    brands: [],
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [nativeRes, kevroRes] = await Promise.all([
        fetch("/api/admin/categories?t=" + Date.now(), { cache: "no-store" }),
        fetch("/api/admin/categories/kevro-taxonomy?t=" + Date.now(), {
          cache: "no-store",
        }),
      ]);

      if (nativeRes.ok) {
        setNativeCategories(await nativeRes.json());
      }
      if (kevroRes.ok) {
        setKevroTaxonomy(await kevroRes.json());
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;

    const payload = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || null,
    };

    const response = editingCategory
      ? await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || "Failed to save category");
      return;
    }

    setIsDialogOpen(false);
    resetForm();
    loadData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error || "Failed to delete category");
      return;
    }
    loadData();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading categories...</div>;
  }

  return (
    <Tabs defaultValue="native" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="native">Store Categories</TabsTrigger>
        <TabsTrigger value="kevro-categories">
          Kevro Categories ({kevroTaxonomy.categories.length})
        </TabsTrigger>
        <TabsTrigger value="kevro-types">
          Types ({kevroTaxonomy.types.length})
        </TabsTrigger>
        <TabsTrigger value="kevro-brands">
          Brands ({kevroTaxonomy.brands.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="native">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Categories</CardTitle>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                  />
                  <Button onClick={saveCategory} className="w-full">
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {nativeCategories.length === 0 ? (
              <p className="text-muted-foreground">No store categories yet.</p>
            ) : (
              nativeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    {category.description && (
                      <p className="text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryName(category.name);
                        setCategoryDescription(category.description || "");
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <p className="text-sm text-muted-foreground pt-2">
              Header navigation filters are managed in{" "}
              <Link href="/admin/menu" className="text-primary underline">
                Menu Management
              </Link>
              . Use filter keywords on submenu items to match Kevro types.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kevro-categories">
        <Card>
          <CardHeader>
            <CardTitle>Kevro Supplier Categories</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kevroTaxonomy.categories.map((category) => (
              <div key={category.name} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{category.name}</p>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
                <Link
                  href={`/branded-catalog?category=${encodeURIComponent(category.name)}`}
                  className="text-sm text-primary inline-flex items-center gap-1 mt-2"
                >
                  View in catalog <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kevro-types">
        <Card>
          <CardHeader>
            <CardTitle>Kevro Product Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kevroTaxonomy.types.map((type) => (
              <div
                key={type.name}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{type.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.storeSections.map((section) => (
                      <Badge key={section} variant="outline">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{type.count} products</Badge>
                  <Link
                    href={`/branded-catalog?type=${encodeURIComponent(type.name)}`}
                    className="text-sm text-primary inline-flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kevro-brands">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kevro Brands</CardTitle>
            <Button asChild variant="outline">
              <Link href="/admin/kevro">Markup rules</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kevroTaxonomy.brands.map((brand) => (
              <div key={brand.name} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{brand.name}</p>
                  <Badge variant="secondary">{brand.count}</Badge>
                </div>
                <Link
                  href={`/branded-catalog?brand=${encodeURIComponent(brand.name)}`}
                  className="text-sm text-primary inline-flex items-center gap-1 mt-2"
                >
                  View in catalog <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
