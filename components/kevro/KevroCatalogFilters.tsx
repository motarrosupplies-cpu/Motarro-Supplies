"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

interface KevroCatalogFiltersProps {
  categories: string[];
  brands: string[];
  types: string[];
}

export function KevroCatalogFilters({
  categories,
  brands,
  types,
}: KevroCatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

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

    startTransition(() => {
      router.push(`/branded-catalog?${params.toString()}`);
    });
  }

  return (
    <div className="bg-white border rounded-2xl p-4 md:p-6 space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={currentCategory}
          onValueChange={(value) => updateParams({ category: value, type: null })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
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

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ search: search.trim() || null });
          }}
        >
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit" disabled={isPending}>
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Button
          type="button"
          variant={inStockOnly ? "default" : "outline"}
          size="sm"
          onClick={() =>
            updateParams({ inStock: inStockOnly ? null : "true" })
          }
        >
          In stock only
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            startTransition(() => router.push("/branded-catalog"));
          }}
        >
          Clear filters
        </Button>
        {isPending && (
          <span className="text-sm text-muted-foreground">Updating...</span>
        )}
      </div>
    </div>
  );
}
