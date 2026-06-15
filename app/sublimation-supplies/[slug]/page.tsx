import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { TitanJetProductDetail } from "@/components/titan-jet/TitanJetProductDetail";
import { TitanJetProductSeo } from "@/components/titan-jet/TitanJetProductSeo";
import { isTitanJetConfigured } from "@/lib/titan-jet/config";
import { getTitanJetProductBySlugOrId } from "@/lib/titan-jet/cache";
import { buildTitanJetProductMetadata } from "@/lib/titan-jet/seo";
import { Button } from "@/components/ui/button";
import { PreviousPageButton } from "@/components/previous-page-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isTitanJetConfigured()) {
    return { title: "Product | MOTARRO Supplies Sublimation Supplies" };
  }

  try {
    const product = await getTitanJetProductBySlugOrId(slug);
    if (!product) {
      return { title: "Product not found | MOTARRO Supplies" };
    }

    return buildTitanJetProductMetadata(product);
  } catch {
    return { title: "Product | MOTARRO Supplies Sublimation Supplies" };
  }
}

export default async function SublimationSuppliesProductPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isTitanJetConfigured()) {
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
    const product = await getTitanJetProductBySlugOrId(slug);
    if (!product) {
      notFound();
    }

    return (
      <>
        <TitanJetProductSeo product={product} />
        <TitanJetProductDetail product={product} />
      </>
    );
  } catch (error) {
    console.error("[sublimation-supplies/product]", error);
    return (
      <div className="container px-4 py-16 mx-auto max-w-3xl text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Could not load product</h1>
        <p className="text-muted-foreground mb-6">
          The Titan Jet catalog is temporarily unavailable.
        </p>
        <PreviousPageButton fallbackHref="/sublimation-supplies" variant="outline" />
      </div>
    );
  }
}
