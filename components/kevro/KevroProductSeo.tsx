import { BreadcrumbSchema, ProductSchema } from "@/components/seo/schema-org";
import {
  kevroProductBreadcrumbs,
  kevroProductSchemaInput,
} from "@/lib/kevro/seo";
import type { KevroProduct } from "@/types/kevro";

export function KevroProductSeo({ product }: { product: KevroProduct }) {
  const schema = kevroProductSchemaInput(product);

  return (
    <>
      <BreadcrumbSchema items={kevroProductBreadcrumbs(product)} />
      <ProductSchema
        product={schema.product}
        productUrl={schema.productUrl}
      />
    </>
  );
}
