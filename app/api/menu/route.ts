import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import {
  getMotarroStaticMenu,
  isLegacyMenu,
  type StaticMenuItem,
} from '@/lib/menu/static-motarro-menu'

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
        return NextResponse.json(getMotarroStaticMenu())
      }
      
      throw error
    }

    if (!menuItems || menuItems.length === 0) {
      // Return static menu as fallback if no menu items found
      console.log('No menu items found, returning static menu')
      return NextResponse.json(getMotarroStaticMenu())
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

    if (isLegacyMenu(sortedMenu as StaticMenuItem[])) {
      console.log('Legacy Apparely menu detected in database — serving MOTARRO static menu')
      return NextResponse.json(getMotarroStaticMenu())
    }

    return NextResponse.json(sortedMenu)
  } catch (error) {
    console.error('Error in menu GET route:', error)
    // Return static menu as fallback on error
    return NextResponse.json(getMotarroStaticMenu())
  }
}
