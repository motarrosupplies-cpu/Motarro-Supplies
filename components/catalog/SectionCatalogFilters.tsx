"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransition } from "react";

interface SectionCatalogFiltersProps {
  basePath: string;
  categories: string[];
  types: string[];
  brands: string[];
  activeSubcategory?: string | null;
  activeKevroCategory?: string | null;
}

export function SectionCatalogFilters({
  basePath,
  categories,
  types,
  brands,
  activeSubcategory,
  activeKevroCategory,
}: SectionCatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "all";
  const currentBrand = searchParams.get("brand") || "all";
  const currentType = searchParams.get("type") || "all";
  const inStockOnly = searchParams.get("inStock") === "true";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  if (categories.length === 0 && types.length === 0 && brands.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-2xl p-4 md:p-6 space-y-4 mb-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Branded catalog filters</span>
        {activeKevroCategory && (
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1">
            {activeKevroCategory}
          </span>
        )}
        {activeSubcategory && !activeKevroCategory && (
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1">
            {activeSubcategory.replace(/-/g, " ")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length > 0 && (
          <Select
            value={currentCategory}
            onValueChange={(value) => updateParams({ category: value, type: null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {types.length > 0 && (
          <Select
            value={currentType}
            onValueChange={(value) => updateParams({ type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {brands.length > 0 && (
          <Select
            value={currentBrand}
            onValueChange={(value) => updateParams({ brand: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) =>
              updateParams({ inStock: checked === true ? "true" : null })
            }
          />
          In stock only
        </label>

        {(searchParams.get("category") ||
          searchParams.get("brand") ||
          searchParams.get("type") ||
          inStockOnly) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                router.push(basePath);
              });
            }}
          >
            Clear branded filters
          </Button>
        )}

        {isPending && (
          <span className="text-sm text-muted-foreground">Updating...</span>
        )}
      </div>
    </div>
  );
}
