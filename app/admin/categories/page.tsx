import type { Metadata } from "next";
import { CategoriesManagement } from "@/components/admin/CategoriesManagement";

export const metadata: Metadata = {
  title: "Categories | Admin | MOTARRO Supplies",
  description: "Manage product categories and Kevro catalog taxonomy",
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Manage store categories, Kevro supplier categories, types, and brands used in header filters and catalog pages.
        </p>
      </div>
      <CategoriesManagement />
    </div>
  );
}
