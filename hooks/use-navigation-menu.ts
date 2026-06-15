"use client";

import { useEffect, useState } from "react";
import {
  fetchNavigationCategories,
  staticNavigationCategories,
  type NavCategory,
} from "@/lib/menu/navigation";

export function useNavigationMenu() {
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchNavigationCategories()
      .then((items) => {
        if (!cancelled) {
          setCategories(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories(staticNavigationCategories);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading };
}
