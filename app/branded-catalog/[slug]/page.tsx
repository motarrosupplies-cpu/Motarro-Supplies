import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { KevroProductDetail } from "@/components/kevro/KevroProductDetail";
import { KevroProductSeo } from "@/components/kevro/KevroProductSeo";
import { isKevroConfigured } from "@/lib/kevro/config";
import { getKevroProductBySlugOrId } from "@/lib/kevro/cache";
import { buildKevroProductMetadata } from "@/lib/kevro/seo";
import { Button } from "@/components/ui/button";
import { PreviousPageButton } from "@/components/previous-page-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isKevroConfigured()) {
    return { title: "Product | MOTARRO Supplies Branded Catalog" };
  }

  try {
    const product = await getKevroProductBySlugOrId(slug);
    if (!product) {
      return { title: "Product not found | MOTARRO Supplies" };
    }

    return buildKevroProductMetadata(product);
  } catch {
    return { title: "Product | MOTARRO Supplies Branded Catalog" };
  }
}

export default async function BrandedCatalogProductPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isKevroConfigured()) {
    return (
      <div className="container px-4 py-16 mx-auto max-w-3xl text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Catalog feed not configured</h1>
        <Button asChild className="mt-6">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    );
  }

  try {
    const product = await getKevroProductBySlugOrId(slug);
    if (!product) {
      notFound();
    }

    return (
      <>
        <KevroProductSeo product={product} />
        <KevroProductDetail product={product} />
      </>
    );
  } catch (error) {
    console.error("[branded-catalog/product]", error);
    return (
      <div className="container px-4 py-16 mx-auto max-w-3xl text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Could not load product</h1>
        <p className="text-muted-foreground mb-6">
          The supplier feed is temporarily unavailable.
        </p>
        <PreviousPageButton fallbackHref="/branded-catalog" variant="outline" />
      </div>
    );
  }
}
