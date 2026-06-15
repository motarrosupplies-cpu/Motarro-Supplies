"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { normalizeTitanJetCatalogFilter } from "@/lib/titan-jet/catalog-filters";

type Props = {
  categories: string[];
  brands: string[];
};

export function TitanJetCatalogFilters({ categories, brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(
    normalizeTitanJetCatalogFilter(searchParams.get("search")) || ""
  );

  const currentCategory =
    normalizeTitanJetCatalogFilter(searchParams.get("category")) || "all";
  const currentBrand =
    normalizeTitanJetCatalogFilter(searchParams.get("brand")) || "all";
  const inStockOnly = searchParams.get("inStock") === "true";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      const normalized = normalizeTitanJetCatalogFilter(value);
      if (!normalized) {
        params.delete(key);
      } else {
        params.set(key, normalized);
      }
    }

    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/sublimation-supplies?${query}` : "/sublimation-supplies");
    });
  }

  return (
    <div className="bg-white border rounded-2xl p-4 md:p-6 space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={currentCategory}
          onValueChange={(value) => updateParams({ category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentBrand}
          onValueChange={(value) => updateParams({ brand: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form
          className="flex gap-2 lg:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ search: search.trim() || null });
          }}
        >
          <Input
            placeholder="Search supplies..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit" disabled={isPending}>
            Search
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) =>
              updateParams({ inStock: checked === true ? "true" : null })
            }
          />
          In stock only
        </label>
        {(searchParams.get("search") ||
          searchParams.get("category") ||
          searchParams.get("brand") ||
          inStockOnly) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setSearch("");
              startTransition(() => {
                router.push("/sublimation-supplies");
              });
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
