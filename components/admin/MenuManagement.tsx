"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { AVAILABLE_MENU_PAGES } from "@/lib/admin/available-menu-pages"

interface MenuItem {
  id: string
  label: string
  href: string
  order: number
  parent_id: string | null
  children?: MenuItem[]
}

function buildTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem & { children: MenuItem[] }>();
  const roots: MenuItem[] = [];
  items.forEach(item => map.set(item.id, { ...item, children: [] }));
  map.forEach(item => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.children.push(item);
    } else {
      roots.push(item);
    }
  });
  // Sort children by order
  function sortTree(nodes: MenuItem[]) {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(n => n.children && sortTree(n.children));
  }
  sortTree(roots);
  return roots;
}

// Helper to get only parent/header menus (no href)
function getParentMenus(items: MenuItem[]) {
  return items.filter(i => !i.href)
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemHref, setNewItemHref] = useState("")
  const [newItemParent, setNewItemParent] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editHref, setEditHref] = useState("")
  const [editParent, setEditParent] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menu-items")
      if (!response.ok) throw new Error("Failed to fetch menu items")
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const handleAddItem = async () => {
    if (!newItemLabel) return // Only require label, not href
    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newItemLabel,
          href: newItemHref || null, // Allow null for parent/header
          parent_id: newItemParent,
          order: menuItems.filter(i => i.parent_id === newItemParent).length
        })
      })
      if (!response.ok) throw new Error("Failed to add menu item")
      await fetchMenuItems()
      setNewItemLabel("")
      setNewItemHref("")
      setNewItemParent(null)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding menu item:", error)
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setEditLabel(item.label)
    setEditHref(item.href)
    setEditParent(item.parent_id)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    if (!editLabel) return // Only require label
    try {
      const response = await fetch(`/api/admin/menu-items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel,
          href: editHref || null,
          parent_id: editParent
        })
      })
      if (!response.ok) throw new Error("Failed to update menu item")
      await fetchMenuItems()
      setEditingItem(null)
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating menu item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Delete this menu item and all its sub-items?")) return
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete menu item")
      await fetchMenuItems()
    } catch (error) {
      console.error("Error deleting menu item:", error)
    }
  }

  // Helper to flatten tree for DnD
  function flatten(items: MenuItem[], parentId: string | null = null, depth = 0): any[] {
    return items.flatMap((item, idx) => [
      { ...item, parentId, depth },
      ...(item.children ? flatten(item.children, item.id, depth + 1) : [])
    ])
  }

  // Helper to rebuild tree from flat list
  function rebuild(flat: any[]): MenuItem[] {
    const map = new Map<string, MenuItem & { children: MenuItem[] }>()
    flat.forEach(item => map.set(item.id, { ...item, children: [] }))
    const roots: MenuItem[] = []
    map.forEach(item => {
      if (item.parent_id) {
        const parent = map.get(item.parent_id)
        if (parent) parent.children.push(item)
      } else {
        roots.push(item)
      }
    })
    // Sort children by order
    function sortTree(nodes: MenuItem[]) {
      nodes.sort((a, b) => a.order - b.order)
      nodes.forEach(n => n.children && sortTree(n.children))
    }
    sortTree(roots)
    return roots
  }

  // DnD handler
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const flat = flatten(buildTree(menuItems))
    const sourceIdx = result.source.index
    const destIdx = result.destination.index
    const dragged = flat[sourceIdx]
    const over = flat[destIdx]
    let newParentId = over.parentId
    let newDepth = over.depth
    // If dropped on a different parent, update parent_id
    if (result.destination.droppableId !== result.source.droppableId) {
      newParentId = result.destination.droppableId === "root" ? null : result.destination.droppableId
      newDepth = flat.find(f => f.id === newParentId)?.depth + 1 || 0
    }
    // Remove from old position
    flat.splice(sourceIdx, 1)
    // Insert at new position
    flat.splice(destIdx, 0, { ...dragged, parent_id: newParentId, depth: newDepth })
    // Recalculate order for siblings
    let order = 0
    for (let i = 0; i < flat.length; i++) {
      if (flat[i].parent_id === newParentId) {
        flat[i].order = order++
      }
    }
    // Update backend for all affected items
    await Promise.all(flat.map(item =>
      fetch(`/api/admin/menu-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: item.label,
          href: item.href,
          parent_id: item.parent_id,
          order: item.order
        })
      })
    ))
    await fetchMenuItems()
  }

  // Render flat list for DnD
  const flatMenu = flatten(buildTree(menuItems))

  // Refactor DnD rendering for nested tree
  function renderTreeDnD(items: MenuItem[], parentId: string | null = null, level = 0) {
    return (
      <Droppable droppableId={parentId || "root"} type="MENU">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      marginLeft: level * 24,
                      background: snapshot.isDragging ? '#f3f4f6' : undefined,
                      borderRadius: 6,
                      marginBottom: 8,
                      boxShadow: snapshot.isDragging ? '0 2px 8px #0001' : undefined
                    }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-full">
                      <span {...provided.dragHandleProps} className="cursor-grab"><GripVertical className="h-4 w-4" /></span>
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.href || "(Header)"}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {/* Render children recursively if any */}
                    {item.children && item.children.length > 0 && (
                      <div>{renderTreeDnD(item.children, item.id, level + 1)}</div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Menu Label (e.g. Men)"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                />
                <Select value={newItemHref} onValueChange={setNewItemHref}>
                  <option value="">(Header Only)</option>
                  {AVAILABLE_MENU_PAGES.map(page => (
                    <option key={page.href} value={page.href}>{page.label}</option>
                  ))}
                </Select>
                <Select value={newItemParent ?? ""} onValueChange={v => setNewItemParent(v || null)}>
                  <option value="">No Parent (Primary)</option>
                  {getParentMenus(menuItems).map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </Select>
                <Button onClick={handleAddItem}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                <Select value={editHref} onValueChange={setEditHref}>
                  <option value="">(Header Only)</option>
                  {AVAILABLE_MENU_PAGES.map(page => (
                    <option key={page.href} value={page.href}>{page.label}</option>
                  ))}
                </Select>
                <Select value={editParent ?? ""} onValueChange={v => setEditParent(v || null)}>
                  <option value="">No Parent (Primary)</option>
                  {getParentMenus(menuItems).filter(i => i.id !== editingItem?.id).map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </Select>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              {renderTreeDnD(buildTree(menuItems))}
            </DragDropContext>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 