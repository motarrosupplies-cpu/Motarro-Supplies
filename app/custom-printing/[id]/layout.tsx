import { Metadata } from "next"
import { supabase } from "@/lib/supabaseClient"

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const productId = params.id

  try {
    const { data: product } = await supabase
      .from("all_products_unified")
      .select("id, name, description, image, images, seo_title, seo_description, seo_keywords, status, category")
      .or(`id.eq.${productId},sku.eq.${productId}`)
      .eq("status", "active")
      .eq("category", "custom printing")
      .single()

    if (!product) {
      return {
        title: "Custom Printing Product Not Found | MOTARRO Supplies",
        description: "The custom printing product you are looking for does not exist.",
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    let title = product.seo_title || `${product.name} | Custom Printing`
    if (title.length > 60) title = title.substring(0, 59) + '…'
    const description =
      product.seo_description ||
      product.description ||
      `Discover ${product.name} from MOTARRO Supplies's custom printing range.`

    let images: string[] = []
    if (product.images) {
      if (Array.isArray(product.images)) {
        images = product.images.filter(Boolean)
      } else if (typeof product.images === "string") {
        try {
          const parsed = JSON.parse(product.images)
          images = Array.isArray(parsed) ? parsed.filter(Boolean) : []
        } catch {
          // ignore parse failures
        }
      }
    }
    if (images.length === 0 && product.image) {
      images = [product.image]
    }

    const keywords =
      product.seo_keywords && Array.isArray(product.seo_keywords)
        ? product.seo_keywords
        : [
            product.name,
            "custom printing",
            "custom apparel",
            "South Africa",
            "MOTARRO Supplies",
          ]

    const canonical = `https://www.motarro.co.za/custom-printing/${product.id}`

    return {
      title,
      description: description.substring(0, 160),
      keywords,
      openGraph: {
        title,
        description: description.substring(0, 160),
        url: canonical,
        siteName: "MOTARRO Supplies",
        images: images.map((img) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: product.name,
        })),
        type: "product",
        locale: "en_ZA",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.substring(0, 160),
        images: images.length > 0 ? [images[0]] : [],
      },
      alternates: {
        canonical,
      },
    }
  } catch (error) {
    console.error("Error generating custom printing metadata:", error)
    return {
      title: "Custom Printing | MOTARRO Supplies",
      description:
        "Explore custom printing products and services from MOTARRO Supplies.",
    }
  }
}

export default function CustomPrintingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


