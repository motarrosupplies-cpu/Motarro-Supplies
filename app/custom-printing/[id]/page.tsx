"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { uploadMultipleFiles } from "@/lib/upload-service"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { ProductDetailImage, ProductThumbnail } from "@/components/optimized-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { Product, ColorOption } from "@/types/product"
import type { MockupDesign } from "@/components/custom-printing/types"
import { MockupEditorDialog } from "@/components/custom-printing/MockupEditorDialog"
import { inferMockupGarmentId } from "@/components/custom-printing/mockupGarmentUtils"

interface CustomPrintingProduct extends Product {
  sizes?: string[]
  colors?: ColorOption[]
  minOrder: number
  hasSizeOptions: boolean
  hasColorOptions: boolean
}

interface UploadedFile {
  url: string
  filename: string
  size: number
}

interface ProductDetailProps {
  params: { id: string }
}

export default function CustomPrintingProductPage({ params }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [mockupDesign, setMockupDesign] = useState<MockupDesign | null>(null)
  const [mockupPreview, setMockupPreview] = useState<UploadedFile | null>(null)
  const [isEditingMockup, setIsEditingMockup] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Array<{ id: string; name: string }>>([])

  const norm = (v?: string | null) => (v || "").trim().toLowerCase()

  useEffect(() => {
    async function fetchProduct() {
      // Use optimized endpoint; cache-bust so reordered images and backend changes show
      const res = await fetch(`/api/products/optimized/${params.id}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })
      if (!res.ok) {
        setProduct(null)
        setIsLoading(false)
        return
      }
      const data = await res.json()
      setProduct(data)
      setIsLoading(false)
    }
    fetchProduct()
  }, [params.id])

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products/optimized?filter=custom-printing&limit=12`)
        if (!res.ok) return
        const data = await res.json()
        const list = (Array.isArray(data) ? data : data.products || []).filter(
          (p: { id?: string }) => p.id && p.id !== params.id
        )
        setRelatedProducts(list.slice(0, 6).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
      } catch {
        // ignore
      }
    }
    fetchRelated()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <h1 className="text-2xl font-bold text-primary mb-4">Custom Printing Product</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container px-4 py-12 mx-auto">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    )
  }

  const getVariantFor = (colorKey?: string | null, size?: string | null) => {
    if (!product?.variants || !Array.isArray(product.variants)) return null
    const wantColor = product.hasColorOptions ? norm(colorKey) : ""
    const wantSize = product.hasSizeOptions ? String(size || "") : ""

    return (
      product.variants.find((v: any) => {
        if (v?.isActive === false) return false
        const vColor = norm(v?.colorValue || v?.colorName)
        const vSize = String(v?.size || "")
        const colorMatch = !product.hasColorOptions || (wantColor && vColor === wantColor)
        const sizeMatch = !product.hasSizeOptions || vSize === wantSize
        return colorMatch && sizeMatch
      }) || null
    )
  }

  const getVariantStockFor = (colorKey?: string | null, size?: string | null) => {
    const v = getVariantFor(colorKey, size)
    if (!v) return 0
    const raw = Number(v.stockAvailable ?? 0)
    return Number.isFinite(raw) ? Math.max(0, raw) : 0
  }

  const getSelectedVariantStock = () => {
    if (!product.hasSizeOptions && !product.hasColorOptions) return Number(product.stock ?? 0) || 0
    if (product.hasSizeOptions && !selectedSize) return 0
    if (product.hasColorOptions && !selectedColor) return 0
    return getVariantStockFor(selectedColor, selectedSize)
  }

  const capQuantityToStock = (nextQty: number) => {
    const min = product.minOrder ?? 1
    const desired = Math.max(min, nextQty)
    const available = getSelectedVariantStock()
    // If we don't have a fully-selected variant yet, only enforce min order.
    if (product.hasSizeOptions && !selectedSize) return desired
    if (product.hasColorOptions && !selectedColor) return desired
    if (!Number.isFinite(available) || available <= 0) return min
    return Math.min(desired, available)
  }

  const handleFilesSelected = async (files: File[]) => {
    try {
      setUploading(true)
      const results = await uploadMultipleFiles(files, (progress) => {
        setUploadProgress(progress)
      }, 'custom-printing')
      setUploadedFiles((prev) => [...prev, ...results])
      toast.success("Files uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload files")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleAddToCart = () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one design")
      return
    }

    if (quantity < (product.minOrder ?? 1)) {
      toast.error(`Minimum order quantity is ${(product.minOrder ?? 1)}`)
      return
    }

    if (product.hasSizeOptions && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    if (product.hasColorOptions && !selectedColor) {
      toast.error("Please select a color")
      return
    }

    // Validate stock for selected variant before adding.
    const available = getSelectedVariantStock()
    if (Number(quantity) > Number(available)) {
      toast.error(`Insufficient stock for this selection. Available: ${available}`)
      return
    }

    // Add to cart with custom printing details
    addToCart({
      ...product,
      quantity,
      selectedSize,
      selectedColor,
      variantId: getVariantFor(selectedColor, selectedSize)?.id,
      customPrinting: {
        designs: uploadedFiles,
        instructions: specialInstructions,
        mockup: mockupDesign ?? undefined,
        mockupPreview: mockupPreview ?? undefined,
      },
    })

    toast.success("Added to cart")
    setUploadedFiles([])
    setMockupDesign(null)
    setMockupPreview(null)
    setIsEditingMockup(false)
    setQuantity((product.minOrder ?? 1))
    setSelectedSize("")
    setSelectedColor("")
    setSpecialInstructions("")
  }

  return (
    <div className="container px-4 py-12 mx-auto bg-lavender">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/custom-printing" className="hover:text-foreground">
          Custom Printing
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image Gallery */}
        <div>
          <Card className="p-6">
            {product.images && product.images.length > 0 && (
              <>
                <div className="relative w-full aspect-square rounded-lg mb-4 overflow-hidden">
                  <ProductDetailImage
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 justify-center mt-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`border-2 rounded-lg overflow-hidden w-16 h-16 focus:outline-none ${selectedImage === idx ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
                        style={{ background: '#fff' }}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        <div className="relative w-full h-full">
                          <ProductThumbnail
                            src={img}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary">R{product.price.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Your Design</h3>
            <FileUpload
              onChange={handleFilesSelected}
              disabled={uploading}
              maxFiles={10}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Mockup preview (optional)</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingMockup(true)}
                    >
                      {mockupDesign ? "Edit mockup" : "Create mockup preview"}
                    </Button>
                    {!mockupDesign ? (
                      <span
                        className="animate-bounce-slight inline-flex shrink-0 items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground"
                        aria-label="New feature"
                      >
                        New
                      </span>
                    ) : null}
                  </div>
                  {mockupDesign && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setMockupDesign(null)
                        setMockupPreview(null)
                        setIsEditingMockup(false)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {mockupPreview?.url && (
                <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
                  <img
                    src={mockupPreview.url}
                    alt="Mockup preview"
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="text-sm">
                    <div className="font-medium">Preview saved</div>
                    <div className="text-muted-foreground">This will be stored with your order.</div>
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
              placeholder="Add any special instructions for your custom printing..."
            />
          </div>

          {product.sizes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const available = getVariantStockFor(selectedColor, size)
                  const disabled = product.hasColorOptions ? !selectedColor || available <= 0 : available <= 0
                  const low = !disabled && available > 0 && available < 10
                  return (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => {
                        if (disabled) return
                        setSelectedSize(size)
                        setQuantity((q) => capQuantityToStock(q))
                      }}
                      className={`min-w-[60px] relative ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      disabled={disabled}
                      aria-disabled={disabled}
                      title={
                        disabled
                          ? "Out of stock"
                          : low
                            ? `Low stock (${available})`
                            : `In stock (${available})`
                      }
                    >
                      {size}
                      {low && (
                        <span className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                          {available}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {product.colors && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  // Total stock for this color across sizes (or single variant if no sizes).
                  const totalForColor = product.hasSizeOptions
                    ? (product.sizes || []).reduce(
                        (sum, s) => sum + getVariantStockFor(color.name, s),
                        0
                      )
                    : getVariantStockFor(color.name, selectedSize)

                  const disabled = totalForColor <= 0
                  const low = !disabled && totalForColor > 0 && totalForColor < 10

                  return (
                    <button
                      key={color.name}
                      onClick={() => {
                        if (disabled) return
                        setSelectedColor(color.name)
                        // If selected size has no stock in this color, clear it.
                        if (selectedSize && getVariantStockFor(color.name, selectedSize) <= 0) {
                          setSelectedSize("")
                        }
                        setQuantity((q) => capQuantityToStock(q))
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                        selectedColor === color.name
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-gray-200 hover:border-gray-300"
                      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      style={{ backgroundColor: color.value }}
                      title={
                        disabled
                          ? `${color.name} (out of stock)`
                          : low
                            ? `${color.name} (low: ${totalForColor})`
                            : `${color.name} (${totalForColor})`
                      }
                      disabled={disabled}
                      aria-disabled={disabled}
                    >
                      {low && (
                        <span className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                          {totalForColor}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedColor && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedColor}
                </p>
              )}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Uploaded Designs</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
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
                        )
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <input
                type="number"
                min={(product.minOrder ?? 1)}
                value={quantity}
                onChange={(e) =>
                  setQuantity(capQuantityToStock(parseInt(e.target.value) || (product.minOrder ?? 1)))
                }
                className="w-20 px-3 py-2 border rounded-md"
              />
              <span className="text-sm text-muted-foreground">
                Minimum order: {(product.minOrder ?? 1)}
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={
                uploadedFiles.length === 0 ||
                quantity < (product.minOrder ?? 1) ||
                (product.hasSizeOptions && !selectedSize) ||
                (product.hasColorOptions && !selectedColor)
              }
              onClick={handleAddToCart}
            >
              Add to Cart - R{(product.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      <MockupEditorDialog
        open={uploadedFiles.length > 0 && isEditingMockup}
        onOpenChange={(open) => setIsEditingMockup(open)}
        initialImageUrls={uploadedFiles.map((f) => ({
          url: f.url,
          filename: f.filename,
        }))}
        initialDesign={mockupDesign}
        initialGarmentId={
          mockupDesign?.garmentId ??
          (product ? inferMockupGarmentId(product) : undefined)
        }
        onConfirm={async ({ design, previewPngBlob }) => {
          try {
            const file = new File(
              [previewPngBlob],
              `mockup-preview-${Date.now()}.png`,
              { type: "image/png" },
            )
            setUploading(true)
            const [uploaded] = await uploadMultipleFiles(
              [file],
              undefined,
              "custom-printing",
            )
            setMockupDesign(design)
            setMockupPreview({
              url: uploaded.url,
              filename: uploaded.filename,
              size: uploaded.size,
            })
            toast.success("Mockup preview saved")
            setIsEditingMockup(false)
          } catch (e) {
            console.error(e)
            toast.error("Failed to save mockup preview")
          } finally {
            setUploading(false)
          }
        }}
      />

      {/* Additional Information */}
      <div className="mt-12">
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="sizing">Sizing Guide</TabsTrigger>
            <TabsTrigger value="printing">Printing Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">Product Specifications</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>High-quality material suitable for sublimation printing</li>
                <li>Durable and long-lasting print quality</li>
                <li>Available in various sizes</li>
                <li>Quick turnaround time</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="sizing" className="space-y-4">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">Size Chart</h3>
              <p>Please refer to our size guide for detailed measurements.</p>
              <Link href="/size-guide" className="text-primary hover:underline">
                View Full Size Guide
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="printing" className="space-y-4">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">Printing Process</h3>
              <p>Our sublimation printing process ensures:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Vibrant, long-lasting colors</li>
                <li>Detailed, high-resolution prints</li>
                <li>No cracking or peeling</li>
                <li>Wash-resistant finish</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* More from custom printing – internal links for SEO */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-bold mb-4">More custom printing products</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Browse more items you can personalise with your design.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {relatedProducts.map((p) => (
              <li key={p.id}>
                <Link href={`/custom-printing/${p.id}`} className="text-primary hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/custom-printing" className="text-primary font-medium hover:underline">
              View all custom printing products
            </Link>
          </p>
        </div>
      )}
    </div>
  )
} 