"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type VariantRow = {
  id?: string;
  colorName?: string | null;
  colorValue?: string | null;
  size?: string | null;
  priceOverride?: number | null;
  stockAvailable: number;
  stockIncoming: number;
  stockReserved: number;
  isActive: boolean;
};

export const FIXED_SIZES: string[] = [
  "XXS",
  "XS",
  "SML",
  "MED",
  "LAR",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
];

interface VariantMatrixProps {
  colors: { name: string; value: string }[];
  sizes: string[];
  enableColors: boolean;
  enableSizes: boolean;
  value: VariantRow[];
  onChange: (rows: VariantRow[]) => void;
}

export function VariantMatrix({ colors, sizes, enableColors, enableSizes, value, onChange }: VariantMatrixProps) {
  const canonical = useMemo(() => {
    const map = new Map<string, VariantRow>();
    for (const row of value) {
      const key = `${row.colorValue ?? ""}|${row.size ?? ""}`;
      map.set(key, row);
    }

    const resolvedColors = enableColors
      ? (colors.length > 0
          ? colors
          : Array.from(
              new Map(
                value
                  .filter(row => row.colorValue)
                  .map(row => [
                    row.colorValue as string,
                    {
                      name: row.colorName ?? "",
                      value: row.colorValue as string,
                    },
                  ])
              ).values()
            ))
      : [{ name: "", value: "" }];

    if (resolvedColors.length === 0) {
      resolvedColors.push({ name: "", value: "" });
    }

    const resolvedSizes = enableSizes
      ? (sizes && sizes.length > 0
          ? sizes
          : Array.from(
              new Set(
                value
                  .map(row => row.size)
                  .filter((size): size is string => !!size && size.trim() !== "")
              )
            ))
      : [""];

    const sizeLoop = enableSizes
      ? (resolvedSizes.length > 0 ? resolvedSizes : [""])
      : [""];

    const colorLoop = enableColors ? resolvedColors : [{ name: "", value: "" }];

    const rows: VariantRow[] = [];

    for (const color of colorLoop) {
      for (const size of sizeLoop) {
        const key = `${enableColors ? color.value ?? "" : ""}|${enableSizes ? size ?? "" : ""}`;
        const existing = map.get(key);
        rows.push(
          existing ?? {
            colorName: enableColors ? color.name || null : null,
            colorValue: enableColors ? color.value || null : null,
            size: enableSizes ? (size || null) : null,
            stockAvailable: 0,
            stockIncoming: 0,
            stockReserved: 0,
            priceOverride: null,
            isActive: true,
          }
        );
      }
    }

    if (!enableColors && !enableSizes && rows.length === 0) {
      rows.push({
        colorName: null,
        colorValue: null,
        size: null,
        stockAvailable: 0,
        stockIncoming: 0,
        stockReserved: 0,
        priceOverride: null,
        isActive: true,
      });
    }

    return rows;
  }, [colors, sizes, enableColors, enableSizes, value]);

  const update = (index: number, patch: Partial<VariantRow>) => {
    const next = [...canonical];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const applyToAll = (patch: Partial<VariantRow>) => {
    const next = canonical.map(r => ({ ...r, ...patch }));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Variant Matrix</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => applyToAll({ stockAvailable: 0, stockIncoming: 0, stockReserved: 0 })}>Clear stock</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => applyToAll({ priceOverride: null })}>Clear prices</Button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {enableColors && <th className="px-3 py-2 text-left">Colour</th>}
              {enableSizes && <th className="px-3 py-2 text-left">Size</th>}
              <th className="px-3 py-2 text-right">Available</th>
              <th className="px-3 py-2 text-right">Incoming</th>
              <th className="px-3 py-2 text-right">Reserved</th>
              <th className="px-3 py-2 text-right">Price (override)</th>
            </tr>
          </thead>
          <tbody>
            {canonical.map((row, index) => (
              <tr key={`${row.colorValue ?? ""}|${row.size ?? ""}`} className="border-t">
                {enableColors && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full border" style={{ backgroundColor: row.colorValue ?? "#fff" }} />
                      <span>{row.colorName}</span>
                    </div>
                  </td>
                )}
                {enableSizes && <td className="px-3 py-2">{row.size}</td>}
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="text-right"
                    value={row.stockAvailable}
                    onChange={(e) => update(index, { stockAvailable: Math.max(0, Number(e.target.value || 0)) })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="text-right"
                    value={row.stockIncoming}
                    onChange={(e) => update(index, { stockIncoming: Math.max(0, Number(e.target.value || 0)) })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="text-right"
                    value={row.stockReserved}
                    onChange={(e) => update(index, { stockReserved: Math.max(0, Number(e.target.value || 0)) })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="text-right"
                    value={row.priceOverride ?? ""}
                    placeholder="—"
                    onChange={(e) => {
                      const val = e.target.value;
                      update(index, { priceOverride: val === "" ? null : Number(val) });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 