import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

interface MenuItem {
  id: string
  label: string
  href: string | null
  parent_id: string | null
  order_index: number
  level: number
  is_active: boolean
  is_header: boolean
  icon: string | null
  description: string | null
  children?: MenuItem[]
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all menu items
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Error fetching menu items:', error)
      
      // If table doesn't exist, return static menu as fallback
      if (error.message.includes('relation "menu_items" does not exist')) {
        console.log('Menu items table not found, returning static menu')
        return NextResponse.json(getStaticMenu())
      }
      
      throw error
    }

    if (!menuItems || menuItems.length === 0) {
      // Return static menu as fallback if no menu items found
      console.log('No menu items found, returning static menu')
      return NextResponse.json(getStaticMenu())
    }

    // Build hierarchical menu structure
    const menuMap = new Map<string, MenuItem>()
    const rootItems: MenuItem[] = []

    // First pass: create all items
    menuItems.forEach((item: any) => {
      menuMap.set(item.id, {
        ...item,
        children: []
      })
    })

    // Second pass: build hierarchy
    menuItems.forEach((item: any) => {
      const menuItem = menuMap.get(item.id)!
      
      if (item.parent_id && menuMap.has(item.parent_id)) {
        // Add as child
        menuMap.get(item.parent_id)!.children!.push(menuItem)
      } else {
        // Add as root item
        rootItems.push(menuItem)
      }
    })

    // Sort children within each item by order_index, then recursively sort their children
    const sortChildren = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => ({
        ...item,
        children: item.children && item.children.length > 0 
          ? sortChildren(item.children.sort((a, b) => a.order_index - b.order_index))
          : undefined
      })).sort((a, b) => a.order_index - b.order_index)
    }

    const sortedMenu = sortChildren(rootItems)

    return NextResponse.json(sortedMenu)
  } catch (error) {
    console.error('Error in menu GET route:', error)
    // Return static menu as fallback on error
    return NextResponse.json(getStaticMenu())
  }
}

// Static fallback menu (current hardcoded structure)
function getStaticMenu() {
  return [
    {
      id: 'static-all-products',
      label: 'All Products',
      href: '/products',
      children: [
        { id: 'static-new-arrivals', label: 'New Arrivals', href: '/products/new', description: 'Latest additions' },
        { id: 'static-best-sellers', label: 'Best Sellers', href: '/products?sort=bestseller', description: 'Most popular' },
        { id: 'static-sale-items', label: 'Sale Items', href: '/sale', description: 'Discounted products' }
      ]
    },
    {
      id: 'static-men',
      label: 'Men',
      href: '/men',
      children: [
        { id: 'static-men-tshirts', label: 'T-Shirts', href: '/men?category=t-shirts', description: 'Casual tees' },
        { id: 'static-men-hoodies', label: 'Hoodies', href: '/men?category=hoodies', description: 'Comfortable hoodies' },
        { id: 'static-men-polo', label: 'Polo Shirts', href: '/men?category=polo', description: 'Professional polos' },
        { id: 'static-men-tank', label: 'Tank Tops', href: '/men?category=tank', description: 'Summer essentials' }
      ]
    },
    {
      id: 'static-women',
      label: 'Women',
      href: '/women',
      children: [
        { id: 'static-women-tshirts', label: 'T-Shirts', href: '/women?category=t-shirts', description: 'Casual tees' },
        { id: 'static-women-hoodies', label: 'Hoodies', href: '/women?category=hoodies', description: 'Cozy hoodies' },
        { id: 'static-women-tank', label: 'Tank Tops', href: '/women?category=tank', description: 'Summer styles' },
        { id: 'static-women-dresses', label: 'Dresses', href: '/women?category=dresses', description: 'Elegant dresses' }
      ]
    },
    {
      id: 'static-kids',
      label: 'Kids',
      href: '/kids',
      children: [
        { id: 'static-kids-tshirts', label: 'T-Shirts', href: '/kids?category=t-shirts', description: 'Youth tees' },
        { id: 'static-kids-hoodies', label: 'Hoodies', href: '/kids?category=hoodies', description: 'Youth hoodies' },
        { id: 'static-kids-school', label: 'School Wear', href: '/kids?category=school', description: 'School apparel' }
      ]
    },
    {
      id: 'static-accessories',
      label: 'Accessories',
      href: '/accessories',
      children: [
        { id: 'static-accessories-caps', label: 'Caps & Hats', href: '/accessories?category=caps', description: 'Headwear' },
        { id: 'static-accessories-bags', label: 'Bags', href: '/accessories?category=bags', description: 'Carry essentials' },
        { id: 'static-accessories-mugs', label: 'Mugs', href: '/accessories?category=mugs', description: 'Drinkware' },
        { id: 'static-accessories-phone', label: 'Phone Cases', href: '/accessories?category=phone', description: 'Device protection' }
      ]
    },
    {
      id: 'static-custom-printing',
      label: 'Custom Printing',
      href: '/custom-printing',
      children: [
        { id: 'static-custom-tshirts', label: 'T-Shirts', href: '/custom-printing?category=t-shirts', description: 'Custom tees' },
        { id: 'static-custom-hoodies', label: 'Hoodies', href: '/custom-printing?category=hoodies', description: 'Custom hoodies' },
        { id: 'static-custom-mugs', label: 'Mugs', href: '/custom-printing?category=mugs', description: 'Custom mugs' },
        { id: 'static-custom-bags', label: 'Bags', href: '/custom-printing?category=bags', description: 'Custom bags' }
      ]
    },
    {
      id: 'static-school-events',
      label: 'School Events',
      href: '/school-events',
      children: [
        { id: 'static-school-sports', label: 'Sports Day', href: '/school-events?event=sports', description: 'Athletic events' },
        { id: 'static-school-graduation', label: 'Graduation', href: '/school-events?event=graduation', description: 'Ceremony wear' },
        { id: 'static-school-field-trip', label: 'Field Trips', href: '/school-events?event=field-trip', description: 'Group apparel' },
        { id: 'static-school-fundraiser', label: 'Fundraisers', href: '/school-events?event=fundraiser', description: 'Event merchandise' }
      ]
    },
    {
      id: 'static-blog',
      label: 'Blog',
      href: '/blog'
    }
  ]
}
