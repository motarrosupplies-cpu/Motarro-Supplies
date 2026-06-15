// Utility functions for working with menu items in product forms

export interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  parent_id: string | null;
  order_index: number;
  level: number;
  is_active: boolean;
  is_header: boolean;
  children?: MenuItem[];
}

export interface CategoryOption {
  value: string;
  label: string;
  children?: CategoryOption[];
}

/**
 * Fetches menu items from the API and structures them for dropdowns
 */
export async function fetchMenuItemsForProducts(): Promise<MenuItem[]> {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/admin/menu-items?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch menu items:', response.statusText);
      return [];
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [];
    console.log('🔍 fetchMenuItemsForProducts - Fetched items:', items.length);
    console.log('🔍 fetchMenuItemsForProducts - Sample items:', items.slice(0, 5).map(item => ({
      label: item.label,
      level: item.level,
      parent_id: item.parent_id,
      is_active: item.is_active
    })));
    return items;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Builds a hierarchical tree structure from flat menu items
 */
export function buildMenuTree(items: MenuItem[]): MenuItem[] {
  if (!items || !Array.isArray(items)) {
    console.warn('buildMenuTree: items is not a valid array');
    return [];
  }

  const map = new Map<string, MenuItem & { children: MenuItem[] }>();
  const roots: MenuItem[] = [];

  console.log('🔍 buildMenuTree - Input items count:', items.length);
  console.log('🔍 buildMenuTree - Sample items:', items.slice(0, 10).map(item => ({
    id: item.id,
    label: item.label,
    level: item.level,
    parent_id: item.parent_id,
    is_active: item.is_active,
    is_header: item.is_header,
    order_index: item.order_index
  })));

  // First pass: create all items with children array
  // Include ALL items to match menu management exactly (no filtering)
  items.forEach(item => {
    if (item && item.id) {
      map.set(item.id, { ...item, children: [] });
    }
  });
  
  console.log('🔍 buildMenuTree - Items in map:', map.size);

  // Second pass: build hierarchy
  map.forEach(item => {
    if (item.parent_id && map.has(item.parent_id)) {
      const parent = map.get(item.parent_id);
      if (parent) {
        parent.children!.push(item);
        console.log(`🔍 buildMenuTree - Added "${item.label}" as child of "${parent.label}"`);
      } else {
        console.warn(`🔍 buildMenuTree - Parent not found for "${item.label}" (parent_id: ${item.parent_id})`);
      }
    } else {
      roots.push(item);
      console.log(`🔍 buildMenuTree - Added "${item.label}" as root item (level: ${item.level}, parent_id: ${item.parent_id})`);
    }
  });
  
  console.log('🔍 buildMenuTree - Root items count:', roots.length);
  console.log('🔍 buildMenuTree - Root items:', roots.map(r => ({
    label: r.label,
    level: r.level,
    parent_id: r.parent_id,
    is_active: r.is_active,
    is_header: r.is_header,
    order_index: r.order_index,
    childrenCount: r.children?.length || 0
  })));

  // Sort by order_index
  function sortTree(nodes: MenuItem[]) {
    nodes.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    nodes.forEach(n => {
      if (n.children) {
        sortTree(n.children);
      }
    });
  }

  sortTree(roots);
  return roots;
}

/**
 * Gets top-level menu items (categories) for the main category dropdown
 * Matches exactly what menu management shows - uses the root items from the tree
 * The tree building already determines what's a root item (no parent_id)
 */
export function getMainCategories(menuTree: MenuItem[]): CategoryOption[] {
  // menuTree already contains only root items (items with no parent_id)
  // This matches exactly what menu management displays as top-level categories
  console.log('🔍 getMainCategories - Menu tree (root items):', menuTree.length);
  console.log('🔍 getMainCategories - Root items:', menuTree.map(item => ({
    label: item.label,
    level: item.level,
    parent_id: item.parent_id,
    is_active: item.is_active,
    is_header: item.is_header,
    order_index: item.order_index
  })));
  
  // Convert root items to category options - no filtering needed, tree already has roots
  const categories = menuTree
    .map(item => ({
      value: item.label.toLowerCase().replace(/\s+/g, '-'),
      label: item.label,
      children: item.children && item.children.length > 0 
        ? item.children
            .filter(child => child.is_active !== false)
            .map(child => ({
              value: child.label.toLowerCase().replace(/\s+/g, '-'),
              label: child.label
            }))
        : undefined
    }))
    // Sort by order_index if available, then by label
    .sort((a, b) => {
      // Find original items to get order_index
      const itemA = menuTree.find(item => item.label.toLowerCase().replace(/\s+/g, '-') === a.value);
      const itemB = menuTree.find(item => item.label.toLowerCase().replace(/\s+/g, '-') === b.value);
      const orderA = itemA?.order_index || 999;
      const orderB = itemB?.order_index || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.label.localeCompare(b.label);
    });
  
  console.log('🔍 getMainCategories - Found categories:', categories.map(c => ({ label: c.label, value: c.value, childrenCount: c.children?.length || 0 })));
  console.log('🔍 getMainCategories - Total menu tree items:', menuTree.length);
  console.log('🔍 getMainCategories - Menu tree items:', menuTree.map(item => ({
    label: item.label,
    level: item.level,
    parent_id: item.parent_id,
    is_active: item.is_active,
    order_index: item.order_index
  })));
  return categories;
}

/**
 * Gets subcategories for a selected main category
 */
export function getSubCategories(menuTree: MenuItem[], mainCategoryValue: string): CategoryOption[] {
  if (!mainCategoryValue) {
    return [];
  }

  // Normalize the input value for comparison
  const normalizedValue = mainCategoryValue.toLowerCase().trim().replace(/\s+/g, '-');

  console.log('🔍 getSubCategories - Looking for category:', normalizedValue);
  console.log('🔍 getSubCategories - Available menu tree items:', menuTree.map(item => ({
    label: item.label,
    normalized: item.label.toLowerCase().replace(/\s+/g, '-'),
    childrenCount: item.children?.length || 0
  })));

  // Find the main category by matching the value
  // First try exact match on normalized label
  let mainCategory = menuTree.find(item => {
    const normalizedLabel = item.label.toLowerCase().replace(/\s+/g, '-');
    return normalizedLabel === normalizedValue;
  });

  // If no exact match, try matching without hyphens
  if (!mainCategory) {
    const normalizedValueNoHyphens = normalizedValue.replace(/-/g, '');
    mainCategory = menuTree.find(item => {
      const normalizedLabelNoHyphens = item.label.toLowerCase().replace(/\s+/g, '');
      return normalizedLabelNoHyphens === normalizedValueNoHyphens;
    });
  }

  // If still no match, try case-insensitive label match
  if (!mainCategory) {
    mainCategory = menuTree.find(item => {
      return item.label.toLowerCase() === normalizedValue.replace(/-/g, ' ');
    });
  }

  console.log('🔍 getSubCategories - Found category:', mainCategory ? mainCategory.label : 'NOT FOUND');
  console.log('🔍 getSubCategories - Category children:', mainCategory?.children?.map(c => c.label) || []);

  if (!mainCategory || !mainCategory.children || mainCategory.children.length === 0) {
    console.log('🔍 getSubCategories - No children found for category');
    return [];
  }

  const subcategories = mainCategory.children
    .filter(child => child.is_active)
    .map(child => ({
      value: child.label.toLowerCase().replace(/\s+/g, '-'),
      label: child.label
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  console.log('🔍 getSubCategories - Returning subcategories:', subcategories);
  return subcategories;
}

/**
 * Finds a menu item by its label (case-insensitive)
 */
export function findMenuItemByLabel(menuTree: MenuItem[], label: string): MenuItem | null {
  if (!label) return null;

  const normalizedLabel = label.toLowerCase().trim();

  function search(items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.label.toLowerCase() === normalizedLabel) {
        return item;
      }
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  return search(menuTree);
}

/**
 * Gets all category options in a flat structure for backward compatibility
 */
export function getAllCategoryOptions(menuTree: MenuItem[]): CategoryOption[] {
  const options: CategoryOption[] = [];

  function traverse(items: MenuItem[]) {
    items.forEach(item => {
      if (item.is_active) {
        options.push({
          value: item.label.toLowerCase().replace(/\s+/g, '-'),
          label: item.label
        });
        if (item.children) {
          traverse(item.children);
        }
      }
    });
  }

  traverse(menuTree);
  return options;
}

