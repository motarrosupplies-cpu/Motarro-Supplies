import { BreadcrumbSchema, ProductSchema } from "@/components/seo/schema-org";
import {
  titanJetProductBreadcrumbs,
  titanJetProductSchemaInput,
} from "@/lib/titan-jet/seo";
import type { TitanJetProduct } from "@/types/titan-jet";

export function TitanJetProductSeo({ product }: { product: TitanJetProduct }) {
  const schema = titanJetProductSchemaInput(product);

  return (
    <>
      <BreadcrumbSchema items={titanJetProductBreadcrumbs(product)} />
      <ProductSchema product={schema.product} productUrl={schema.productUrl} />
    </>
  );
}
