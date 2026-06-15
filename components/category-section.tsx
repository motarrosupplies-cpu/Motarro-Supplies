import type { ElementType } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Pencil, Palette, Shapes, Hammer, Layers, Sparkles } from "lucide-react"
import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"

const categoryIcons: Record<string, ElementType> = {
  plastic: Shapes,
  paper: Package,
  wooden: Hammer,
  metal: Layers,
  acrylic: Sparkles,
  tiles: Layers,
  "foam-craft": Package,
  "art-supplies": Palette,
}

const categoryColors: Record<string, string> = {
  plastic: "from-primary/80 to-primary",
  paper: "from-foreground/70 to-foreground",
  wooden: "from-accent/80 to-accent",
  metal: "from-muted-foreground/80 to-foreground",
  acrylic: "from-secondary/90 to-secondary-foreground/40",
  tiles: "from-primary/60 to-accent/80",
  "foam-craft": "from-secondary to-primary/70",
  "art-supplies": "from-accent/80 to-primary/80",
}

export function CategorySection() {
  const featured = MOTARRO_CATEGORIES.slice(0, 6)

  return (
    <section className="py-20 space-y-16">
      <div className="flex flex-col items-center text-center space-y-4 w-full px-4">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-primary">
          Shop by Category
        </h2>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Explore our full range of stationery and craft supplies — aligned with the MOTARRO catalogue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {featured.map((category) => {
          const Icon = categoryIcons[category.slug] || Pencil
          const gradient = categoryColors[category.slug] || "from-primary to-primary/70"
          return (
            <Link key={category.slug} href={`/shop/${category.slug}`} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl rounded-2xl border-0 shadow-md group-hover:scale-[1.02]">
                <CardContent className="p-8 space-y-4">
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground">{category.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{category.description}</p>
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                    Shop {category.name}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="text-center pt-4">
        <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-semibold">
          <Link href="/products" className="flex items-center gap-2">
            View All Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
