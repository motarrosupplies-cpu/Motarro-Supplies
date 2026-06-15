"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigationMenu } from "@/hooks/use-navigation-menu"

interface NavigationMenuProps {
  className?: string
}

export function NavigationMenu({ className }: NavigationMenuProps) {
  const { categories, isLoading } = useNavigationMenu()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (categoryName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredCategory(categoryName)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 150)
  }

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(activeCategory === categoryName ? null : categoryName)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (isLoading || categories.length === 0) {
    return null
  }

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <nav className="flex items-center space-x-8">
        {categories.map((category) => (
          <div
            key={category.name}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.name)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center">
              <Link
                href={category.href}
                className="font-medium text-sm transition-colors hover:text-primary py-2"
              >
                {category.name}
              </Link>
              {category.subcategories && (
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="ml-1 p-1 hover:bg-muted rounded-sm transition-colors"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>

            {category.subcategories && (
              <div
                className={cn(
                  "absolute top-full left-1/2 z-50 mt-2 min-w-[14rem] -translate-x-1/2 rounded-xl border bg-white shadow-lg transition-all duration-200",
                  hoveredCategory === category.name || activeCategory === category.name
                    ? "opacity-100 visible translate-y-0"
                    : "pointer-events-none invisible translate-y-2 opacity-0"
                )}
              >
                <div className="p-2">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.name}
                      href={subcategory.href}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/60 group"
                    >
                      <div>
                        <div className="text-sm font-medium whitespace-nowrap group-hover:text-primary">
                          {subcategory.name}
                        </div>
                        {subcategory.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {subcategory.description}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
