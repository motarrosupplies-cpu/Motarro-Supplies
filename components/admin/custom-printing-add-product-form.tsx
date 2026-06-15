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
import type { ProductDetails } from '@/types/product';
import { VariantMatrix, type VariantRow, FIXED_SIZES } from './variant-matrix';
import {
  PRODUCT_AVAILABILITY,
  PRODUCT_CONDITIONS,
  resolveAvailability,
  shouldRequireAvailabilityDate,
  toDateTimeLocalInput,
  fromDateTimeLocalInput,
} from '@/lib/utils';
import { normalizeSupabaseUrls } from '@/lib/utils';
import { fetchMenuItemsForProducts, buildMenuTree, getMainCategories, getSubCategories, type MenuItem } from '@/lib/menu-utils';

const colorOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const customPrintingProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional().nullable(),
  price: z.number().min(0, 'Price is required'),
  originalPrice: z.number().optional().nullable(),
  category: z.string().optional().nullable(), // Category from menu management
  subcategory: z.string().optional().nullable(), // Subcategory from menu management
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string().optional().nullable()).optional().nullable().default([]),
  description: z.string().min(1, 'Description is required'),
  stock: z.number().min(0, 'Stock is required'),
  isNew: z.boolean().default(true),
  onSale: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
  hasColorOptions: z.boolean().default(false),
  hasSizeOptions: z.boolean().default(false),
  colors: z.array(colorOptionSchema).optional().nullable(),
  sizes: z.array(z.string()).optional().nullable(),
  variants: z.array(z.any()).optional().nullable(),
  details: z.object({
    material: z.string().optional(),
    fit: z.string().optional(),
    care: z.string().optional(),
    origin: z.string().optional(),
  }).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  seoSlug: z.string().optional().nullable(),
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
      message: 'Availability date is required for preorder or available soon status.',
    });
  }
});

type CustomPrintingProductFormValues = z.infer<typeof customPrintingProductSchema>;

interface CustomPrintingAddProductFormProps {
  onProductAdded: () => void;
}

export function CustomPrintingAddProductForm({ onProductAdded }: CustomPrintingAddProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const form = useForm<CustomPrintingProductFormValues>({
    resolver: zodResolver(customPrintingProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      originalPrice: undefined,
      category: null,
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
      details: {},
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoSlug: '',
      availability: 'in_stock',
      availabilityDate: null,
      condition: 'new',
      lowStockThreshold: 5,
    },
  });

  const hasColorOptions = form.watch("hasColorOptions");
  const hasSizeOptions = form.watch("hasSizeOptions");
  const watchedColors = form.watch("colors") || [];
  const watchedSizes = form.watch("sizes") || [];
  const watchedStock = form.watch("stock");
  const watchedAvailability = form.watch("availability");
  const safeAvailability = resolveAvailability(watchedAvailability, watchedStock);
  const requiresAvailabilityDate = shouldRequireAvailabilityDate(safeAvailability);
  const colorSignature = watchedColors.map(color => `${color?.name ?? ""}:${color?.value ?? ""}`).join('|');
  const sizeSignature = watchedSizes.map(size => size ?? "").join('|');

  const availabilityOptions = [
    { label: 'In stock', value: 'in_stock' },
    { label: 'Out of stock', value: 'out_of_stock' },
    { label: 'Preorder', value: 'preorder' },
    { label: 'Available soon', value: 'backorder_soon' },
  ];

  const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Refurbished', value: 'refurbished' },
    { label: 'Used', value: 'used' },
  ];

  function buildCanonicalVariants(): VariantRow[] {
    const enableColors = !!form.getValues("hasColorOptions");
    const enableSizes = !!form.getValues("hasSizeOptions");
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
      const currentStock = Number(form.getValues("stock")) || 0;
      rows.push({
        colorName: null,
        colorValue: null,
        size: null,
        stockAvailable: currentStock,
        stockIncoming: 0,
        stockReserved: 0,
        priceOverride: null,
        isActive: true,
      });
    }

    return rows;
  }

  const handleVariantRowsChange = (rows: VariantRow[]) => {
    setVariantRows(rows);

    const aggregatedStock = rows.reduce(
      (sum, row) => sum + (Number(row.stockAvailable) || 0),
      0
    );

    form.setValue("stock", aggregatedStock);
  };

  useEffect(() => {
    if (!isOpen) return;

    const newRows = buildCanonicalVariants();
    const currentStructure = variantRows
      .map((r) => `${r.colorValue ?? "null"}|${r.size ?? "null"}`)
      .sort()
      .join('|');
    const newStructure = newRows
      .map((r) => `${r.colorValue ?? "null"}|${r.size ?? "null"}`)
      .sort()
      .join('|');

    if (currentStructure !== newStructure) {
      setVariantRows(newRows);
    }
  }, [isOpen, hasColorOptions, hasSizeOptions, colorSignature, sizeSignature]);

  useEffect(() => {
    const numericStock = Number(watchedStock ?? 0);
    if (numericStock > 0 && safeAvailability === 'out_of_stock') {
      form.setValue('availability', 'in_stock', { shouldDirty: true });
    } else if (numericStock <= 0 && safeAvailability === 'in_stock') {
      form.setValue('availability', 'out_of_stock', { shouldDirty: true });
    }
  }, [safeAvailability, watchedStock, form]);

  useEffect(() => {
    if (!requiresAvailabilityDate && form.getValues('availabilityDate')) {
      form.setValue('availabilityDate', '', { shouldDirty: true });
    }
  }, [requiresAvailabilityDate, form]);

  // Fetch menu items when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const loadMenuItems = async () => {
      try {
        const items = await fetchMenuItemsForProducts();
        setMenuItems(items);
        const tree = buildMenuTree(items);
        setMenuTree(tree);
        const mainCats = getMainCategories(tree);
        setMainCategories(mainCats);
        
        // Set initial category if available (prefer "Custom Printing")
        const customPrinting = mainCats.find(cat => 
          cat.label.toLowerCase().includes('custom') || cat.label.toLowerCase().includes('printing')
        );
        if (customPrinting && !form.getValues('category')) {
          form.setValue('category', customPrinting.value);
        } else if (mainCats.length > 0 && !form.getValues('category')) {
          form.setValue('category', mainCats[0].value);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
      }
    };
    
    loadMenuItems();
  }, [isOpen]); // Remove form from dependencies to avoid unnecessary re-renders

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

  const addColor = () => {
    if (!newColorName) {
      toast({
        title: "Error",
        description: "Color name is required",
        variant: "destructive",
      });
      return;
    }

    const currentColors = form.getValues("colors") || [];
    form.setValue("colors", [...currentColors, { name: newColorName, value: newColorValue }]);
    setNewColorName("");
    setNewColorValue("#000000");
  };

  const removeColor = (index: number) => {
    const currentColors = form.getValues("colors") || [];
    const safeColors = Array.isArray(currentColors) ? currentColors : [];
    form.setValue("colors", safeColors.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (!newSize) {
      toast({
        title: "Error",
        description: "Size name is required",
        variant: "destructive",
      });
      return;
    }

    const currentSizes = form.getValues("sizes") || [];
    form.setValue("sizes", [...currentSizes, newSize]);
    setNewSize("");
  };

  const removeSize = (index: number) => {
    const currentSizes = form.getValues("sizes") || [];
    const safeSizes = Array.isArray(currentSizes) ? currentSizes : [];
    form.setValue("sizes", safeSizes.filter((_, i) => i !== index));
  };

  async function onSubmit(data: CustomPrintingProductFormValues) {
    try {
      setIsSubmitting(true);
      
      // Validate toggle states match actual data
      const hasColors = data.hasColorOptions && data.colors && data.colors.length > 0;
      const hasSizes = data.hasSizeOptions && data.sizes && data.sizes.length > 0;
      
      if (data.hasColorOptions && !hasColors) {
        toast({
          title: 'Validation Error',
          description: 'Color options are enabled but no colors are defined. Please add at least one color.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (data.hasSizeOptions && !hasSizes) {
        toast({
          title: 'Validation Error',
          description: 'Size options are enabled but no sizes are defined. Please add at least one size.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const normalizedImages = normalizeSupabaseUrls(data.images, 'product-images');
      const normalizedAltTexts = Array.isArray(data.imageAltTexts)
        ? data.imageAltTexts.filter(
            (alt): alt is string => typeof alt === 'string' && alt.trim().length > 0,
          )
        : [];

      // Build the correct data structure based on toggles
      const canonicalVariants = buildCanonicalVariants();
      const totalStock = canonicalVariants.reduce(
        (sum, row) => sum + (Number(row.stockAvailable) || 0),
        0
      );
      
      // For simple products, ensure stock is valid
      if (!data.hasColorOptions && !data.hasSizeOptions) {
        if (data.stock < 0) {
          toast({
            title: 'Validation Error',
            description: 'Stock quantity must be 0 or greater.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      const requestData = {
        ...data,
        category: data.category || 'custom printing', // Use selected category or fallback
        subcategory: data.subcategory || null,
        images: normalizedImages,
        imageAltTexts: normalizedAltTexts,
        stock: hasColors || hasSizes ? totalStock : data.stock,
        // Note: status will be forced to 'active' by backend for frontend visibility
        status: 'active', // Explicitly set to ensure frontend visibility
        // Send variant data only if variants exist (empty array for simple products)
        variants: (hasColors || hasSizes) ? canonicalVariants.map(v => ({
          colorName: v.colorName,
          colorValue: v.colorValue,
          size: v.size,
          stockAvailable: Number(v.stockAvailable) || 0,
          stockIncoming: Number(v.stockIncoming) || 0,
          stockReserved: Number(v.stockReserved) || 0,
          priceOverride: v.priceOverride === null || v.priceOverride === undefined ? null : Number(v.priceOverride),
          isActive: v.isActive,
        })) : [],
        // Ensure colors and sizes are properly handled based on options
        colors: data.hasColorOptions && data.colors && data.colors.length > 0 ? data.colors : null,
        sizes: data.hasSizeOptions && data.sizes && data.sizes.length > 0 ? data.sizes : null,
        // Handle nullable fields properly
        originalPrice: data.originalPrice || null,
        details: data.details || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        seoSlug: data.seoSlug || null,
        availability: data.availability,
        availabilityDate: data.availabilityDate ? fromDateTimeLocalInput(data.availabilityDate) : null,
        condition: data.condition,
        lowStockThreshold: data.lowStockThreshold ?? 5,
      };
      
      console.log('=== CUSTOM PRINTING PRODUCT CREATION ===');
      console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch('/api/products/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Custom Printing product created successfully',
      });

      form.reset();
      setVariantRows([]);
      setNewColorName("");
      setNewColorValue("#000000");
      setNewSize("");
      setIsOpen(false);
      
      // Force refresh with cache busting
      if (onProductAdded) {
        setTimeout(() => {
          onProductAdded();
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating custom printing product:', error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Printing Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Custom Printing Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter product SKU (e.g., AP-CP-001)" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Stock Keeping Unit - Used for inventory and Google search
                    </p>
                  </FormItem>
                )}
              />

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
                          <SelectItem value="custom printing">Custom Printing</SelectItem>
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormLabel>Original Price (R) - Optional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
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
                      onImagesChange={field.onChange}
                      maxFiles={10}
                      initialImages={field.value}
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
                                  placeholder={`Describe this image (e.g., "Custom drawstring bag front view")`}
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
                        placeholder="Keywords separated by commas (e.g., drawstring bag, custom printing)" 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Custom URL path for this product (e.g., custom-drawstring-bag)
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* PDP Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="details.material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 100% Polyester" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.fit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. One Size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.care"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Machine wash cold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Made in South Africa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability (Google Merchant)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availabilityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {requiresAvailabilityDate && (
              <FormField
                control={form.control}
                name="availabilityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="5"
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === '' ? null : Number(value));
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Used for alerts and feeds. Defaults to 5.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isNew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mark as New</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onSale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">On Sale</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-4">
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
            </div>

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

            {/* Variant matrix */}
            <VariantMatrix
              colors={watchedColors}
              sizes={watchedSizes}
              enableColors={hasColorOptions}
              enableSizes={hasSizeOptions}
              value={variantRows}
              onChange={handleVariantRowsChange}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Custom Printing Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
