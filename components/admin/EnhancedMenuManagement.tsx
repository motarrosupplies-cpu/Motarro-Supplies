"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripVertical, Plus, Trash2, Edit, ChevronDown, ChevronRight, Folder, FileText, Link, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AVAILABLE_MENU_PAGES } from "@/lib/admin/available-menu-pages"

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
  meta_title: string | null
  meta_description: string | null
  children?: MenuItem[]
  category_id?: string | null
  category_name?: string | null
  filter_keywords?: string | null
}

interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  level: number
  order_index: number
  is_active: boolean
}

export function EnhancedMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [menuLoadError, setMenuLoadError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  // Add item state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmenuMode, setIsSubmenuMode] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemHref, setNewItemHref] = useState("")
  const [newItemParent, setNewItemParent] = useState<string>("none")
  const [newItemIsHeader, setNewItemIsHeader] = useState(false)
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<string>("none")
  const [newItemFilterKeywords, setNewItemFilterKeywords] = useState("")
  
  // Edit item state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editLabel, setEditLabel] = useState("")
  const [editHref, setEditHref] = useState("")
  const [editParent, setEditParent] = useState<string>("none")
  const [editIsHeader, setEditIsHeader] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState<string>("none")
  const [editIsActive, setEditIsActive] = useState(true)
  const [editFilterKeywords, setEditFilterKeywords] = useState("")
  
  // Category management modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setMenuLoadError(null)
      console.log("Fetching menu items...")
      const response = await fetch("/api/admin/menu-items?t=" + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Menu items API error:", errorData)
        throw new Error(`Failed to fetch menu items: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      console.log("Menu items fetched successfully:", data)
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      const message = error instanceof Error ? error.message : 'Failed to fetch menu items'
      setMenuLoadError(message)
      setMenuItems([])
    }
  }

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...")
      const response = await fetch("/api/admin/categories?t=" + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Categories API error:", errorData)
        throw new Error(`Failed to fetch categories: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      console.log("Categories fetched successfully:", data)
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Set empty array to prevent further errors
      setCategories([])
    }
  }

  const buildTree = (items: MenuItem[]): MenuItem[] => {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("buildTree: items is not a valid array:", items)
        return []
      }
      
      const map = new Map<string, MenuItem & { children: MenuItem[] }>()
      const roots: MenuItem[] = []
      
      items.forEach(item => {
        if (item && item.id) {
          map.set(item.id, { ...item, children: [] })
        } else {
          console.warn("buildTree: skipping invalid item:", item)
        }
      })
      
      map.forEach(item => {
        if (item.parent_id) {
          const parent = map.get(item.parent_id)
          if (parent) parent.children.push(item)
        } else {
          roots.push(item)
        }
      })
      
      // Sort children by order_index
      function sortTree(nodes: MenuItem[]) {
        nodes.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        nodes.forEach(n => n.children && sortTree(n.children))
      }
      sortTree(roots)
      return roots
    } catch (error) {
      console.error("Error in buildTree:", error)
      return []
    }
  }

  const getParentMenus = (items: MenuItem[], excludeId?: string) => {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("getParentMenus: items is not a valid array:", items)
        return []
      }
      // Filter for top-level items (level 0 or parent_id is null) that are active
      // These are the main categories that can be parents for submenu items
      return items.filter(i => 
        i && 
        i.id && 
        i.is_active !== false && // Only active items
        (i.level === 0 || i.parent_id === null) && // Top-level items only
        i.id !== excludeId // Exclude the current item if editing
      ).sort((a, b) => {
        // Sort by order_index, then by label
        if (a.order_index !== b.order_index) {
          return (a.order_index || 0) - (b.order_index || 0)
        }
        return (a.label || '').localeCompare(b.label || '')
      })
    } catch (error) {
      console.error("Error in getParentMenus:", error)
      return []
    }
  }

  const handleAddItem = async () => {
    if (!newItemLabel) return
    
    // Validate required fields for submenu mode
    if (isSubmenuMode) {
      if (newItemParent === "none") {
        alert("Please select a parent menu for the submenu item")
        return
      }
      if (!newItemFilterKeywords || newItemFilterKeywords.trim() === "") {
        alert("Please enter filter keywords for the submenu item")
        return
      }
    }
    
    try {
      console.log("Starting to add menu item...")
      console.log("Current menuItems:", menuItems)
      
      // Convert "none" values to null for API
      const parentId = newItemParent === "none" ? null : newItemParent
      const categoryId = newItemCategory === "none" ? null : newItemCategory
      
      console.log("Form data:", {
        label: newItemLabel,
        href: newItemHref || null,
        parent_id: parentId,
        is_header: newItemIsHeader,
        description: newItemDescription || null,
        order_index: menuItems.filter(i => i.parent_id === parentId).length,
        level: parentId ? (menuItems.find(i => i.id === parentId)?.level || 0) + 1 : 0
      })
      
      const requestBody: any = {
        label: newItemLabel,
        href: newItemHref || null,
        parent_id: parentId,
        is_header: newItemIsHeader,
        description: newItemDescription || null,
        order_index: menuItems.filter(i => i.parent_id === parentId).length,
        level: parentId ? (menuItems.find(i => i.id === parentId)?.level || 0) + 1 : 0
      }
      
      // Add filter_keywords for submenu mode
      if (isSubmenuMode && newItemFilterKeywords) {
        requestBody.filter_keywords = newItemFilterKeywords.trim()
      }
      
      console.log("Request body:", requestBody)
      
      const response = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store',
        body: JSON.stringify(requestBody)
      })
      
      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to add menu item:", errorData)
        throw new Error(`Failed to add menu item: ${errorData.error || response.statusText}`)
      }
      
      const newItem = await response.json()
      console.log("Menu item added successfully:", newItem)
      
      await fetchMenuItems()
      resetAddForm()
      setIsAddModalOpen(false)
      setIsSubmenuMode(false)
    } catch (error) {
      console.error("Error adding menu item:", error)
      // Use a more user-friendly error display instead of alert
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error("User-friendly error message:", errorMessage)
      // You could set an error state here instead of using alert
      alert(`Failed to add menu item: ${errorMessage}`)
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setEditLabel(item.label)
    setEditHref(item.href || "")
    setEditParent(item.parent_id || "none")
    setEditIsHeader(item.is_header)
    setEditDescription(item.description || "")
    setEditCategory(item.category_id || "none")
    setEditIsActive(item.is_active)
    setEditFilterKeywords(item.filter_keywords || "")
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !editLabel) return
    
    try {
      // Convert "none" values to null for API
      const parentId = editParent === "none" ? null : editParent
      const categoryId = editCategory === "none" ? null : editCategory
      
      const requestBody: any = {
        label: editLabel,
        href: editHref || null,
        parent_id: parentId,
        is_header: editIsHeader,
        description: editDescription || null,
        is_active: editIsActive
      }
      
      // Include filter_keywords if it's not empty
      if (editFilterKeywords && editFilterKeywords.trim()) {
        requestBody.filter_keywords = editFilterKeywords.trim()
      }
      
      const response = await fetch(`/api/admin/menu-items/${editingItem.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store',
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) throw new Error("Failed to update menu item")
      
      await fetchMenuItems()
      setEditingItem(null)
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating menu item:", error)
    }
  }

  const resetAddForm = () => {
    setNewItemLabel("")
    setNewItemHref("")
    setNewItemParent("none")
    setNewItemIsHeader(false)
    setNewItemDescription("")
    setNewItemCategory("none")
    setNewItemFilterKeywords("")
  }
  
  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryName("")
    setCategoryDescription("")
    setShowAddCategoryForm(false)
  }
  
  const handleOpenCategoryModal = () => {
    resetCategoryForm()
    setIsCategoryModalOpen(true)
  }
  
  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryDescription(category.description || "")
    setIsCategoryModalOpen(true)
  }
  
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error("Failed to delete category")
      
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
    }
  }
  
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required")
      return
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          cache: 'no-store',
          body: JSON.stringify({
            name: categoryName.trim(),
            description: categoryDescription || null
          })
        })
        
        if (!response.ok) throw new Error("Failed to update category")
      } else {
        // Create new category
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: 'no-store',
          body: JSON.stringify({
            name: categoryName.trim(),
            description: categoryDescription || null
          })
        })
        
        if (!response.ok) throw new Error("Failed to create category")
      }
      
      await fetchCategories()
      if (editingCategory) {
        setEditingCategory(null)
        setIsCategoryModalOpen(false)
        resetCategoryForm()
      } else {
        // For new categories, just hide the form and reset
        setShowAddCategoryForm(false)
        setCategoryName("")
        setCategoryDescription("")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Failed to save category")
    }
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return
    
    console.log('Reorder result:', result)
    
    // Get all top-level items (no parent_id)
    const topLevelItems = menuItems.filter(item => !item.parent_id)
    const reorderedItems = Array.from(topLevelItems)
    
    // Perform the reorder
    const [movedItem] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, movedItem)
    
    // Update order_index for all top-level items
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order_index: index
    }))
    
    try {
      const response = await fetch('/api/admin/menu-items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reorder items')
      }
      
      // Refresh menu items to show new order
      await fetchMenuItems()
    } catch (error) {
      console.error('Error reordering items:', error)
      alert(`Failed to reorder items: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteItem = async (id: string, label: string) => {
    if (!window.confirm(`Delete "${label}" and all its sub-items?`)) return
    
    // Optimistically update the UI immediately
    const updatedItems = menuItems.filter(item => item.id !== id && item.parent_id !== id)
    setMenuItems(updatedItems)
    
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE",
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      
      if (!response.ok) {
        // If delete failed, restore the original state and show error
        await fetchMenuItems()
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete menu item")
      }
      
      // Refresh to ensure consistency, but UI is already updated
      await fetchMenuItems()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      alert(`Failed to delete menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Restore original state on error
      await fetchMenuItems()
    }
  }

  const renderMenuItem = (
    item: MenuItem, 
    level: number = 0, 
    index: number = 0,
    provided?: any
  ) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div className="border rounded-lg mb-2 bg-white">
        <div 
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 ${level > 0 ? 'ml-2 sm:ml-6' : ''}`}
          style={{ marginLeft: level > 0 ? `${Math.min(level * 12, 48)}px` : undefined }}
        >
          {/* Drag Handle - Spread draggable props here */}
          {provided && (
            <div 
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="cursor-grab text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          {!provided && (
            <div className="cursor-grab text-gray-400 hover:text-gray-600">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {/* Icon */}
          <span className="text-gray-500">
            {item.is_header ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </span>
          
          {/* Label and Badges Container */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-1 sm:mb-0">
              <span className="font-medium truncate">{item.label}</span>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-0">
              {item.is_header && (
                <Badge variant="secondary" className="text-xs">Header</Badge>
              )}
              {item.href && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Link className="h-3 w-3" />
                  Page
                </Badge>
              )}
              {!item.is_active && (
                <Badge variant="destructive" className="text-xs">Inactive</Badge>
              )}
              {item.category_name && (
                <Badge variant="default" className="text-xs truncate max-w-[100px]">{item.category_name}</Badge>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1 ml-auto sm:ml-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleEditItem(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleDeleteItem(item.id, item.label)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && item.children && (
          <Droppable droppableId={`children-${item.id}`} type="MENU">
            {(provided) => (
              <div 
                className="border-t"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {item.children!.map((child, index) => (
                  <Draggable key={child.id} draggableId={child.id} index={index}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        {renderMenuItem(child, level + 1, index, provided)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    )
  }

  const treeData = buildTree(menuItems) || []

  return (
    <div className="space-y-6">
      {menuLoadError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {menuLoadError}
        </div>
      ) : null}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold break-words">Enhanced Menu Management</h2>
          <p className="text-sm sm:text-base text-gray-600 break-words">Manage your website navigation structure with deep hierarchies</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open)
            if (!open) setIsSubmenuMode(false)
          }}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full sm:w-auto" onClick={() => {
                setIsAddModalOpen(true)
                setIsSubmenuMode(false)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Menu Item</span>
                <span className="sm:hidden">Add Item</span>
              </Button>
            </DialogTrigger>
          
          <DialogContent className="max-w-[95vw] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isSubmenuMode ? 'Add Submenu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Menu Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., T-shirts, Father's Day, Gaming"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    required
                  />
                </div>
                
                {isSubmenuMode && (
                  <div>
                    <Label htmlFor="parent">Parent Menu *</Label>
                    <Select value={newItemParent} onValueChange={(v) => setNewItemParent(v)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Parent Menu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Select a parent menu</SelectItem>
                        {getParentMenus(menuItems).map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select the parent menu item for this submenu
                    </p>
                  </div>
                )}

                <div className={isSubmenuMode ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                  {!isSubmenuMode && (
                    <div>
                      <Label htmlFor="parent">Parent Menu</Label>
                      <Select value={newItemParent} onValueChange={(v) => setNewItemParent(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="No Parent (Primary)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Parent (Primary)</SelectItem>
                          {getParentMenus(menuItems).map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {isSubmenuMode ? (
                    <div>
                      <Label htmlFor="filterKeywords">Filter Keywords *</Label>
                      <Input
                        id="filterKeywords"
                        placeholder="e.g., t-shirt, hoodie, polo"
                        value={newItemFilterKeywords}
                        onChange={(e) => setNewItemFilterKeywords(e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter keywords separated by commas. Products matching these keywords will appear in this submenu.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="category">Product Category</Label>
                      <Select value={newItemCategory} onValueChange={(v) => setNewItemCategory(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="No Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {categories && categories.length > 0 ? (
                            categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {categories && categories.length === 0 && (
                        <div className="text-sm text-gray-500 mt-2">
                          <p className="mb-2">No product categories available.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddModalOpen(false)
                              handleOpenCategoryModal()
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Create Your First Category
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {!isSubmenuMode && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isHeader"
                      checked={newItemIsHeader}
                      onCheckedChange={setNewItemIsHeader}
                    />
                    <Label htmlFor="isHeader">This is a header/category (no direct link)</Label>
                  </div>
                )}
                
                {!newItemIsHeader && !isSubmenuMode && (
                  <div>
                    <Label htmlFor="href">Page Link</Label>
                    <Select value={newItemHref} onValueChange={setNewItemHref}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MENU_PAGES.map(page => (
                          <SelectItem key={page.href} value={page.href}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {!isSubmenuMode && (
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this menu item"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                    setIsAddModalOpen(false)
                    setIsSubmenuMode(false)
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">{isSubmenuMode ? 'Add Submenu Item' : 'Add Menu Item'}</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => {
            // Show simplified add modal for submenu items (title + category only)
            setIsSubmenuMode(true)
            setIsAddModalOpen(true)
            setNewItemParent("none") // User must select a parent
            setNewItemIsHeader(false) // Submenus have links
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Submenu</span>
          <span className="sm:hidden">Add Sub</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleOpenCategoryModal}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
        </div>
      </div>

      {/* Menu Tree Display */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Structure</CardTitle>
          <p className="text-sm text-gray-600">
            Drag and drop to reorder, click to expand/collapse categories
          </p>
        </CardHeader>
        <CardContent>
          {treeData && treeData.length > 0 ? (
            <DragDropContext onDragEnd={handleReorder}>
              <Droppable droppableId="menu-tree" type="MENU">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {treeData.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            {renderMenuItem(item, 0, index, provided)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No menu items found.</p>
              <p className="text-sm">Click "Add Menu Item" to create your first navigation item.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editLabel">Menu Label *</Label>
                <Input
                  id="editLabel"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editParent">Parent Menu</Label>
                  <Select value={editParent} onValueChange={(v) => setEditParent(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No Parent (Primary)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent (Primary)</SelectItem>
                      {getParentMenus(menuItems, editingItem?.id).map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editCategory">Product Category</Label>
                  <Select value={editCategory} onValueChange={(v) => setEditCategory(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories && categories.length > 0 ? (
                        categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {categories && categories.length === 0 && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p className="mb-2">No product categories available.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditModalOpen(false)
                          handleOpenCategoryModal()
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Your First Category
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="editFilterKeywords">Filter Keywords (Optional)</Label>
                <Input
                  id="editFilterKeywords"
                  value={editFilterKeywords}
                  onChange={(e) => setEditFilterKeywords(e.target.value)}
                  placeholder="e.g., t-shirt, casual, summer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter keywords separated by commas to filter products
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editIsHeader"
                  checked={editIsHeader}
                  onCheckedChange={setEditIsHeader}
                />
                <Label htmlFor="editIsHeader">This is a header/category (no direct link)</Label>
              </div>
              
              {!editIsHeader && (
                <div>
                  <Label htmlFor="editHref">Page Link</Label>
                  <Select value={editHref} onValueChange={setEditHref}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MENU_PAGES.map(page => (
                        <SelectItem key={page.href} value={page.href}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="editDescription">Description (Optional)</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editIsActive"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
                <Label htmlFor="editIsActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Category Management Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Product Categories'}
            </DialogTitle>
          </DialogHeader>
          
          {editingCategory ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., T-shirts, Hoodies, Accessories"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoryDescription">Description (Optional)</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCategoryModalOpen(false)
                    resetCategoryForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            // List Mode
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage product categories for your menu items</p>
                <Button onClick={() => {
                  setEditingCategory(null)
                  setCategoryName("")
                  setCategoryDescription("")
                  setShowAddCategoryForm(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No categories available</p>
                  <p className="text-sm mt-2">Click "Add Category" to create your first category</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map(category => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!editingCategory && showAddCategoryForm && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label htmlFor="newCategoryName">Category Name *</Label>
                    <Input
                      id="newCategoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g., T-shirts, Hoodies, Accessories"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newCategoryDescription">Description (Optional)</Label>
                    <Textarea
                      id="newCategoryDescription"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder="Brief description of this category"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddCategoryForm(false)
                        setCategoryName("")
                        setCategoryDescription("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCategory}>
                      Add Category
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 