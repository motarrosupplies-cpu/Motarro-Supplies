import Link from "next/link"
import { HeroImage, CategoryBanner } from "@/components/optimized-image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Zap } from "lucide-react"

export function LifestyleSection() {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        {/* Main Lifestyle Banner */}
        <div className="relative h-[600px] rounded-3xl overflow-hidden mb-16 group">
          <HeroImage
            src="/images/hero-optimized.webp"
            alt="Lifestyle Fashion - Custom Printed Apparel in South Africa"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
            quality={75}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='600' viewBox='0 0 1920 600'%3E%3Crect width='1920' height='600' fill='%23231f4f'/%3E%3C/svg%3E"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          
          {/* Content overlay */}
          <div className="relative h-full flex items-center">
            <div className="max-w-2xl px-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                  Express Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Unique Style
                  </span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  From corporate uniforms to personal fashion statements, we bring your vision to life with premium custom printing services across South Africa.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/95 rounded-full px-8 py-6 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Link href="/custom-printing" className="flex items-center gap-2">
                    Start Custom Design
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Link href="/about">About MOTARRO Supplies</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-primary">5000+</h3>
            <p className="text-lg text-muted-foreground">Happy Customers</p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 fill-amber-500 text-amber-500" aria-hidden />
            </div>
            <h3 className="text-3xl font-black text-primary">5/5</h3>
            <p className="text-lg text-muted-foreground">Customer Rating</p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-black text-primary">48hrs</h3>
            <p className="text-lg text-muted-foreground">Fast Turnaround</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-primary">Why Choose MOTARRO Supplies?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Premium Quality Materials</h4>
                  <p className="text-muted-foreground">We use only the finest fabrics and printing techniques for lasting results.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Fast & Reliable Delivery</h4>
                  <p className="text-muted-foreground">Quick turnaround times with reliable shipping across South Africa.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Custom Design Support</h4>
                  <p className="text-muted-foreground">Our design team helps bring your vision to life with professional guidance.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-3xl overflow-hidden group">
            <CategoryBanner
              src="https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/Mens-Collection01.jpg?width=1200&quality=75"
              alt="Custom Printing Process - Professional Quality"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23e5e7eb'/%3E%3C/svg%3E"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h4 className="text-2xl font-bold mb-2">Professional Printing</h4>
              <p className="text-white/90">State-of-the-art equipment for perfect results every time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
