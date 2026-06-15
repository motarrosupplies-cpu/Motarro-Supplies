"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Menu, Search, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { buildCartItemKey } from "@/lib/cart/keys"
import { getKevroLineBreakdown } from "@/lib/cart/kevro-breakdown"
import { CartTotalsSummary } from "@/components/cart/CartTotalsSummary"
import { AccountPopover } from "@/components/account-popover"
import { NavigationMenu } from "@/components/navigation-menu"
import { MobileNavigationMenu } from "@/components/mobile-navigation-menu"
import { Trash2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { PRICE_ITEM_LABEL } from "@/components/pricing/PriceBreakdown"
import { sidebarLinks } from "@/components/admin/AdminSidebar"
import { MOTARRO_LOGO_PATH } from "@/lib/brand"

// Trivial change to force Vercel cache bust

interface SearchResult {
  id: string
  name: string
  price: string | number
  category: string
  image: string
  description: string
  slug?: string | null
  seoSlug?: string | null
  href?: string
  source?: string
}

type SidebarLink = { title: string; href: string; icon: React.ElementType };

export function Header() {
  const router = useRouter()
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith("/admin");
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {
    items,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearchQuery) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [debouncedSearchQuery])

  const handleSearchSelect = (productId: string) => {
    setIsSearchOpen(false)
    setSearchQuery("")
    const product = searchResults.find(p => p.id === productId);
    if (product?.href) {
      router.push(product.href)
      return
    }
    const url = product?.slug || product?.seoSlug || productId;
    router.push(`/products/${url}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container flex h-20 items-center px-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            {isAdmin ? (
              <nav className="flex flex-col gap-4 mt-8">
                {sidebarLinks.map((link: SidebarLink) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                      <Icon className="h-5 w-5" />
                      {link.title}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <ScrollArea className="h-[calc(100vh-4rem)] pr-4">
                <MobileNavigationMenu onNavigate={() => setIsMenuOpen(false)} />
              </ScrollArea>
            )}
          </SheetContent>
        </Sheet>

        <Link href="/" className="ml-4 md:ml-0 flex items-center">
          <Image
            src={MOTARRO_LOGO_PATH}
            alt="MOTARRO Supplies Logo"
            width={160}
            height={48}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>

        <nav className="mx-6 hidden lg:flex items-center">
          <NavigationMenu />
        </nav>

        <nav className="mx-6 hidden md:flex lg:hidden items-center overflow-x-auto max-w-[42vw] scrollbar-none">
          <NavigationMenu className="min-w-max" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={searchRef}>
            {isSearchOpen ? (
              <div className="relative flex items-center">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-[200px] md:w-[300px] rounded-full pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
                {(searchResults.length > 0 || isLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
                    <ScrollArea className="max-h-[300px]">
                      {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((result) => (
                          <button
                            key={result.id}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                            onClick={() => handleSearchSelect(result.id)}
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={result.image || "/placeholder.svg"}
                                alt={result.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{result.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </p>
                              <p className="text-sm font-medium text-primary">
                                {formatCurrency(Number(result.price))}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          <AccountPopover />

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              <div className="px-6 py-4 border-b">
                <SheetTitle className="text-lg">Shopping Cart</SheetTitle>
              </div>
              <div className="flex flex-col h-[calc(100vh-8rem)]">
                <div className="flex-1 overflow-y-auto px-6">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Your cart is empty</h3>
                      <p className="text-sm text-muted-foreground mt-2">Add some products to your cart to see them here.</p>
                      <Button asChild className="mt-4">
                        <Link href="/products">Continue Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {items.map((item) => {
                        const key = buildCartItemKey(item);
                        const breakdown = getKevroLineBreakdown(item);
                        const lineTotal = breakdown
                          ? breakdown.totalInclVat
                          : (typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * (item.quantity || 1);
                        return (
                          <div key={key} className="flex gap-4">
                            <div className="relative w-20 h-20">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.selectedSize && `Size: ${item.selectedSize}`}
                                    {item.selectedColor && ` | Color: ${item.selectedColor}`}
                                  </p>
                                  {breakdown && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {PRICE_ITEM_LABEL} {formatCurrency(breakdown.garmentTotal)}
                                      {breakdown.brandingTotal > 0 && ` · Branding ${formatCurrency(breakdown.brandingTotal)}`}
                                      {breakdown.setupFee > 0 && ` · Setup ${formatCurrency(breakdown.setupFee)}`}
                                    </p>
                                  )}
                                  <div className="mt-1">
                                    <select
                                      value={item.quantity}
                                      onChange={(e) => updateQuantity(key, parseInt(e.target.value))}
                                      className="text-sm border rounded p-1"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>
                                          {num}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(lineTotal)}</p>
                                  {breakdown && (
                                    <p className="text-xs text-muted-foreground">incl. VAT</p>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => removeFromCart(key)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {items.length > 0 && (
                  <div className="border-t p-6">
                    <CartTotalsSummary compact />
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push('/checkout');
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

