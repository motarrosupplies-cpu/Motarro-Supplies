'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from './image-upload';
import { ColorOption } from '@/types/product';
import { VariantMatrix, type VariantRow, FIXED_SIZES } from './variant-matrix';
import {
  normalizeSupabaseUrls,
  PRODUCT_AVAILABILITY,
  PRODUCT_CONDITIONS,
  resolveAvailability,
  shouldRequireAvailabilityDate,
  fromDateTimeLocalInput,
} from '@/lib/utils';
import { fetchMenuItemsForProducts, buildMenuTree, getMainCategories, getSubCategories, type MenuItem } from '@/lib/menu-utils';
import { AiProductContentPanel } from './AiProductContentPanel';
import type { GeneratedProductContent } from '@/lib/xai/types';

const colorOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price is required'),
  originalPrice: z.number().optional(),
  category: z.string().min(1, 'Category is required'), // Made flexible to accept any category
  subcategory: z.string().optional().nullable(), // Subcategory from menu management
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string().optional().nullable()).optional().nullable().default([]), // Alt text for each image - completely optional
  description: z.string().min(1, 'Description is required'),
  stock: z.number().min(0, 'Stock is required'),
  isNew: z.boolean().default(true),
  onSale: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
  hasColorOptions: z.boolean().default(false),
  hasSizeOptions: z.boolean().default(false),
  colors: z.array(colorOptionSchema).optional(),
  sizes: z.array(z.string()).optional(),
  variants: z.array(z.any()).optional(),
  // SEO Fields
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().optional(),
  availability: z.enum(PRODUCT_AVAILABILITY).default('in_stock'),
  availabilityDate: z.string().optional().nullable(),
  condition: z.enum(PRODUCT_CONDITIONS).default('new'),
  lowStockThreshold: z.number().int().min(0).max(100000).optional().nullable(),
}).superRefine((data, ctx) => {
  if (
    shouldRequireAvailabilityDate(data.availability) &&
    (!data.availabilityDate || fromDateTimeLocalInput(data.availabilityDate) === null)
  ) {
    ctx.addIssue({
      path: ['availabilityDate'],
      code: z.ZodIssueCode.custom,
      message: 'Availability date is required when availability is preorder or available soon.',
    });
  }
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  onProductAdded?: () => void;
}

export function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");
  const [newSize, setNewSize] = useState("");
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const { toast } = useToast();
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [mainCategories, setMainCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ value: string; label: string }>>([]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      originalPrice: undefined,
      category: '', // Will be set from menu items
      subcategory: null,
      images: [],
      imageAltTexts: [],
      description: '',
      stock: 0,
      isNew: true,
      onSale: false,
      status: 'active',
      hasColorOptions: false,
      hasSizeOptions: false,
      colors: [],
      sizes: [],
      variants: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoSlug: '',
    },
  });

  // Fetch menu items when modal opens
  useEffect(() => {
    if (!open) return;
    
    const loadMenuItems = async () => {
      try {
        const items = await fetchMenuItemsForProducts();
        setMenuItems(items);
        const tree = buildMenuTree(items);
        setMenuTree(tree);
        const mainCats = getMainCategories(tree);
        setMainCategories(mainCats);
        
        // Set initial category if available
        if (mainCats.length > 0 && !form.getValues('category')) {
          form.setValue('category', mainCats[0].value);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
      }
    };
    
    loadMenuItems();
  }, [open]); // Remove form from dependencies to avoid unnecessary re-renders

  // Update subcategories when category changes
  const watchedCategory = form.watch('category');
  useEffect(() => {
    if (menuTree.length > 0 && watchedCategory) {
      const subs = getSubCategories(menuTree, watchedCategory);
      setSubCategories(subs);
      // Clear subcategory when category changes
      form.setValue('subcategory', null);
    } else {
      setSubCategories([]);
    }
  }, [watchedCategory, menuTree, form]);

  const hasColorOptions = form.watch("hasColorOptions");
  const hasSizeOptions = form.watch("hasSizeOptions");
  const watchedColors = form.watch("colors") || [];
  const watchedSizes = form.watch("sizes") || [];

  const handleVariantRowsChange = (rows: VariantRow[]) => {
    setVariantRows(rows);

    const aggregatedStock = rows.reduce(
      (sum, row) => sum + (Number(row.stockAvailable) || 0),
      0
    );

    form.setValue("stock", aggregatedStock);
  };

  const addColor = () => {
    const colorName = newColorName.trim();
    if (!colorName) {
      toast({
        title: "Error",
        description: "Color name is required",
        variant: "destructive",
      });
      return;
    }

    const currentColors = form.getValues("colors") || [];
    if (currentColors.some(color => color.name.toLowerCase() === colorName.toLowerCase())) {
      toast({
        title: "Duplicate colour",
        description: `${colorName} already exists.`,
        variant: "destructive",
      });
      return;
    }

    form.setValue("colors", [...currentColors, { name: colorName, value: newColorValue }]);
    setNewColorName("");
    setNewColorValue("#000000");
  };

  const removeColor = (index: number) => {
    const currentColors = form.getValues("colors") || [];
    form.setValue("colors", currentColors.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const sizeValue = newSize.trim();
    if (!sizeValue) {
      toast({
        title: "Error",
        description: "Size name is required",
        variant: "destructive",
      });
      return;
    }

    const currentSizes = form.getValues("sizes") || [];
    if (currentSizes.some(size => size.toLowerCase() === sizeValue.toLowerCase())) {
      toast({
        title: "Duplicate size",
        description: `${sizeValue} already exists.`,
        variant: "destructive",
      });
      return;
    }

    form.setValue("sizes", [...currentSizes, sizeValue]);
    setNewSize("");
  };

  const removeSize = (index: number) => {
    const currentSizes = form.getValues("sizes") || [];
    form.setValue("sizes", currentSizes.filter((_, i) => i !== index));
  };

  const buildCanonicalVariants = (): VariantRow[] => {
    const enableColors = form.getValues("hasColorOptions");
    const enableSizes = form.getValues("hasSizeOptions");
    const colors = form.getValues("colors") || [];
    const sizes = form.getValues("sizes") || [];

    const map = new Map<string, VariantRow>();
    for (const row of variantRows) {
      const key = `${row.colorValue ?? ""}|${row.size ?? ""}`;
      map.set(key, row);
    }

    const colorLoop = enableColors
      ? (colors.length > 0
          ? colors
          : Array.from(
              new Map(
                variantRows
                  .filter(row => row.colorValue)
                  .map(row => [
                    row.colorValue as string,
                    {
                      name: row.colorName ?? "",
                      value: row.colorValue as string,
                    },
                  ])
              ).values()
            ))
      : [{ name: "", value: "" }];

    if (colorLoop.length === 0) {
      colorLoop.push({ name: "", value: "" });
    }

    const sizeLoop = enableSizes
      ? (sizes.length > 0
          ? sizes
          : Array.from(
              new Set(
                variantRows
                  .map(row => row.size)
                  .filter((size): size is string => !!size && size.trim() !== "")
              )
            ))
      : [""];

    if (enableSizes && sizeLoop.length === 0) {
      return [];
    }

    const rows: VariantRow[] = [];

    const resolvedColorLoop = enableColors ? colorLoop : [{ name: "", value: "" }];
    const resolvedSizeLoop = enableSizes ? sizeLoop : [""];

    for (const color of resolvedColorLoop) {
      const colorName = enableColors ? color.name || null : null;
      const colorValue = enableColors ? color.value || null : null;

      for (const size of resolvedSizeLoop) {
        const sizeValue = enableSizes ? size || null : null;
        const key = `${colorValue ?? ""}|${sizeValue ?? ""}`;
        const existing = map.get(key);

        rows.push(
          existing ?? {
            colorName,
            colorValue,
            size: sizeValue,
            stockAvailable: 0,
            stockIncoming: 0,
            stockReserved: 0,
            priceOverride: null,
            isActive: true,
          }
        );
      }
    }

    if (!enableColors && !enableSizes && rows.length === 0) {
      rows.push({
        colorName: null,
        colorValue: null,
        size: null,
        stockAvailable: 0,
        stockIncoming: 0,
        stockReserved: 0,
        priceOverride: null,
        isActive: true,
      });
    }

    return rows;
  };

  async function onSubmit(data: ProductFormValues) {
    try {
      console.log('=== ADD PRODUCT FORM DEBUG ===');
      console.log('Form data:', JSON.stringify(data, null, 2));
      console.log('Variant rows:', JSON.stringify(variantRows, null, 2));
      
      const hasColors = data.hasColorOptions && Array.isArray(data.colors) && data.colors.length > 0;
      const hasSizes = data.hasSizeOptions && Array.isArray(data.sizes) && data.sizes.length > 0;

      if (data.hasColorOptions && !hasColors) {
        toast({
          title: "Validation error",
          description: "Please add at least one colour or disable colour options.",
          variant: "destructive",
        });
        return;
      }

      if (data.hasSizeOptions && !hasSizes) {
        toast({
          title: "Validation error",
          description: "Please add at least one size or disable size options.",
          variant: "destructive",
        });
        return;
      }

      const normalizedImages = normalizeSupabaseUrls(data.images, 'product-images');
      const normalizedAltTexts = Array.isArray(data.imageAltTexts)
        ? data.imageAltTexts.filter(
            (alt): alt is string => typeof alt === 'string' && alt.trim().length > 0,
          )
        : [];

      const canonicalVariants = buildCanonicalVariants();

      if ((hasColors || hasSizes) && canonicalVariants.length === 0) {
        toast({
          title: "Validation error",
          description: "No variants were generated. Please confirm your colour and size selections.",
          variant: "destructive",
        });
        return;
      }

      const totalStock = canonicalVariants.reduce(
        (sum, row) => sum + (Number(row.stockAvailable) || 0),
        0
      );

      const requestData = {
        ...data,
        subcategory: data.subcategory || null,
        hasColorOptions: hasColors,
        hasSizeOptions: hasSizes,
        images: normalizedImages,
        imageAltTexts: normalizedAltTexts,
        stock: totalStock,
        // Note: status will be forced to 'active' by backend for frontend visibility
        status: 'active', // Explicitly set to ensure frontend visibility
        // Ensure colors and sizes are properly handled based on options
        colors: hasColors ? data.colors : null,
        sizes: hasSizes ? data.sizes : null,
        variants:
          hasColors || hasSizes
            ? canonicalVariants.map((variant) => ({
                colorName: variant.colorName,
                colorValue: variant.colorValue,
                size: variant.size,
                stockAvailable: Number(variant.stockAvailable) || 0,
                stockIncoming: Number(variant.stockIncoming) || 0,
                stockReserved: Number(variant.stockReserved) || 0,
                priceOverride:
                  variant.priceOverride === null || variant.priceOverride === undefined
                    ? null
                    : Number(variant.priceOverride),
                isActive: variant.isActive !== false,
              }))
            : [],
      };
      
      console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
      
      setIsSubmitting(true);
      const response = await fetch('/api/products/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      setOpen(false);
      form.reset();
      setVariantRows([]);
      
      // Force refresh with cache busting
      if (onProductAdded) {
        // Add a small delay to ensure database is updated
        setTimeout(() => {
          onProductAdded();
        }, 500);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] h-[90vh] p-0 overflow-hidden">
        <div className="h-full overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--primary) / 0.4) hsl(var(--muted))'
        }}>
          <div className="p-6">
            <DialogHeader className="sticky top-0 z-10 bg-background pb-4">
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mainCategories.length > 0 ? (
                            mainCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))
                          ) : (
                            // Fallback to hardcoded options if menu items not loaded
                            <>
                              <SelectItem value="men">Men</SelectItem>
                              <SelectItem value="women">Women</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                              <SelectItem value="unisex">Unisex</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === '__none__' ? null : value)} 
                        value={field.value || '__none__'}
                        disabled={subCategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={subCategories.length > 0 ? "Select a sub-category (optional)" : "No sub-categories available"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {subCategories.map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {subCategories.length === 0 && watchedCategory && (
                        <p className="text-xs text-muted-foreground">
                          No sub-categories available for this category
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          onImagesChange={(newImages) => {
                            field.onChange(newImages);
                          }}
                          maxFiles={10}
                          initialImages={field.value || []}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Alt Text Section */}
                {form.watch("images") && form.watch("images").length > 0 && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <h3 className="text-lg font-semibold">Image Alt Text (SEO) - Preferred</h3>
                    <p className="text-sm text-muted-foreground">
                      Add descriptive alt text for each image to improve SEO and accessibility (optional but recommended)
                    </p>
                    {form.watch("images").map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={image} 
                            alt={`Product image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`imageAltTexts.${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Alt Text for Image {index + 1} (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={`Describe this image (e.g., "Blue cotton t-shirt front view")`}
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) => field.onChange(e.target.value || null)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <AiProductContentPanel
                  context={{
                    name: form.watch('name'),
                    category: form.watch('category'),
                    subcategory: form.watch('subcategory'),
                    price: form.watch('price'),
                    colors: (form.watch('colors') || []).map((color) => color.name),
                    sizes: form.watch('sizes') || [],
                    existingDescription: form.watch('description'),
                  }}
                  onApply={(content: GeneratedProductContent) => {
                    form.setValue('description', content.description);
                    form.setValue('seoTitle', content.seoTitle);
                    form.setValue('seoDescription', content.seoDescription);
                    form.setValue('seoKeywords', content.seoKeywords);
                  }}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter product description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SEO Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold">SEO & Meta Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Custom title for search engines (max 60 characters)" 
                            maxLength={60}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/60 characters
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Meta description for search engines (max 160 characters)" 
                            maxLength={160}
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/160 characters
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Keywords (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Keywords separated by commas (e.g., t-shirt, cotton, casual)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Separate keywords with commas for better SEO
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="custom-url-slug" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Custom URL path for this product (e.g., custom-tshirt-design)
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Stock is derived from variants; no standalone stock input here */}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasColorOptions"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Enable Colour Options</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasSizeOptions"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Enable Size Options</FormLabel>
                    </FormItem>
                  )}
                />

                {hasColorOptions && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Color Options</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Color name"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                      />
                      <Input
                        type="color"
                        value={newColorValue}
                        onChange={(e) => setNewColorValue(e.target.value)}
                        className="w-20 p-1 h-10"
                      />
                      <Button type="button" onClick={addColor}>Add Color</Button>
                    </div>
                    <div className="space-y-2">
                      {watchedColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasSizeOptions && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Size Options</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("sizes", FIXED_SIZES)}
                      >
                        Use Standard Sizes
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Size label (e.g. S, M, L)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                      />
                      <Button type="button" onClick={addSize}>Add Size</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedSizes.map((size, index) => (
                        <div key={`${size}-${index}`} className="flex items-center gap-2 rounded-md border px-3 py-1">
                          <span className="text-sm font-medium uppercase">{size}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSize(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variant matrix for initial creation */}
                <VariantMatrix
                  colors={watchedColors}
                  sizes={watchedSizes}
                  enableColors={hasColorOptions}
                  enableSizes={hasSizeOptions}
                  value={variantRows}
                  onChange={handleVariantRowsChange}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 