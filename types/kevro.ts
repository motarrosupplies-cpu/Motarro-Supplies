export interface KevroStockRow {
  StockCode: string;
  StockHeaderID: number;
  StockID: number;
  Description: string;
  Colour: string;
  Size: string;
  ColorStatus: string;
  BasePrice: number;
  DiscountBasePrice?: number;
  DiscountedPrice?: number;
  RoyaltyFactor: number;
  Category: string;
  Type: string;
  Brand: string;
  Image: string;
  QtyAvailable?: number;
  GarmentType?: string;
  Gender?: string;
}

export interface KevroVariant {
  stockId: number;
  stockCode: string;
  colour: string;
  size: string;
  colorStatus: string;
  basePrice: number;
  salePrice: number;
  displayPrice: number;
  qtyAvailable: number;
  image: string;
  inStock: boolean;
}

export interface KevroColorOption {
  name: string;
  image: string;
  status: string;
}

export interface KevroProduct {
  id: string;
  slug?: string;
  stockHeaderId: number;
  stockCode: string;
  name: string;
  description: string;
  category: string;
  type: string;
  brand: string;
  image: string;
  images: string[];
  colors: KevroColorOption[];
  sizes: string[];
  variants: KevroVariant[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
  garmentType?: string;
  gender?: string;
  storeSection?: string;
  subcategorySlug?: string;
}

export interface KevroCategory {
  category: string;
}

export interface KevroBrandingOption {
  stockHeaderId: number;
  name: string;
  brandingType: string;
  brandingDifficulty?: number;
  notes?: string;
}

export interface KevroBrandingPosition {
  stockHeaderId: number;
  description: string;
  brandingType: string;
  brandingPosition: string;
  notes?: string;
}

export interface KevroBrandingPrice {
  stockHeaderId: number;
  description: string;
  brandingType: string;
  brandingSize: string;
  brandingColours: number;
  unitPrice: number;
  discountedUnitPrice: number;
  setupFee: number;
  discountedSetupFee: number;
  qty: number;
}

export interface KevroBrandingSelection {
  brandingType: string;
  brandingPosition: string;
  brandingSize: string;
  unitPrice: number;
  setupFee: number;
}

export interface KevroCartMetadata {
  source: "kevro";
  stockHeaderId: number;
  stockId: number;
  stockCode: string;
  garmentUnitPrice?: number;
  /** When false, customer ordered the plain garment without custom branding. */
  wantsBranding?: boolean;
  branding?: KevroBrandingSelection;
  setupFee?: number;
}

export interface KevroProductRecord {
  id: string;
  stock_header_id: number;
  stock_code: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  type: string | null;
  brand: string | null;
  image: string | null;
  images: string[];
  colors: KevroColorOption[];
  sizes: string[];
  variants: KevroVariant[];
  min_price: number;
  max_price: number;
  total_stock: number;
  in_stock: boolean;
  garment_type: string | null;
  gender: string | null;
  store_section: string | null;
  subcategory_slug: string | null;
  status: string;
  synced_at: string;
}
