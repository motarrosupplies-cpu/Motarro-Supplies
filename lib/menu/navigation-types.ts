export interface NavSubcategory {
  name: string;
  href: string;
  description?: string;
}

export interface NavCategory {
  name: string;
  href: string;
  subcategories?: NavSubcategory[];
}
