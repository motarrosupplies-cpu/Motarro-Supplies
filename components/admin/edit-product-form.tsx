'use client';

import { useEffect, useState } from 'react';
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
import { Pencil, X } from 'lucide-react';
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
import { AiProductContentPanel } from './AiProductContentPanel';
import type { GeneratedProductContent } from '@/lib/xai/types';

const colorOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional().nullable(),
  price: z.number().min(0, 'Price is required'),
  originalPrice: z.number().optional().nullable(),
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
  colors: z.array(colorOptionSchema).optional().nullable(),
  sizes: z.array(z.string()).optional().nullable(),
  variants: z.array(z.any()).optional().nullable(),
  details: z.object({
    material: z.string().optional(),
    fit: z.string().optional(),
    care: z.string().optional(),
    origin: z.string().optional(),
  }).optional().nullable(),
  // SEO Fields
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

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    sku?: string;
    price: string;
    originalPrice?: string;
    category: string;
    images: string[];
    imageAltTexts?: string[];
    description: string;
    stock: string;
    isNew: boolean;
    onSale: boolean;
    status: string;
    hasColorOptions?: boolean;
    hasSizeOptions?: boolean;
    colors?: ColorOption[];
    sizes?: string[];
    details?: ProductDetails;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    seoSlug?: string;
    availability?: string | null;
    availabilityDate?: string | null;
    condition?: string | null;
    lowStockThreshold?: number | null;
  };
  onProductUpdated: () => void;
}

export function EditProductForm({ product, onProductUpdated }: EditProductFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");
  const [newSize, setNewSize] = useState("");
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const { toast } = useToast();
  const resolvedAvailability = resolveAvailability(product.availability, Number(product.stock ?? 0));
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [mainCategories, setMainCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ value: string; label: string }>>([]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      sku: product.sku || '',
      price: Number(product.price),
      originalPrice: product.originalPrice !== undefined ? Number(product.originalPrice) : undefined,
      category: product.category,
      subcategory: (product as any).subcategory || null,
      images: product.images,
      imageAltTexts: product.imageAltTexts || [],
      description: product.description,
      stock: Number(product.stock),
      isNew: product.isNew,
      onSale: product.onSale,
      status: product.status as 'active' | 'disabled',
      hasColorOptions: product.hasColorOptions || false,
      hasSizeOptions: product.hasSizeOptions || false,
      colors: product.colors || [],
      sizes: product.sizes || [],
      details: product.details || {},
      variants: [],
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      seoKeywords: product.seoKeywords || '',
      seoSlug: product.seoSlug || '',
      availability: resolvedAvailability,
      availabilityDate: toDateTimeLocalInput(product.availabilityDate || null),
      condition: product.condition ? product.condition.toLowerCase() as typeof PRODUCT_CONDITIONS[number] : 'new',
      lowStockThreshold: product.lowStockThreshold ?? 5,
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
        
        // Set subcategories based on current category
        const currentCategory = form.getValues('category');
        console.log('🔍 Current category from form:', currentCategory);
        console.log('🔍 Menu tree:', tree);
        if (currentCategory) {
          const subs = getSubCategories(tree, currentCategory);
          console.log('🔍 Subcategories found:', subs);
          setSubCategories(subs);
        } else {
          setSubCategories([]);
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
      console.log('🔄 Category changed to:', watchedCategory);
      const subs = getSubCategories(menuTree, watchedCategory);
      console.log('🔄 Subcategories for', watchedCategory, ':', subs);
      setSubCategories(subs);
      // Clear subcategory if it's not valid for the new category
      const currentSub = form.getValues('subcategory');
      if (currentSub && !subs.find(s => s.value === currentSub)) {
        form.setValue('subcategory', null);
      }
    } else {
      console.log('🔄 No category or menu tree, clearing subcategories');
      setSubCategories([]);
    }
  }, [watchedCategory, menuTree, form]);

  // Load existing variants when opening and sync toggle states
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        console.log('🔍 Loading variants for product:', product.id);
        const res = await fetch(`/api/products/optimized/${product.id}`);
        if (!res.ok) {
          console.error('❌ Failed to fetch product:', res.status);
          return;
        }
        const data = await res.json();
        console.log('📦 Product data received:', {
          hasColorOptions: data.hasColorOptions,
          hasSizeOptions: data.hasSizeOptions,
          hasVariants: !!(data.variants && data.variants.length > 0),
          variantsCount: data.variants?.length || 0,
          colorsCount: data.colors?.length || 0,
          sizesCount: data.sizes?.length || 0,
        });
        
        // CRITICAL: Sync toggle states based on actual product data
        // Use API response data, not initial product prop (which may be stale)
        const hasColorOptions = data.hasColorOptions === true && (data.colors?.length > 0 || data.variants?.some((v: any) => v.colorName));
        const hasSizeOptions = data.hasSizeOptions === true && (data.sizes?.length > 0 || data.variants?.some((v: any) => v.size));
        
        console.log('🔧 Syncing toggle states:', {
          hasColorOptions,
          hasSizeOptions,
          colorsFromData: data.colors,
          sizesFromData: data.sizes
        });
        
        // Update form toggles to match actual product data
        form.setValue('hasColorOptions', hasColorOptions);
        form.setValue('hasSizeOptions', hasSizeOptions);
        
        // Update colors and sizes from API data (not just variants)
        if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
          form.setValue('colors', data.colors);
        } else if (hasColorOptions) {
          // If colors enabled but no colors in data, keep existing or set empty
          const currentColors = form.getValues('colors') || [];
          if (currentColors.length === 0) {
            form.setValue('colors', []);
          }
        }
        
        if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
          form.setValue('sizes', data.sizes);
        } else if (hasSizeOptions) {
          // If sizes enabled but no sizes in data, keep existing or set empty
          const currentSizes = form.getValues('sizes') || [];
          if (currentSizes.length === 0) {
            form.setValue('sizes', []);
          }
        }
        
        // Load variant rows
        let rows: VariantRow[] = (data.variants || []).map((v: any) => ({
          id: v.id,
          colorName: v.colorName ?? null,
          colorValue: v.colorValue ?? null,
          size: v.size ?? null,
          priceOverride: v.priceOverride ?? null,
          stockAvailable: Number(v.stockAvailable || 0),
          stockIncoming: Number(v.stockIncoming || 0),
          stockReserved: Number(v.stockReserved || 0),
          isActive: v.isActive ?? true,
        }));
        
        // CRITICAL FIX: For simple products (no colors, no sizes), if no variants exist,
        // create a single variant row with the current stock value
        if (!hasColorOptions && !hasSizeOptions && rows.length === 0) {
          const currentStock = Number(data.stock || data.totalStock || 0);
          rows = [{
            colorName: null,
            colorValue: null,
            size: null,
            priceOverride: null,
            stockAvailable: currentStock,
            stockIncoming: 0,
            stockReserved: 0,
            isActive: true,
          }];
          console.log('🔧 Created variant row for simple product with stock:', currentStock);
        }
        
        console.log('🎯 Mapped variant rows:', rows);
        setVariantRows(rows);
        
        // CRITICAL FIX: Sync form stock field with variant rows
        // For simple products, ensure stock matches the variant row
        if (!hasColorOptions && !hasSizeOptions && rows.length > 0) {
          const simpleRow = rows[0];
          if (simpleRow && simpleRow.stockAvailable !== undefined) {
            form.setValue('stock', simpleRow.stockAvailable);
            console.log('🔧 Synced form stock to variant row stock:', simpleRow.stockAvailable);
          }
        } else if (rows.length > 0) {
          // For variant products, calculate total stock from all variants
          const totalStock = rows.reduce((sum, row) => sum + (Number(row.stockAvailable) || 0), 0);
          form.setValue('stock', totalStock);
          console.log('🔧 Calculated total stock from variants:', totalStock);
        }
        
        // For variant products, update sizes/colors from variants if not in main data
        if (rows.length > 0 && (!data.sizes || data.sizes.length === 0)) {
          const uniqueSizes = new Set<string>();
          rows.forEach(row => {
            if (row.size && row.size.trim() !== '') {
              uniqueSizes.add(row.size);
            }
          });
          
          if (uniqueSizes.size > 0) {
            const sizesArray = Array.from(uniqueSizes).sort();
            console.log('🔧 Extracted sizes from variants:', sizesArray);
            form.setValue('sizes', sizesArray);
          }
        }
        
        if (rows.length > 0 && (!data.colors || data.colors.length === 0)) {
          const uniqueColors = new Set<string>();
          rows.forEach(row => {
            if (row.colorName && row.colorValue) {
              uniqueColors.add(JSON.stringify({ name: row.colorName, value: row.colorValue }));
            }
          });
          
          if (uniqueColors.size > 0) {
            const colorsArray = Array.from(uniqueColors).map(colorStr => JSON.parse(colorStr));
            console.log('🔧 Extracted colors from variants:', colorsArray);
            form.setValue('colors', colorsArray);
          }
        }
      } catch (e) {
        console.error('❌ Error loading variants:', e);
      }
    })();
  }, [open, product.id, form]);

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

  const handleVariantRowsChange = (rows: VariantRow[]) => {
    setVariantRows(rows);

    const aggregatedStock = rows.reduce(
      (sum, row) => sum + (Number(row.stockAvailable) || 0),
      0
    );

    form.setValue("stock", aggregatedStock);
  };

  useEffect(() => {
    const numericStock = Number(watchedStock ?? 0);
    if (numericStock > 0 && safeAvailability === 'out_of_stock') {
      form.setValue('availability', 'in_stock', { shouldDirty: true });
      toast({
        title: 'Availability updated',
        description: 'Stock is above zero so availability was set to In stock.',
      });
    } else if (numericStock <= 0 && safeAvailability === 'in_stock') {
      form.setValue('availability', 'out_of_stock', { shouldDirty: true });
      toast({
        title: 'Availability updated',
        description: 'Stock is zero so availability was set to Out of stock.',
      });
    }
  }, [safeAvailability, watchedStock, form, toast]);

  useEffect(() => {
    if (!requiresAvailabilityDate && form.getValues('availabilityDate')) {
      form.setValue('availabilityDate', '', { shouldDirty: true });
    }
  }, [requiresAvailabilityDate, form]);

  useEffect(() => {
    if (!open) return;

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
      console.log('🔄 Variant structure changed, updating variantRows');
      console.log('Current structure:', currentStructure);
      console.log('New structure:', newStructure);
      setVariantRows(newRows);
    }
  }, [open, hasColorOptions, hasSizeOptions, colorSignature, sizeSignature]);

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
      // For simple products, use the current stock from form or from existing variantRows
      const existingSimpleRow = variantRows.find(r => !r.colorValue && !r.size);
      const currentStock = existingSimpleRow 
        ? existingSimpleRow.stockAvailable 
        : Number(form.getValues("stock")) || 0;
      rows.push({
        colorName: null,
        colorValue: null,
        size: null,
        stockAvailable: currentStock,
        stockIncoming: existingSimpleRow?.stockIncoming || 0,
        stockReserved: existingSimpleRow?.stockReserved || 0,
        priceOverride: existingSimpleRow?.priceOverride || null,
        isActive: existingSimpleRow?.isActive ?? true,
      });
    }

    return rows;
  }

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

  async function onSubmit(data: ProductFormValues) {
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
        subcategory: data.subcategory || null,
        images: normalizedImages,
        imageAltTexts: normalizedAltTexts,
        stock: hasColors || hasSizes ? totalStock : data.stock,
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
      
      console.log('=== FORM SUBMISSION ===');
      console.log('Form data:', requestData);
      console.log('Has color options:', data.hasColorOptions);
      console.log('Has size options:', data.hasSizeOptions);
      console.log('Has colors (validated):', hasColors);
      console.log('Has sizes (validated):', hasSizes);
      console.log('Colors:', data.colors);
      console.log('Sizes:', data.sizes);
      console.log('Variants count:', canonicalVariants.length);
      console.log('Product type:', !hasColors && !hasSizes ? 'simple' : (hasColors && hasSizes ? 'full_variant' : (hasColors ? 'color_only' : 'size_only')));
      
      const response = await fetch(`/api/products/optimized/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Product update failed:', responseData);
        
        // Handle validation errors with more detail
        if (responseData.details && Array.isArray(responseData.details)) {
          const errorMessages = responseData.details.map((detail: any) => 
            `${detail.field}: ${detail.message}`
          ).join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        }
        
        throw new Error(responseData.error || responseData.message || 'Failed to update product');
      }

      console.log('Product updated successfully:', responseData);
      toast({ title: 'Success', description: 'Product updated successfully' });
      await Promise.resolve(onProductUpdated?.());
      // small timeout to allow toast to render before unmounting modal
      setTimeout(() => setOpen(false), 50);
    } catch (error) {
      console.error('Product update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] h-[90vh] p-0 overflow-hidden">
        <div className="h-full overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--primary) / 0.4) hsl(var(--muted))'
        }}>
          <div className="p-6">
            <DialogHeader className="sticky top-0 z-10 bg-background pb-4">
              <DialogTitle>Edit Product</DialogTitle>
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

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product SKU (e.g., AP-TSH-001)" 
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter price"
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
                          placeholder="Enter original price"
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                              <SelectItem value="Custom Printing">Custom Printing</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {subCategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Category (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === '__none__' ? null : value)} 
                          value={field.value || '__none__'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sub-category (optional)" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                <AiProductContentPanel
                  context={{
                    name: form.watch('name'),
                    category: form.watch('category'),
                    subcategory: form.watch('subcategory'),
                    price: form.watch('price'),
                    sku: form.watch('sku'),
                    colors: (form.watch('colors') || []).map((color) => color.name),
                    sizes: form.watch('sizes') || [],
                    existingDescription: form.watch('description'),
                  }}
                  onApply={(content: GeneratedProductContent) => {
                    form.setValue('description', content.description);
                    form.setValue('seoTitle', content.seoTitle || null);
                    form.setValue('seoDescription', content.seoDescription || null);
                    form.setValue('seoKeywords', content.seoKeywords || null);
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
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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

                {/* PDP Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="details.material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 100% Cotton" {...field} />
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
                          <Input placeholder="e.g. Regular" {...field} />
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

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">New Arrival</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onSale"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">On Sale</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

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

                {/* Variant matrix */}
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
                    {isSubmitting ? 'Updating...' : 'Update Product'}
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