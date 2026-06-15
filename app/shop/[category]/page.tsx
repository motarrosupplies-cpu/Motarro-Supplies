import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"
import {
  MotarroCategoryPage,
  buildMotarroCategoryMetadata,
} from "@/components/catalog/MotarroCategoryPage"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  return MOTARRO_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: slug } = await params
  const category = MOTARRO_CATEGORIES.find((c) => c.slug === slug)
  if (!category) return {}
  return buildMotarroCategoryMetadata(category)
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ type?: string; inStock?: string }>
}) {
  const { category: slug } = await params
  const category = MOTARRO_CATEGORIES.find((c) => c.slug === slug)
  if (!category) notFound()
  return <MotarroCategoryPage category={category} searchParams={searchParams} />
}
