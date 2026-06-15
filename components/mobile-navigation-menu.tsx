"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { cn } from "@/lib/utils";

interface MobileNavigationMenuProps {
  onNavigate?: () => void;
}

export function MobileNavigationMenu({ onNavigate }: MobileNavigationMenuProps) {
  const { categories, isLoading } = useNavigationMenu();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3 px-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-10 rounded-md bg-muted/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1 mt-4">
      {categories.map((category) => {
        const hasChildren = Boolean(category.subcategories?.length);
        const isOpen = expanded === category.name;

        return (
          <div key={category.name} className="border-b border-border/60 pb-2">
            <div className="flex items-center justify-between gap-2 px-3">
              <Link
                href={category.href}
                className="flex-1 text-lg font-medium py-2 hover:text-primary transition-colors"
                onClick={onNavigate}
              >
                {category.name}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.name} submenu`}
                  className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    setExpanded(isOpen ? null : category.name)
                  }
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>

            {hasChildren && isOpen && (
              <div className="ml-4 mr-2 mt-1 space-y-0.5">
                {category.subcategories!.map((subcategory) => (
                  <Link
                    key={`${category.name}-${subcategory.name}`}
                    href={subcategory.href}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    onClick={onNavigate}
                  >
                    <span className="font-medium text-foreground/90">
                      {subcategory.name}
                    </span>
                    {subcategory.description && (
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {subcategory.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4 mx-3 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm text-primary font-medium">
          Because apparently you have to wear Clothes...
        </p>
      </div>
    </nav>
  );
}
