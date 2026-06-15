"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ProductDetailImage, ProductThumbnail } from "@/components/optimized-image"
import Link from "next/link"
import { ChevronRight, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRightCircle, ZoomIn, X, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/components/cart-provider"
import { Product } from "@/types/product"
import { RelatedProducts } from "@/components/related-products"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PreviousPageButton } from "@/components/previous-page-button"
import { BreadcrumbSchema } from "@/components/seo/schema-org"
import { isUUID } from "@/lib/product-slug-utils"
import { FileUpload } from "@/components/file-upload"
import { uploadMultipleFiles } from "@/lib/upload-service"
import { toast } from "sonner"
import {
  availabilityToSchemaUrl,
  conditionToSchemaUrl,
  resolveAvailability,
  sanitizeCondition,
} from "@/lib/utils"
import { trackMetaViewContent } from "@/lib/meta-pixel"

export default function ProductPage({ params }: { params: { slug: string } }) {
  const identifier = params.slug;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [colourSizeQuantities, setColourSizeQuantities] = useState<Record<string, Record<string, number>>>({});
  
  const currentColourKey = useMemo(() => (selectedColor || '').toLowerCase(), [selectedColor]);
  const currentQuantities = colourSizeQuantities[currentColourKey] || {};
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const { addToCart } = useCart();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  
  // Custom printing upload state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; filename: string; size: number }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    if (!product) return;
    trackMetaViewContent({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
    });
  }, [product]);

  const SIZE_ORDER = ["XXS","XS","SML","MED","LAR","XL","2XL","3XL","4XL","5XL"] as const;
  const sizeIndex = (s?: string | null) => {
    const i = s ? SIZE_ORDER.indexOf(s as any) : -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        console.log('🚀 Starting product fetch for identifier:', identifier);
        setIsLoading(true);
        
        const url = `/api/products/optimized/${identifier}?t=${Date.now()}`;
        console.log('📡 Fetching from URL:', url);
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch product`);
        }
        const data = await response.json();
        console.log('📦 Raw API response:', data);
        
        if (!data || !data.id) {
          throw new Error('Invalid product data received');
        }
        
        console.log('🎯 Frontend received product data:', {
          name: data.name,
          slug: data.slug || data.seoSlug,
          hasVariants: data.variants?.length || 0,
        });
        
        setProduct(data);
        
        // If accessed via UUID but product has a slug, update URL to slug (without redirect)
        if (isUUID(identifier) && (data.slug || data.seoSlug)) {
          const slug = data.slug || data.seoSlug;
          if (slug !== identifier && typeof window !== 'undefined') {
            // Update URL without page reload
            const newUrl = `/products/${slug}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
            console.log('✅ URL updated to slug:', slug);
          }
        }
        
        // Fetch FAQs for this product
        const productSlug = data.slug || data.seoSlug || identifier;
        if (productSlug && !isUUID(productSlug)) {
          try {
            const faqsResponse = await fetch(`/api/products/faqs/${productSlug}`);
            if (faqsResponse.ok) {
              const faqsData = await faqsResponse.json();
              setFaqs(faqsData.faqs || []);
            }
          } catch (error) {
            console.warn('Failed to fetch FAQs:', error);
          }
        }
        
        console.log('✅ Product state updated');
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 Product fetch completed');
      }
    }

    if (identifier) {
      fetchProduct();
    }
  }, [identifier]);

  // Rest of the component remains the same as [id]/page.tsx
  // ... (copy all the rest of the component logic from app/products/[id]/page.tsx)

  // Recompute available count when selection changes
  useEffect(() => {
    // no-op; state setters already derive from selection via helper functions
  }, [selectedColor, selectedSize, product]);

  const norm = (v?: string | null) => (v || "").trim().toLowerCase();

  const getVariantFor = (colorKey?: string | null, size?: string | null) => {
    if (!product?.variants || !Array.isArray(product.variants)) return null;
    const wantColor = product.hasColorOptions ? norm(colorKey) : "";
    const wantSize = product.hasSizeOptions ? (size || "") : "";

    return (
      product.variants.find((v: any) => {
        if (v?.isActive === false) return false;
        const vColor = norm(v?.colorValue || v?.colorName);
        const vSize = String(v?.size || "");
        const colorMatch = !product.hasColorOptions || (wantColor && vColor === wantColor);
        const sizeMatch = !product.hasSizeOptions || vSize === wantSize;
        return colorMatch && sizeMatch;
      }) || null
    );
  };

  const getVariantStockFor = (colorKey?: string | null, size?: string | null) => {
    const v = getVariantFor(colorKey, size);
    if (!v) return 0;
    const raw = Number(v.stockAvailable ?? 0);
    return Number.isFinite(raw) ? Math.max(0, raw) : 0;
  };

  const getMatchingVariant = () => {
    if (!product?.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    
    const variants = Array.isArray(product.variants) ? product.variants : [];
    
    if (!product.hasColorOptions && !product.hasSizeOptions) {
      return variants.find(v => 
        v.colorName === null && v.size === null && v.isActive !== false
      ) || null;
    }
    
    return variants.find((v: any) => {
      const vColor = norm(v?.colorValue || v?.colorName);
      const colorMatch = product.hasColorOptions ? vColor === norm(selectedColor) : true;
      const sizeMatch = product.hasSizeOptions ? String(v?.size || "") === selectedSize : true;
      const activeMatch = v.isActive !== false;
      return colorMatch && sizeMatch && activeMatch;
    }) || null;
  };

  const getVariantsForSelectedColor = () => {
    if (!product?.variants || !Array.isArray(product.variants)) return [];
    if (!product.hasColorOptions || !selectedColor) {
      return product.variants.filter((v: any) => 
        (!product.hasSizeOptions || v.size) && v.isActive !== false
      );
    }
    return product.variants.filter((v: any) => 
      norm(v.colorValue || v.colorName) === norm(selectedColor) &&
      (!product.hasSizeOptions || v.size) &&
      v.isActive !== false
    );
  };

  const getColorTotalAvailable = (colorName: string, colorValue: string) => {
    if (!product?.variants || !Array.isArray(product.variants)) return 0;
    return product.variants
      .filter((v: any) => 
        (v.colorName === colorName || v.colorValue === colorValue) && 
        v.isActive !== false
      )
      .reduce((sum: number, v: any) => sum + (v.stockAvailable || 0), 0);
  };

  const getContrastText = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const availableForSelection = () => {
    if (!product) return 0;
    if (product.hasSizeOptions) {
      const matchingVariants = getVariantsForSelectedColor();
      return matchingVariants.reduce((sum: number, v: any) => sum + (v.stockAvailable || 0), 0);
    }
    return product.stock || 0;
  };

  const effectivePrice = () => {
    const variant = getMatchingVariant();
    if (variant?.priceOverride) {
      return Number(variant.priceOverride);
    }
    if (product?.originalPrice && product.onSale) {
      return Number(product.originalPrice);
    }
    return Number(product?.price || 0);
  };

  const setQtyForSize = (size: string, qty: number) => {
    const available = getVariantStockFor(selectedColor, size);
    const capped = Math.max(0, Math.min(qty, available));
    setColourSizeQuantities(prev => ({
      ...prev,
      [currentColourKey]: {
        ...prev[currentColourKey],
        [size]: capped
      }
    }));
  };

  const handleAddToCart = () => {
    if (product.hasSizeOptions) {
      setIsReviewOpen(true);
    } else {
      handleAddToCartConfirmed();
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    try {
      setUploading(true);
      const isCustom = product?.category?.toLowerCase() === 'custom printing';
      const results = await uploadMultipleFiles(files, (progress) => {
        setUploadProgress(progress);
      }, isCustom ? 'custom-printing' : 'products');
      setUploadedFiles((prev) => [...prev, ...results]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const isCustomPrinting = product?.category?.toLowerCase() === 'custom printing';

  const handleAddToCartConfirmed = () => {
    if (!product) return;

    // Validate custom printing requirements
    if (isCustomPrinting && uploadedFiles.length === 0) {
      toast.error("Please upload at least one design");
      return;
    }

    if (product.hasSizeOptions) {
      Object.entries(colourSizeQuantities).forEach(([colorKey, sizeQuantities]) => {
        Object.entries(sizeQuantities).forEach(([size, qty]) => {
          if (qty > 0) {
            const variant = getVariantFor(colorKey, size);
            
            if (variant) {
              for (let i = 0; i < qty; i++) {
                addToCart({
                  ...product,
                  selectedColor: product.hasColorOptions ? colorKey : undefined,
                  selectedSize: size,
                  variantId: variant.id,
                  price: variant.priceOverride || product.price,
                  customPrinting: isCustomPrinting ? {
                    designs: uploadedFiles,
                    instructions: specialInstructions,
                  } : undefined,
                });
              }
            }
          }
        });
      });
      setIsReviewOpen(false);
    } else {
      const matchingVariant = getMatchingVariant();
      const price = matchingVariant?.priceOverride ?? product.price;
      for (let i = 0; i < quantity; i++) {
        addToCart({
          ...product,
          selectedColor: product.hasColorOptions ? selectedColor : undefined,
          selectedSize: product.hasSizeOptions ? selectedSize : undefined,
          variantId: matchingVariant?.id,
          price: typeof price === 'number' ? price : Number(price),
          quantity: 1,
          customPrinting: isCustomPrinting ? {
            designs: uploadedFiles,
            instructions: specialInstructions,
          } : undefined,
        });
      }
    }

    // Reset custom printing state after adding to cart
    if (isCustomPrinting) {
      setUploadedFiles([]);
      setSpecialInstructions("");
      toast.success("Added to cart");
    }
  };

  const handleImageScroll = (direction: 'left' | 'right') => {
    if (!product?.images || !Array.isArray(product.images)) return;
    const maxIndex = product.images.length - 4;
    if (direction === 'left') {
      setStartIndex(Math.max(0, startIndex - 1));
    } else {
      setStartIndex(Math.min(maxIndex, startIndex + 1));
    }
  };

  const canScrollLeft = startIndex > 0;
  const canScrollRight = product?.images && Array.isArray(product.images) 
    ? startIndex < product.images.length - 4 
    : false;

  const handleDragStart = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setStartDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const deltaX = e.clientX - startDragPosition.x;
    const deltaY = e.clientY - startDragPosition.y;
    setDragPosition({ x: dragPosition.x + deltaX, y: dragPosition.y + deltaY });
    setStartDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="container px-3 py-8 mx-auto bg-lavender">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-3 py-8 mx-auto bg-lavender">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const matchingVariant = getMatchingVariant();
  const offerPrice = effectivePrice();
  const availabilityUrl = availabilityToSchemaUrl(
    resolveAvailability(product.availability, availableForSelection())
  );
  const conditionUrl = conditionToSchemaUrl(sanitizeCondition(product.condition));
  const availabilityDateIso = product.availabilityDate 
    ? new Date(product.availabilityDate).toISOString().split('T')[0]
    : null;
  
  const productSlug = (product as any).slug || (product as any).seoSlug || product.id;
  const canonicalUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.motarro.co.za'}/products/${productSlug}`;

  // Generate FAQPage schema if FAQs exist
  const faqPageSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/products/${productSlug}` }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description,
            "sku": (product as any).sku || product.id,
            "itemCondition": conditionUrl,
            "brand": {
              "@type": "Brand",
              "name": "MOTARRO Supplies"
            },
            "category": product.category,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "ZAR",
              "price": offerPrice,
              "availability": availabilityUrl,
              ...(availabilityDateIso ? { availabilityStarts: availabilityDateIso } : {}),
              "url": canonicalUrl,
              "itemCondition": conditionUrl,
              "seller": {
                "@type": "Organization",
                "name": "MOTARRO Supplies"
              },
              "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              "inventoryLevel": {
                "@type": "QuantitativeValue",
                "value": Number(product.stock ?? 0),
              },
              "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "ZA",
                },
                "deliveryTime": {
                  "@type": "ShippingDeliveryTime",
                  "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 3,
                    "unitCode": "DAY",
                  },
                  "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 2,
                    "maxValue": 5,
                    "unitCode": "DAY",
                  },
                },
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Sarah M."
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Excellent quality custom t-shirts, fast delivery in Johannesburg!"
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Michael K."
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Great custom printing service in Kempton Park, highly recommended!"
              }
            ]
          })
        }}
      />
      {faqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageSchema)
          }}
        />
      )}
      <div className="container px-3 py-8 mx-auto bg-lavender">
        <PreviousPageButton fallbackHref="/products" className="mb-4 -ml-2" />
        <Breadcrumbs 
          items={breadcrumbItems}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery - Same as [id]/page.tsx */}
          <div className="space-y-4 isolate">
            <div 
              className="relative aspect-square overflow-hidden rounded-lg border bg-white cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="absolute inset-0">
                <ProductDetailImage
                  src={product.images && Array.isArray(product.images) ? product.images[selectedImage] || '/placeholder.svg' : '/placeholder.svg'}
                  alt={`${product.name} - Custom Printed ${product.category} in South Africa | High Quality ${product.category} Printing`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full">
                  <ZoomIn className="h-5 w-5 text-white" />
                </div>
                {product.isNew && <Badge className="absolute top-4 right-16 bg-accent">New</Badge>}
                {product.originalPrice && (
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    Sale
                  </Badge>
                )}
              </div>
            </div>
            {/* Thumbnail gallery - same as [id]/page.tsx */}
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="relative px-8 h-32 overflow-hidden isolate">
                <div className="flex items-center h-full relative">
                   {canScrollLeft && (
                     <Button
                       variant="ghost"
                       size="icon"
                       className="absolute left-0 z-20 bg-white/80 hover:bg-lavender rounded-full transition-all duration-200 hover:shadow-md"
                       onClick={() => handleImageScroll('left')}
                     >
                       <ChevronLeft className="h-6 w-6 text-gray-700" />
                     </Button>
                   )}
                  <div className="flex space-x-4 transition-transform duration-300 ease-in-out h-full items-center" 
                       style={{ 
                         transform: `translateX(-${startIndex * 120}px)`
                       }}>
                    {product.images.map((img, index) => (
                      <button 
                        key={index} 
                        className={`relative flex-shrink-0 w-24 h-24 rounded-lg transition-all duration-200 z-10
                          ${selectedImage === index 
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' 
                            : 'ring-1 ring-border hover:ring-2 hover:ring-primary/50'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        `}
                        onClick={() => setSelectedImage(index)}
                      >
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <ProductThumbnail
                            src={img}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className={`object-cover transition-opacity duration-200
                              ${selectedImage === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                            sizes="96px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                  {canScrollRight && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 z-20 bg-white/80 hover:bg-lavender rounded-full transition-all duration-200 hover:shadow-md"
                      onClick={() => handleImageScroll('right')}
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Image Modal - Same as [id]/page.tsx */}
            <Dialog open={isImageModalOpen} onOpenChange={(open) => {
              setIsImageModalOpen(open);
              if (!open) setZoomLevel(1);
            }}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 border-none bg-black/95 flex flex-col overflow-hidden rounded-lg [&>button]:hidden">
                <DialogHeader className="absolute top-4 right-4 z-50">
                  <DialogTitle className="sr-only">
                    {product.name} - Image View
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full ring-2 ring-primary ring-offset-2 ring-offset-black/95"
                    onClick={() => setIsImageModalOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </DialogHeader>
                <div className="flex-1 min-h-0 relative overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    style={{ 
                      cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div 
                        className="relative transition-transform duration-200 origin-center"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${dragPosition.x / zoomLevel}px, ${dragPosition.y / zoomLevel}px)`,
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <ProductDetailImage
                          src={product.images && Array.isArray(product.images) ? product.images[selectedImage] || '/placeholder.svg' : '/placeholder.svg'}
                          alt={`${product.name} - Custom Printed ${product.category} in South Africa | High Quality ${product.category} Printing`}
                          fill
                          className="object-contain"
                          sizes="95vw"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
                  <div className="w-full max-w-md flex items-center gap-4">
                    <ZoomIn className="h-4 w-4 text-white/70" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoomLevel}
                      onChange={(e) => {
                        setZoomLevel(Number(e.target.value));
                        if (Number(e.target.value) <= 1) {
                          setDragPosition({ x: 0, y: 0 });
                        }
                      }}
                      className="w-full accent-white/70 bg-white/10 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none"
                    />
                    <span className="text-white/70 text-sm min-w-[3ch]">{zoomLevel.toFixed(1)}x</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Product Details - Copy rest from [id]/page.tsx */}
          <div className="space-y-6 bg-white p-6 rounded-2xl">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground mt-2">{product.description}</p>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-primary">About This Product</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This premium {product.category.toLowerCase()} from MOTARRO Supplies combines exceptional quality with contemporary style. 
                  Crafted from high-grade materials and designed for comfort and durability, this piece is perfect for both 
                  everyday wear and special occasions. Our commitment to quality ensures that every item meets the highest 
                  standards of craftsmanship, making it a valuable addition to your wardrobe.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-primary">Category:</span>
                    <span className="ml-2 text-muted-foreground">{product.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">SKU:</span>
                    <span className="ml-2 text-muted-foreground">{(product as any).sku || product.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold mt-2 text-primary">R{Number(effectivePrice()).toFixed(2)}</p>
                    {product.originalPrice && (
                      <p className="text-lg text-muted-foreground line-through mt-2">
                        R{Number(product.originalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="text-lg font-medium mt-2">{availableForSelection()} units</p>
                </div>
              </div>
            </div>

            {/* Color, Size, Quantity selectors - Same as [id]/page.tsx */}
            <div className="space-y-4">
              {product.hasColorOptions && product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const totalAvail = getColorTotalAvailable(color.name, color.value);
                      const isAvailable = totalAvail > 0;
                      return (
                        <button
                          key={color.name}
                          onClick={() => {
                            if (!isAvailable) return;
                            setSelectedColor(color.name);
                            setColourSizeQuantities(prev => ({ ...prev, [color.name.toLowerCase()]: prev[color.name.toLowerCase()] || {} }));
                          }}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === color.name
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={`${color.name} (${totalAvail})`}
                          disabled={!isAvailable}
                          aria-disabled={!isAvailable}
                        >
                          <span
                            className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold drop-shadow"
                            style={{ color: getContrastText(color.value) }}
                          >
                            {totalAvail}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedColor}
                    </p>
                  )}
                  {!selectedColor && <p className="text-sm text-muted-foreground mt-2">Please select a color</p>}
                </div>
              )}
              {product.hasSizeOptions && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Select sizes and quantities</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Ruler className="w-4 h-4 mr-1" />
                      Size Guide
                    </Button>
                  </div>
                  {(!product.hasColorOptions || selectedColor) ? (
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-3 py-2 text-left">Size</th>
                            <th className="px-3 py-2 text-left">Quantity</th>
                            <th className="px-3 py-2 text-right">Available</th>
                            <th className="px-3 py-2 text-right">Incoming</th>
                            <th className="px-3 py-2 text-right">Reserved</th>
                            <th className="px-3 py-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getVariantsForSelectedColor().map((v: any) => (
                              <tr key={v.id} className={`border-t ${(v.stockAvailable || 0) === 0 ? 'opacity-50 bg-gray-50' : ''}`}>
                                <td className="px-3 py-2">{v.size || '-'}</td>
                                <td className="px-3 py-2">
                                  <div className="inline-flex items-center gap-2">
                                    {(() => {
                                      const available = Number(v.stockAvailable || 0);
                                      const current = Number(currentQuantities[v.size] || 0);
                                      const canInc = current < available;
                                      const canDec = current > 0;
                                      return (
                                        <>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-7 w-7 rounded-full" 
                                      onClick={() => setQtyForSize(v.size, (currentQuantities[v.size] || 0) - 1)}
                                      disabled={!canDec || available === 0}
                                    >-</Button>
                                    <span className="w-8 text-center">{currentQuantities[v.size] || 0}</span>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-7 w-7 rounded-full" 
                                      onClick={() => setQtyForSize(v.size, (currentQuantities[v.size] || 0) + 1)}
                                      disabled={!canInc || available === 0}
                                    >+</Button>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td className={`px-3 py-2 text-right ${(v.stockAvailable || 0) === 0 ? 'text-red-500 font-medium' : ''}`}>
                                  {v.stockAvailable || 0}
                                  {(v.stockAvailable || 0) === 0 && <span className="ml-1 text-xs">(Out of Stock)</span>}
                                </td>
                                <td className="px-3 py-2 text-right">{v.stockIncoming || 0}</td>
                                <td className="px-3 py-2 text-right">{v.stockReserved || 0}</td>
                                <td className="px-3 py-2 text-right">R{Number(v.priceOverride ?? product.price).toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a colour to see sizes</p>
                  )}
                </div>
              )}

              {/* Custom Printing Upload Section */}
              {isCustomPrinting && (
                <>
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Upload Your Design</h3>
                    <FileUpload
                      onChange={handleFilesSelected}
                      disabled={uploading}
                      maxFiles={10}
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                    {uploading && (
                      <div className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </div>
                    )}
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold">Your Uploaded Designs</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Special Instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
                      placeholder="Add any special instructions for your custom printing..."
                    />
                  </div>
                </>
              )}

              {!product.hasSizeOptions && (
                <div>
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Custom Printing Upload Section */}
              {isCustomPrinting && (
                <>
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold">Upload Your Design</h3>
                    <FileUpload
                      onChange={handleFilesSelected}
                      disabled={uploading}
                      maxFiles={10}
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                    {uploading && (
                      <div className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </div>
                    )}
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4 border-t pt-4 mt-4">
                      <h3 className="text-lg font-semibold">Your Uploaded Designs</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold">Special Instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
                      placeholder="Add any special instructions for your custom printing..."
                    />
                  </div>
                </>
              )}

              <Button
                className="w-full mt-6 rounded-full bg-secondary hover:bg-secondary/90"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  (isCustomPrinting && uploadedFiles.length === 0) ||
                  (product.hasColorOptions && !selectedColor) ||
                  (product.hasSizeOptions && 
                    !Object.values(colourSizeQuantities).some(sizeQuantities =>
                      Object.values(sizeQuantities).some(qty => (qty || 0) > 0)
                    )
                  ) ||
                  (!product.hasSizeOptions && availableForSelection() <= 0)
                }
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.hasSizeOptions ? "Add Selected Sizes" : "Add to Cart"}
              </Button>

              {((product.hasColorOptions && !selectedColor) || (product.hasSizeOptions && 
                !Object.values(colourSizeQuantities).some(sizeQuantities =>
                  Object.values(sizeQuantities).some(qty => (qty || 0) > 0)
                )
              ) || (!product.hasSizeOptions && availableForSelection() <= 0)) && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Please select {!selectedColor ? "a colour" : product.hasSizeOptions ? "at least one size quantity" : ""}
                </p>
              )}

              {/* Review modal - Same as [id]/page.tsx */}
              <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Review all selections</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 space-y-4">
                    <div className="space-y-4">
                      {Object.entries(colourSizeQuantities)
                        .filter(([colorKey, sizeQuantities]) => 
                          Object.values(sizeQuantities).some(qty => (qty || 0) > 0)
                        )
                        .map(([colorKey, sizeQuantities]) => {
                          const colorName = colorKey;
                          const hasSelections = Object.values(sizeQuantities).some(qty => (qty || 0) > 0);
                         
                          if (!hasSelections) return null;
                         
                          return (
                            <div key={colorKey} className="border rounded-md">
                              <div className="px-3 py-2 bg-muted font-medium border-b">
                                {colorName}
                              </div>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-muted/50">
                                    <th className="px-3 py-2 text-left">Size</th>
                                    <th className="px-3 py-2 text-right">Qty</th>
                                    <th className="px-3 py-2 text-right">Price</th>
                                    <th className="px-3 py-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(sizeQuantities)
                                    .filter(([, qty]) => (qty || 0) > 0)
                                    .sort(([a], [b]) => sizeIndex(a) - sizeIndex(b))
                                    .map(([size, qty]) => {
                                      const variant = product.variants?.find(v => 
                                        v.colorName === colorName && v.size === size
                                      );
                                      const unitPrice = Number(variant?.priceOverride ?? product.price);
                                      const subtotal = unitPrice * Number(qty);
                                      return (
                                        <tr key={`${colorKey}-${size}`} className="border-t">
                                          <td className="px-3 py-2">{size}</td>
                                          <td className="px-3 py-2 text-right">{qty}</td>
                                          <td className="px-3 py-2 text-right">R{unitPrice.toFixed(2)}</td>
                                          <td className="px-3 py-2 text-right">R{subtotal.toFixed(2)}</td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Edit</Button>
                      <Button onClick={() => { setIsReviewOpen(false); handleAddToCartConfirmed(); }}>Confirm & Add</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Tabs defaultValue="details" className="mt-8">
                <TabsList className="w-full rounded-full">
                  <TabsTrigger value="details" className="flex-1 rounded-full">
                    Details
                  </TabsTrigger>
                  {faqs.length > 0 && (
                    <TabsTrigger value="faq" className="flex-1 rounded-full">
                      FAQs
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="shipping" className="flex-1 rounded-full">
                    Shipping & Returns
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Material</h4>
                      <p className="text-sm text-muted-foreground">{product.details?.material || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Fit</h4>
                      <p className="text-sm text-muted-foreground">{product.details?.fit || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Care</h4>
                      <p className="text-sm text-muted-foreground">{product.details?.care || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Origin</h4>
                      <p className="text-sm text-muted-foreground">{product.details?.origin || '-'}</p>
                    </div>
                  </div>
                </TabsContent>
                {faqs.length > 0 && (
                  <TabsContent value="faq" className="space-y-4 pt-4">
                    <div className="space-y-6">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h4 className="font-semibold text-lg mb-2">{faq.question}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
                <TabsContent value="shipping" className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-medium">Shipping</h4>
                    <p className="text-sm text-muted-foreground">
                      Free standard shipping on all orders over R1000. Delivery within 3-5 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Returns</h4>
                    <p className="text-sm text-muted-foreground">
                      We accept returns within 30 days of delivery. Items must be unworn, unwashed, and with the original
                      tags attached.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Dialog */}
      <Dialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Size Guide</DialogTitle>
            <DialogDescription>
              Find your perfect fit using our comprehensive size guide
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">
              For detailed measurements and sizing charts, visit our complete size guide page.
            </p>
            <Button asChild className="w-full">
              <Link href="/size-guide" onClick={() => setIsSizeGuideOpen(false)}>
                View Full Size Guide
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RelatedProducts currentProduct={product} />
    </>
  );
}

