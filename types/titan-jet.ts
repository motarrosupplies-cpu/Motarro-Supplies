export interface TitanJetVariant {
  wcProductId: number;
  sku: string;
  displayPrice: number;
  basePrice: number;
  qtyAvailable: number;
  inStock: boolean;
}

export interface TitanJetProduct {
  id: string;
  slug: string;
  wcProductId: number;
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  categories: string[];
  brand: string;
  image: string;
  images: string[];
  tags: string[];
  attributes: Array<{ name: string; value: string }>;
  variants: TitanJetVariant[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
  productType: string;
  storeSection?: string;
}

export interface TitanJetCartMetadata {
  source: "titan-jet";
  wcProductId: number;
  sku: string;
  supplierUnitPrice?: number;
}

export interface TitanJetProductRecord {
  id: string;
  wc_product_id: number;
  slug: string;
  sku: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  category: string | null;
  categories: string[];
  brand: string | null;
  image: string | null;
  images: string[];
  tags: string[];
  attributes: Array<{ name: string; value: string }>;
  variants: TitanJetVariant[];
  min_price: number;
  max_price: number;
  total_stock: number;
  in_stock: boolean;
  product_type: string;
  store_section: string | null;
  status: string;
  synced_at: string;
}
